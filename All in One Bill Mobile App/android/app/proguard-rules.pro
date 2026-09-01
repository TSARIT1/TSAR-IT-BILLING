# Proguard rules for TSAR IT Billing ERP Mobile App
-keep class com.tsarit.billing.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
