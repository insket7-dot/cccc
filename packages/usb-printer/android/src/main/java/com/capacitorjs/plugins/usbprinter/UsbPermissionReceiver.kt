package com.capacitorjs.plugins.usbprinter

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.hardware.usb.UsbManager

class UsbPermissionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == UsbPrinterPlugin.ACTION_USB_PERMISSION) {
            val granted = intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)
            UsbPrinterPlugin.permissionResult.tryEmit(granted)
        }
    }
}
