package com.example.yakipos;

import com.getcapacitor.BridgeActivity;

import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // 启用WebView调试
        WebView.setWebContentsDebuggingEnabled(true);
    }
}
