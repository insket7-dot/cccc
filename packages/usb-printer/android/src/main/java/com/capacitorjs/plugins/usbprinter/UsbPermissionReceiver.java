package com.capacitorjs.plugins.usbprinter;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** 如使用内联 Receiver，可删除本文件与 Manifest 中对应 <receiver> */
public class UsbPermissionReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        // 不做具体处理，推荐使用 PrinterPlugin 内联的 receiver 统一完成逻辑
        // 保留该类仅为兼容你之前的结构（若使用，请把逻辑搬到这里并
        // 通过某种方式回调到插件实例，比如单例或 WeakReference）
    }
}