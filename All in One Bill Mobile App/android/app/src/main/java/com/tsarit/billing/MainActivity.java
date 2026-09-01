package com.tsarit.billing;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.tsarit.billing.printer.BluetoothPrinterBridge;
import com.tsarit.billing.sync.AutoSyncManager;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private BluetoothPrinterBridge printerBridge;
    private AutoSyncManager syncManager;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        printerBridge = new BluetoothPrinterBridge(this);
        syncManager = new AutoSyncManager(this);

        // Configure WebSettings for optimal mobile performance and local caching
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setLoadsImagesAutomatically(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);

        // Expose Native Android Bridges to JavaScript layer
        webView.addJavascriptInterface(new AndroidNativeInterface(), "AndroidNative");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        // Initialize Background Auto-Sync Worker
        syncManager.startPeriodicAutoSync();

        // Load Local App Assets / Web URL
        // In local emulator: http://10.0.2.2:3000 or production bundled assets file:///android_asset/index.html
        webView.loadUrl("file:///android_asset/index.html");
    }

    public class AndroidNativeInterface {
        @JavascriptInterface
        public void showToast(String message) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show());
        }

        @JavascriptInterface
        public void printThermalReceipt(String receiptJson) {
            printerBridge.printReceipt(receiptJson);
        }

        @JavascriptInterface
        public void triggerManualSync() {
            syncManager.triggerOneTimeSync();
        }

        @JavascriptInterface
        public void shareInvoiceWhatsApp(String invoiceSummary, String pdfUrl) {
            Intent sendIntent = new Intent();
            sendIntent.setAction(Intent.ACTION_SEND);
            sendIntent.putExtra(Intent.EXTRA_TEXT, invoiceSummary);
            sendIntent.setType("text/plain");
            sendIntent.setPackage("com.whatsapp");
            try {
                startActivity(sendIntent);
            } catch (Exception e) {
                // Fallback to standard share chooser
                startActivity(Intent.createChooser(sendIntent, "Share Invoice"));
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
