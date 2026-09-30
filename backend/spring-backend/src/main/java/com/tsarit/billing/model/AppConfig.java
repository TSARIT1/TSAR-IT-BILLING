package com.tsarit.billing.model;

import jakarta.persistence.*;

/**
 * Super-admin remote control of the Android app. Single row (id = 1).
 *
 * Lets the platform owner change app behaviour without shipping a new APK:
 * feature flags per module, maintenance/ban mode, forced update gate,
 * plan catalogue (price / duration / badge) and the download URL.
 */
@Entity
@Table(name = "app_config")
public class AppConfig {

    public static final long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    // ---- Release / forced update gate ----
    private int latestVersionCode = 33;
    private String latestVersionName = "4.14.14";
    private int minVersionCode = 20;
    @Column(columnDefinition = "TEXT")
    private String minVersionNotes = "Critical security and billing updates required.";
    @Column(columnDefinition = "MEDIUMTEXT")
    private String releaseNotes = "";
    @Column(length = 500)
    private String apkUrl = "https://billing.tsaritservices.com/downloads/TSAR-IT-Billing-v4.14.14.apk";

    /** When true the app blocks everyone except super admins. */
    private boolean maintenanceMode = false;
    @Column(length = 500)
    private String maintenanceMessage = "We are upgrading the app. Please try again shortly.";

    /** Extra per-tenant kill switch: businessId -> blocked (checked on login). */
    @Column(columnDefinition = "TEXT")
    private String blockedTenantsJson = "[]";

    // ---- Feature flags (module name -> on/off) ----
    // Stored as JSON so new flags need no schema migration.
    @Column(columnDefinition = "TEXT")
    private String featureFlagsJson = "{\"smsMarketing\":true,\"caAudit\":true,\"smsGateway\":false,\"eInvoice\":true,\"pos\":true,\"whatsapp\":true,\"aiAssistant\":true,\"smsFreeGateway\":false,\"subscription\":true}";

    // ---- Plan catalogue overrides (JSON array of plan objects) ----
    // Empty string = fall back to the built-in catalogue in SubscriptionService.
    @Column(columnDefinition = "MEDIUMTEXT")
    private String plansOverrideJson = "";

    // ---- Branding shown in-app ----
    @Column(length = 200)
    private String announcementBanner = "";
    @Column(length = 100)
    private String supportPhone = "";
    @Column(length = 200)
    private String supportEmail = "";

    private java.time.LocalDateTime updatedAt = java.time.LocalDateTime.now();
    @Column(length = 100)
    private String updatedBy = "system";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getLatestVersionCode() { return latestVersionCode; }
    public void setLatestVersionCode(int v) { this.latestVersionCode = v; }
    public String getLatestVersionName() { return latestVersionName; }
    public void setLatestVersionName(String v) { this.latestVersionName = v; }
    public int getMinVersionCode() { return minVersionCode; }
    public void setMinVersionCode(int v) { this.minVersionCode = v; }
    public String getMinVersionNotes() { return minVersionNotes; }
    public void setMinVersionNotes(String v) { this.minVersionNotes = v; }
    public String getReleaseNotes() { return releaseNotes; }
    public void setReleaseNotes(String v) { this.releaseNotes = v; }
    public String getApkUrl() { return apkUrl; }
    public void setApkUrl(String v) { this.apkUrl = v; }
    public boolean isMaintenanceMode() { return maintenanceMode; }
    public void setMaintenanceMode(boolean v) { this.maintenanceMode = v; }
    public String getMaintenanceMessage() { return maintenanceMessage; }
    public void setMaintenanceMessage(String v) { this.maintenanceMessage = v; }
    public String getBlockedTenantsJson() { return blockedTenantsJson; }
    public void setBlockedTenantsJson(String v) { this.blockedTenantsJson = v; }
    public String getFeatureFlagsJson() { return featureFlagsJson; }
    public void setFeatureFlagsJson(String v) { this.featureFlagsJson = v; }
    public String getPlansOverrideJson() { return plansOverrideJson; }
    public void setPlansOverrideJson(String v) { this.plansOverrideJson = v; }
    public String getAnnouncementBanner() { return announcementBanner; }
    public void setAnnouncementBanner(String v) { this.announcementBanner = v; }
    public String getSupportPhone() { return supportPhone; }
    public void setSupportPhone(String v) { this.supportPhone = v; }
    public String getSupportEmail() { return supportEmail; }
    public void setSupportEmail(String v) { this.supportEmail = v; }
    public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(java.time.LocalDateTime v) { this.updatedAt = v; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String v) { this.updatedBy = v; }
}
