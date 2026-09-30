package com.tsarit.billing.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tsarit.billing.model.AppConfig;
import com.tsarit.billing.repository.AppConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Reads / writes the super-admin controlled Android app configuration.
 * Serves the merged public payload that the APK consumes at startup.
 */
@Service
public class AppConfigService {

    private static final int CURRENT_PUBLIC_VERSION_CODE = 33;
    private static final String CURRENT_PUBLIC_VERSION_NAME = "4.14.14";
    private static final String CURRENT_PUBLIC_APK_URL =
            "https://billing.tsaritservices.com/downloads/TSAR-IT-Billing-v4.14.14.apk";

    @Autowired
    private AppConfigRepository repo;

    private final ObjectMapper mapper = new ObjectMapper();

    /** Never null: creates the singleton row with safe defaults on first read. */
    public AppConfig get() {
        Optional<AppConfig> existing = repo.findById(AppConfig.SINGLETON_ID);
        AppConfig config = existing.orElseGet(AppConfig::new);
        boolean changed = false;
        if (config.getLatestVersionCode() < CURRENT_PUBLIC_VERSION_CODE) {
            config.setLatestVersionCode(CURRENT_PUBLIC_VERSION_CODE);
            config.setLatestVersionName(CURRENT_PUBLIC_VERSION_NAME);
            config.setApkUrl(CURRENT_PUBLIC_APK_URL);
            changed = true;
        }
        if (config.getApkUrl() == null || config.getApkUrl().isBlank()) {
            config.setApkUrl(CURRENT_PUBLIC_APK_URL);
            changed = true;
        }
        return changed || existing.isEmpty() ? repo.save(config) : config;
    }

    public Map<String, Object> publicPayload() {
        AppConfig c = get();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("latestVersionCode", c.getLatestVersionCode());
        out.put("latestVersionName", c.getLatestVersionName());
        out.put("minVersionCode", c.getMinVersionCode());
        out.put("minVersionNotes", c.getMinVersionNotes());
        out.put("releaseNotes", c.getReleaseNotes());
        out.put("apkUrl", c.getApkUrl());
        out.put("maintenanceMode", c.isMaintenanceMode());
        out.put("maintenanceMessage", c.getMaintenanceMessage());
        out.put("featureFlags", parseMap(c.getFeatureFlagsJson()));
        out.put("announcementBanner", c.getAnnouncementBanner());
        out.put("supportPhone", c.getSupportPhone());
        out.put("supportEmail", c.getSupportEmail());
        out.put("updatedAt", String.valueOf(c.getUpdatedAt()));
        return out;
    }

    public Map<String, Object> adminPayload() {
        Map<String, Object> out = publicPayload();
        out.put("plansOverride", parsePlanOverride(get().getPlansOverrideJson()));
        out.put("blockedTenants", parseStringList(get().getBlockedTenantsJson()));
        out.put("updatedBy", get().getUpdatedBy());
        return out;
    }

    /** Applies a partial patch from the super-admin panel. Only non-null keys are written. */
    public AppConfig patch(Map<String, Object> patch, String updatedBy) {
        AppConfig c = get();
        if (patch.containsKey("latestVersionCode")) c.setLatestVersionCode(asInt(patch.get("latestVersionCode")));
        if (patch.containsKey("latestVersionName")) c.setLatestVersionName(asStr(patch.get("latestVersionName")));
        if (patch.containsKey("minVersionCode")) c.setMinVersionCode(asInt(patch.get("minVersionCode")));
        if (patch.containsKey("minVersionNotes")) c.setMinVersionNotes(asStr(patch.get("minVersionNotes")));
        if (patch.containsKey("releaseNotes")) c.setReleaseNotes(asStr(patch.get("releaseNotes")));
        if (patch.containsKey("apkUrl")) c.setApkUrl(asStr(patch.get("apkUrl")));
        if (patch.containsKey("maintenanceMode")) c.setMaintenanceMode(asBool(patch.get("maintenanceMode")));
        if (patch.containsKey("maintenanceMessage")) c.setMaintenanceMessage(asStr(patch.get("maintenanceMessage")));
        if (patch.containsKey("featureFlags")) c.setFeatureFlagsJson(writeJson(patch.get("featureFlags")));
        if (patch.containsKey("plansOverride")) {
            c.setPlansOverrideJson(patch.get("plansOverride") == null
                    ? "" : writeJson(patch.get("plansOverride")));
        }
        if (patch.containsKey("blockedTenants")) c.setBlockedTenantsJson(writeJson(patch.get("blockedTenants")));
        if (patch.containsKey("announcementBanner")) c.setAnnouncementBanner(asStr(patch.get("announcementBanner")));
        if (patch.containsKey("supportPhone")) c.setSupportPhone(asStr(patch.get("supportPhone")));
        if (patch.containsKey("supportEmail")) c.setSupportEmail(asStr(patch.get("supportEmail")));
        c.setUpdatedAt(LocalDateTime.now());
        c.setUpdatedBy(updatedBy == null ? "superadmin" : updatedBy);
        return repo.save(c);
    }

    /** Plan catalogue the APK should render: override if set, else the built-in list. */
    public List<Map<String, Object>> effectivePlans(List<Map<String, Object>> builtin) {
        String override = get().getPlansOverrideJson();
        if (override == null || override.isBlank()) return builtin;
        try {
            List<Map<String, Object>> parsed = mapper.readValue(override, new TypeReference<List<Map<String, Object>>>() {});
            return parsed == null || parsed.isEmpty() ? builtin : parsed;
        } catch (Exception e) {
            return builtin;
        }
    }

    public boolean isTenantBlocked(String businessId) {
        if (businessId == null) return false;
        for (String id : parseStringList(get().getBlockedTenantsJson())) {
            if (businessId.equalsIgnoreCase(id)) return true;
        }
        return false;
    }

    private Map<String, Object> parseMap(String json) {
        if (json == null || json.isBlank()) return new LinkedHashMap<>();
        try {
            return mapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return new LinkedHashMap<>();
        }
    }

    private List<String> parseStringList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return mapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private List<Map<String, Object>> parsePlanOverride(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return mapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private String writeJson(Object o) {
        try {
            return mapper.writeValueAsString(o);
        } catch (Exception e) {
            return "";
        }
    }

    private String asStr(Object o) { return o == null ? null : o.toString(); }
    private int asInt(Object o) {
        if (o instanceof Number n) return n.intValue();
        try { return Integer.parseInt(String.valueOf(o)); } catch (Exception e) { return 0; }
    }
    private boolean asBool(Object o) {
        if (o instanceof Boolean b) return b;
        return "true".equalsIgnoreCase(String.valueOf(o));
    }
}
