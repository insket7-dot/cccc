package com.capacitorjs.plugins.usbprinter;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;

import org.json.JSONObject;

import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;


@CapacitorPlugin(name = "UsbPrinter")
public class PrinterPlugin extends Plugin {
    private static final String TAG = "UsbPrinter";

    private UsbManager usbManager;
    private BroadcastReceiver usbReceiver;
    private PendingIntent permissionIntent;

    private UsbDevice pendingDevice;
    private PluginCall pendingCall;

    private String getPermissionAction() {
        return getContext().getPackageName() + ".USB_PERMISSION";
    }

    // 添加明确的公共构造函数
    public PrinterPlugin() {
        super();
    }

    @PluginMethod
    public void loadPlug(PluginCall call) {
        Log.d(TAG, "PrinterPlugin load 1 ");
//        super.load();
        Log.d(TAG, "PrinterPlugin load 2 ");
        usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
        permissionIntent = PendingIntent.getBroadcast(
            getContext(), 0, new Intent(getPermissionAction()), PendingIntent.FLAG_IMMUTABLE
        );

        IntentFilter filter = new IntentFilter();
        filter.addAction(getPermissionAction());
        filter.addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED);
        filter.addAction(UsbManager.ACTION_USB_DEVICE_DETACHED);

        usbReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context ctx, Intent intent) {
                String action = intent.getAction();
                Log.d(TAG, "onReceive action result  " + action + "," + "getPermissionAction=" + getPermissionAction());
                if (getPermissionAction().equals(action)) {
                    UsbDevice d = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                    boolean granted = intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false);
                    Log.d(TAG, "permission result for " + safeName(d) + " = " + granted);

                    // 某些 ROM 这里会给 d==null，但如果用户点了允许，hasPermission(目标) 会变为 true
                    if (!granted && d == null && pendingDevice != null && usbManager != null) {
                        try {
                            granted = usbManager.hasPermission(pendingDevice);
                        } catch (Throwable ignore) {
                        }
                    }

                    if (granted && pendingCall != null) {
                        final PluginCall call = pendingCall;
                        final UsbDevice dev = (d != null ? d : pendingDevice);
                        pendingCall = null;
                        pendingDevice = null;
                        new Thread(() -> doPrintWithFallback(call, dev)).start();
                    } else {
                        // 当前设备授权失败，自动尝试其它候选（比如从 GD32 切换到 EPSON）
                        if (pendingCall != null) {
                            PluginCall call = pendingCall;
                            pendingCall = null;
                            UsbDevice next = pickNextCandidateExcluding(pendingDevice);
                            pendingDevice = null;
                            if (next != null) {
                                Log.d(TAG, "try next candidate: " + safeName(next));
                                requestOrPrint(call, next);
                            } else {
                                call.reject("NO_PERMISSION");
                            }
                        }
                    }
                }
            }
        };
        //        getContext().registerReceiver(usbReceiver, filter);
        // 替换原来的 registerReceiver 调用
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // Android 14+ (API 34+)
            getContext().registerReceiver(usbReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            // Android 13 及以下
            getContext().registerReceiver(usbReceiver, filter);
        }

        // 调试：枚举设备
        Map<String, UsbDevice> map = usbManager != null ? usbManager.getDeviceList() : null;
        Log.d(TAG, "on load, device count=" + (map != null ? map.size() : -1));
        if (map != null) {
            for (UsbDevice d : map.values()) {
                Log.d(TAG, "dev " + dumpId(d) + " name=" + d.getDeviceName()
                    + " mfg=" + d.getManufacturerName() + " prod=" + d.getProductName());
            }
        }
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        if (usbReceiver != null) {
            try {
                getContext().unregisterReceiver(usbReceiver);
            } catch (Throwable ignore) {
            }
            usbReceiver = null;
        }
    }

    // ========== JS API ==========

    @PluginMethod
    public void printText(PluginCall call) {
        startPrint(call);
    }

    @PluginMethod
    public void printOrder(PluginCall call) {
        startPrint(call);
    }

    // ========== 流程：选设备 → 权限 → 打印 ==========

    private void startPrint(PluginCall call) {
        Log.d(TAG, ">>> startPrint called");

        // 允许 JS 点名设备（十进制）：preferredVendorId / preferredProductId
        Integer prefVid = null, prefPid = null;
        try {
            if (call.hasOption("preferredVendorId")) prefVid = call.getInt("preferredVendorId");
            if (call.hasOption("preferredProductId")) prefPid = call.getInt("preferredProductId");
        } catch (Throwable ignore) {
        }

        UsbDevice dev = (prefVid != null) ? pickByVidPid(prefVid, prefPid) : pickBestCandidate();
        if (dev == null) {
            call.reject("NO_USB_DEVICE");
            return;
        }
        requestOrPrint(call, dev);
    }

    private UsbDevice pickByVidPid(int vid, Integer pid) {
        if (usbManager == null) return null;
        Map<String, UsbDevice> map = usbManager.getDeviceList();
        if (map == null) return null;
        for (UsbDevice d : map.values()) {
            if (d.getVendorId() == vid && (pid == null || d.getProductId() == pid.intValue())) {
                return d;
            }
        }
        return null;
    }

    private void requestOrPrint(PluginCall call, UsbDevice dev) {
        boolean has = usbManager != null && usbManager.hasPermission(dev);
        Log.d(TAG, "target=" + safeName(dev) + " hasPermission=" + has);
        if (!has) {
            pendingDevice = dev;
            pendingCall = call;
            usbManager.requestPermission(dev, permissionIntent);
            Log.d(TAG, "requestPermission sent, wait for broadcast");
        } else {
            new Thread(() -> doPrintWithFallback(call, dev)).start();
        }
    }

    // 授权失败/被系统拒绝时，尝试其它候选
    private void doPrintWithFallback(PluginCall call, UsbDevice dev) {
        String res = tryPrint(call, dev);
        if ("OK".equals(res)) return;

        // 被拒绝或不支持端点时，自动尝试其它候选
        if ("NO_OUT_ENDPOINT".equals(res) || "OPEN_DEVICE_FAILED".equals(res)
            || "CLAIM_FAILED".equals(res) || "WRITE_FAILED".equals(res)
            || "NO_PERMISSION".equals(res)) {
            UsbDevice next = pickNextCandidateExcluding(dev);
            if (next != null) {
                Log.d(TAG, "fallback to next candidate: " + safeName(next));
                requestOrPrint(call, next);
                return;
            }
        }
        // 其它错误已在 tryPrint 里回调
    }

    private String tryPrint(PluginCall call, UsbDevice device) {
        // 1) 文本（优先 text；兼容 orderId/items）
        String text = call.getString("text", null);
        if (text == null) {
            String orderId = call.getString("orderId", "");
            JSArray items = call.getArray("items");
            StringBuilder sb = new StringBuilder();
            sb.append("*** ORDER ***\n").append(orderId).append("\n");
            if (items != null) {
                try {
                    for (int i = 0; i < items.length(); i++) {
                        JSONObject it = items.getJSONObject(i);
                        String name = it.optString("name", "");
                        int qty = it.optInt("qty", 1);
                        double price = it.optDouble("price", 0);
                        sb.append(name).append(" x").append(qty).append("  ￥").append(price).append("\n");
                    }
                } catch (Throwable ignore) {
                }
            }
            sb.append("\n");
            text = sb.toString();
        }

        UsbDeviceConnection conn = null;
        UsbInterface useIf = null;
        UsbEndpoint epOut = null;

        try {
            // 2) 找 bulk OUT 端点
            for (int i = 0; i < device.getInterfaceCount(); i++) {
                UsbInterface itf = device.getInterface(i);
                for (int e = 0; e < itf.getEndpointCount(); e++) {
                    UsbEndpoint ep = itf.getEndpoint(e);
                    if (ep.getType() == UsbConstants.USB_ENDPOINT_XFER_BULK
                        && ep.getDirection() == UsbConstants.USB_DIR_OUT) {
                        useIf = itf;
                        epOut = ep;
                        break;
                    }
                }
                if (epOut != null) break;
            }
            if (useIf == null || epOut == null) {
                Log.e(TAG, "no bulk OUT endpoint for " + safeName(device));
                call.reject("NO_OUT_ENDPOINT");
                return "NO_OUT_ENDPOINT";
            }

            // 3) 打开+claim
            conn = usbManager.openDevice(device);
            if (conn == null) {
                call.reject("OPEN_DEVICE_FAILED");
                return "OPEN_DEVICE_FAILED";
            }
            boolean claimed = conn.claimInterface(useIf, true);
            Log.d(TAG, "claimInterface=" + claimed + " ifClass=" + useIf.getInterfaceClass());
            if (!claimed) {
                call.reject("CLAIM_FAILED");
                return "CLAIM_FAILED";
            }

            // 4) 写入 —— 优先用 ESC/POS 位图打印（中文零乱码）
            try {
                // 统一先初始化
                byte[] init = new byte[]{0x1B, 0x40}; // ESC @
                int w0 = conn.bulkTransfer(epOut, init, init.length, 2000);

                // 渲染成位图并按 ESC/POS Raster 指令发送
                // 80mm 机型常见点宽 576（部分是 512/640），58mm 常见 384。你用 TM-T88VI，建议 576。
                int paperWidthDots = 576;  // 如发现右边截断，可试 512 或 640
                byte[] raster = renderTextToEscPosRaster(text, paperWidthDots);

                int wImg = 0;
                if (raster != null && raster.length > 0) {
                    wImg = conn.bulkTransfer(epOut, raster, raster.length, 10000);
                }

                // 走纸+切纸（不同机型可换为 1D 56 42 01等）
                byte[] feed = new byte[]{0x0A, 0x0A, 0x0A};
                byte[] cut = new byte[]{0x1D, 0x56, 0x42, 0x00}; // GS V 66 0
                int w1 = conn.bulkTransfer(epOut, feed, feed.length, 2000);
                int w2 = conn.bulkTransfer(epOut, cut, cut.length, 2000);
                Log.d(TAG, "bulk wrote init=" + w0 + " raster=" + wImg + " feed=" + w1 + " cut=" + w2);

                JSObject ret = new JSObject();
                ret.put("ok", true);
                ret.put("chosenVendorId", device.getVendorId());
                ret.put("chosenProductId", device.getProductId());
                ret.put("chosenName", safeName(device));
                call.resolve(ret);
                return "OK";
            } catch (Exception ex) {
                Log.e(TAG, "write exception", ex);
                call.reject("EX:" + ex.getMessage());
                return "EX";
            }
        } catch (SecurityException se) {
            // 某些系统会抛出安保异常（等价于无权限）
            Log.e(TAG, "security exception", se);
            call.reject("NO_PERMISSION");
            return "NO_PERMISSION";
        } catch (Exception ex) {
            Log.e(TAG, "print exception", ex);
            call.reject("EX:" + ex.getMessage());
            return "EX";
        } finally {
            try {
                if (conn != null && useIf != null) conn.releaseInterface(useIf);
            } catch (Throwable ignore) {
            }
            try {
                if (conn != null) conn.close();
            } catch (Throwable ignore) {
            }
        }
    }

    // ========== 设备挑选 ==========

    // 返回“最优”候选（EPSON/TM- > 其它 class=7 > class=255 > 名称命中 > 第一个）
    private UsbDevice pickBestCandidate() {
        List<UsbDevice> devices = listAll();
        if (devices.isEmpty()) return null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            devices.sort(bestComparator());
        }
        return devices.get(0);
    }

    // 从剩余设备里挑一个（排除已尝试的 dev）
    private UsbDevice pickNextCandidateExcluding(UsbDevice dev) {
        List<UsbDevice> devices = listAll();
        if (devices.isEmpty()) return null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            devices.removeIf(d -> sameDevice(d, dev));
        }
        if (devices.isEmpty()) return null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            devices.sort(bestComparator());
        }
        return devices.get(0);
    }

    private List<UsbDevice> listAll() {
        List<UsbDevice> out = new ArrayList<>();
        if (usbManager == null) return out;
        Map<String, UsbDevice> map = usbManager.getDeviceList();
        if (map == null) return out;
        out.addAll(map.values());
        return out;
    }

    // 按优先级排序：EPSON/TM-（且 class=7）最高，其次其它 class=7，再 class=255，再名字命中，再其它
    private Comparator<UsbDevice> bestComparator() {
        return (a, b) -> Integer.compare(rank(b), rank(a)); // rank 大者优先
    }

    private int rank(UsbDevice d) {
        String m = (d.getManufacturerName() != null ? d.getManufacturerName() : "").toLowerCase(Locale.US);
        String p = (d.getProductName() != null ? d.getProductName() : "").toLowerCase(Locale.US);

        boolean isEpson = m.contains("epson") || p.contains("tm-");
        boolean nameHit = isEpson || p.contains("printer") || p.contains("xprinter")
            || p.contains("gp-") || p.contains("pos") || p.contains("thermal");

        boolean hasClass7 = false;
        boolean hasClass255 = false;
        for (int i = 0; i < d.getInterfaceCount(); i++) {
            int cls = d.getInterface(i).getInterfaceClass();
            if (cls == 7) hasClass7 = true;
            if (cls == 255) hasClass255 = true;
        }

        int score = 0;
        if (isEpson && hasClass7) score += 2000;   // 强力优先 EPSON(Thermal)
        if (hasClass7) score += 500;
        if (hasClass255) score += 200;
        if (nameHit) score += 50;

        // 额外偏好 EPSON VendorId
        if (d.getVendorId() == 0x04B8) score += 300;

        // 轻微降低 GD32，避免默认选中它
        if (d.getVendorId() == 0x324F) score -= 150;

        return score;
    }

    // ========== 工具 ==========

    private static boolean sameDevice(UsbDevice a, UsbDevice b) {
        return a != null && b != null && a.getVendorId() == b.getVendorId() && a.getProductId() == b.getProductId();
    }

    private static String dumpId(UsbDevice d) {
        if (d == null) return "null";
        return String.format(Locale.US, "VID=0x%04x PID=0x%04x", d.getVendorId(), d.getProductId());
    }

    private static String safeName(UsbDevice d) {
        return d == null ? "null" : (d.getManufacturerName() + " " + d.getProductName() + " " + dumpId(d));
    }

    // ============== 位图渲染为 ESC/POS Raster 数据 ==============
    private byte[] renderTextToEscPosRaster(String text, int paperDots) {
        try {
            // 1) 用 Android 画布把中文文本渲染到位图（黑字白底）
            android.graphics.Paint paint = new android.graphics.Paint();
            paint.setAntiAlias(true);
            paint.setColor(android.graphics.Color.BLACK);
            paint.setTextSize(28f); // 字号可按需要调整（28~36 对 576 比较合适）
            paint.setTypeface(android.graphics.Typeface.create("sans-serif", android.graphics.Typeface.NORMAL));

            int padding = 16; // 左右留白
            int maxWidth = Math.max(200, paperDots - padding * 2);

            // 计算多行排版高度（使用 StaticLayout）
            android.text.TextPaint tp = new android.text.TextPaint(paint);
            android.text.StaticLayout sl = android.text.StaticLayout.Builder
                .obtain(text, 0, text.length(), tp, maxWidth)
                .setAlignment(android.text.Layout.Alignment.ALIGN_NORMAL)
                .setIncludePad(false)
                .build();

            int bmpW = paperDots;
            int bmpH = sl.getHeight() + padding * 2;

            android.graphics.Bitmap bmp = android.graphics.Bitmap.createBitmap(bmpW, bmpH, android.graphics.Bitmap.Config.ARGB_8888);
            android.graphics.Canvas canvas = new android.graphics.Canvas(bmp);
            canvas.drawColor(android.graphics.Color.WHITE);

            // 居左绘制文字区域
            canvas.save();
            canvas.translate(padding, padding);
            sl.draw(canvas);
            canvas.restore();

            // 2) 将 ARGB 位图转为 1bpp（黑=1，白=0），按 ESC/POS Raster 打包
            return bitmapToEscPosRaster(bmp);
        } catch (Throwable t) {
            Log.e(TAG, "renderTextToEscPosRaster error", t);
            return null;
        }
    }

    private byte[] bitmapToEscPosRaster(android.graphics.Bitmap bmp) {
        int width = bmp.getWidth();
        int height = bmp.getHeight();

        // 宽度按 8 像素对齐（每 8 像素 = 1 字节）
        int bytesPerRow = (width + 7) / 8;

        // ESC/POS: GS v 0 m xL xH yL yH [data]
        // m=0: 正常
        int totalData = bytesPerRow * height;
        int xL = bytesPerRow & 0xFF;
        int xH = (bytesPerRow >> 8) & 0xFF;
        int yL = height & 0xFF;
        int yH = (height >> 8) & 0xFF;

        byte[] header = new byte[]{0x1D, 0x76, 0x30, 0x00, (byte) xL, (byte) xH, (byte) yL, (byte) yH};
        byte[] body = new byte[totalData];

        int idx = 0;
        for (int y = 0; y < height; y++) {
            int bit = 7;
            int cur = 0;
            for (int x = 0; x < width; x++) {
                int color = bmp.getPixel(x, y);
                int r = (color >> 16) & 0xFF;
                int g = (color >> 8) & 0xFF;
                int b = color & 0xFF;
                int gray = (r + g + b) / 3;
                boolean isBlack = gray < 160; // 阈值可微调（小于此值当作黑色）
                if (isBlack) {
                    cur |= (1 << bit);
                }
                bit--;
                if (bit < 0) {
                    body[idx++] = (byte) cur;
                    bit = 7;
                    cur = 0;
                }
            }
            if (bit != 7) {
                body[idx++] = (byte) cur;
            }
        }

        byte[] out = new byte[header.length + body.length];
        System.arraycopy(header, 0, out, 0, header.length);
        System.arraycopy(body, 0, out, header.length, body.length);
        return out;
    }
}
