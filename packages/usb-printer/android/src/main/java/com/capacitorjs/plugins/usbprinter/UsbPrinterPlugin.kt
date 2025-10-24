package com.capacitorjs.plugins.usbprinter

import android.app.PendingIntent
import android.content.Intent
import android.hardware.usb.*
import android.util.Base64
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.PluginMethod
import kotlinx.coroutines.flow.MutableSharedFlow
import java.nio.charset.Charset

@CapacitorPlugin(name = "UsbPrinter")
class UsbPrinterPlugin : Plugin() {

    companion object {
        const val ACTION_USB_PERMISSION = "com.capacitorjs.plugins.usbprinter.USB_PERMISSION"
        const val EPSON_VENDOR = 0x04B8 // EPSON
        val permissionResult = MutableSharedFlow<Boolean>(replay = 1)
    }

    private val manager by lazy { context.getSystemService(android.content.Context.USB_SERVICE) as UsbManager }
    private var conn: UsbDeviceConnection? = null
    private var endpointOut: UsbEndpoint? = null
    private var iface: UsbInterface? = null
    private var currentDevice: UsbDevice? = null

    @PluginMethod
    fun listDevices(call: PluginCall) {
        try {
            Logger.info("USB Printer - 开始获取设备列表")

            val deviceList = manager.deviceList
            Logger.info("USB Printer - 找到 ${deviceList.size} 个USB设备")

            deviceList.values.forEachIndexed { index, device ->
                Logger.info("USB Printer - 设备$index: ${device.deviceName}, VID: ${device.vendorId}, PID: ${device.productId}")
            }

            val devices = deviceList.values.map { d ->
                JSObject().apply {
                    put("vendorId", d.vendorId)
                    put("productId", d.productId)
                    put("deviceName", d.deviceName)
                    put("deviceId", d.deviceId)
                }
            }

            Logger.info("USB Printer - 成功处理设备列表，返回 ${devices.size} 个设备")
            call.resolve(JSObject().put("devices", devices))

        } catch (e: Exception) {
            Logger.error("USB Printer - listDevices 错误: ${e.message}", e)
            call.reject("获取设备列表失败: ${e.message}")
        }
    }

    @PluginMethod
    fun requestPermission(call: PluginCall) {
        val vid = call.getInt("vendorId") ?: EPSON_VENDOR
        val pid = call.getInt("productId")

        val dev = manager.deviceList.values.firstOrNull { d ->
            if (pid != null) d.vendorId == vid && d.productId == pid else d.vendorId == vid
        } ?: return call.reject("device not found")

        val pi = PendingIntent.getBroadcast(
            context,
            0,
            Intent(ACTION_USB_PERMISSION),
            PendingIntent.FLAG_IMMUTABLE
        )
        manager.requestPermission(dev, pi)

        call.resolve(JSObject().put("granted", manager.hasPermission(dev)))
    }

    @PluginMethod
    fun connect(call: PluginCall) {
        val vid = call.getInt("vendorId") ?: EPSON_VENDOR
        val pid = call.getInt("productId")
        val dev = manager.deviceList.values.firstOrNull { d ->
            if (pid != null) d.vendorId == vid && d.productId == pid else d.vendorId == vid
        } ?: return call.reject("device not found")

        if (!manager.hasPermission(dev)) return call.reject("no permission")

        for (iIdx in 0 until dev.interfaceCount) {
            val i = dev.getInterface(iIdx)
            for (eIdx in 0 until i.endpointCount) {
                val ep = i.getEndpoint(eIdx)
                if (ep.direction == UsbConstants.USB_DIR_OUT && ep.type == UsbConstants.USB_ENDPOINT_XFER_BULK) {
                    val c = manager.openDevice(dev) ?: return call.reject("open device failed")
                    if (!c.claimInterface(i, true)) return call.reject("claim interface failed")
                    currentDevice = dev
                    conn = c
                    iface = i
                    endpointOut = ep
                    return call.resolve(JSObject().put("connected", true))
                }
            }
        }
        call.reject("no bulk out endpoint")
    }

    @PluginMethod
    fun printText(call: PluginCall) {
        val text = call.getString("text") ?: return call.reject("text required")
        val encoding = (call.getString("encoding") ?: "GBK").uppercase()
        val feed = call.getInt("feed") ?: 3
        val cut = call.getBoolean("cut") ?: true

        val ok = sendEscPosTextForEpson(text, encoding, feed, cut)
        call.resolve(JSObject().put("ok", ok))
    }

    @PluginMethod
    fun printRaw(call: PluginCall) {
        val b64 = call.getString("dataBase64") ?: return call.reject("dataBase64 required")
        val data = Base64.decode(b64, Base64.DEFAULT)
        call.resolve(JSObject().put("ok", bulkWrite(data)))
    }

    @PluginMethod
    fun disconnect(call: PluginCall) {
        try {
            iface?.let { conn?.releaseInterface(it) }
        } catch (_: Throwable) {
        }
        try {
            conn?.close()
        } catch (_: Throwable) {
        }
        conn = null; endpointOut = null; iface = null; currentDevice = null
        call.resolve()
    }

    private fun charset(encoding: String): Charset =
        when (encoding) {
            "GBK", "GB2312" -> Charset.forName("GBK")
            else -> Charsets.UTF_8
        }

    private fun sendEscPosTextForEpson(
        text: String,
        enc: String,
        feed: Int,
        cut: Boolean
    ): Boolean {
        if (conn == null || endpointOut == null) return false

        val init = byteArrayOf(0x1B, 0x40)
        val alignLeft = byteArrayOf(0x1B, 0x61, 0x00)
        val codepageCN = byteArrayOf(0x1B, 0x74, 0x00)
        val content = (text + "\n").toByteArray(charset(enc))
        val feeds = ByteArray(feed) { 0x0A }
        val cutCmd = byteArrayOf(0x1D, 0x56, 0x42, 0x00)

        return bulkWrite(init) &&
            bulkWrite(alignLeft) &&
            bulkWrite(codepageCN) &&
            bulkWrite(content) &&
            bulkWrite(feeds) &&
            (!cut || bulkWrite(cutCmd))
    }

    private fun bulkWrite(data: ByteArray): Boolean {
        val e = endpointOut ?: return false
        val c = conn ?: return false
        val sent = c.bulkTransfer(e, data, data.size, 3000)
        return sent == data.size
    }
}
