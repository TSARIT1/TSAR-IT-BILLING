package com.tsarit.billing.security;

/**
 * ThreadLocal container for multi-tenant context isolation.
 * Automatically holds tenantId, companyId, branchId, and userId per request.
 */
public class TenantContext {
    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_COMPANY = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_BRANCH = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_USER = new ThreadLocal<>();

    public static void setTenantId(String tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    public static String getTenantId() {
        return CURRENT_TENANT.get();
    }

    public static void setCompanyId(String companyId) {
        CURRENT_COMPANY.set(companyId);
    }

    public static String getCompanyId() {
        return CURRENT_COMPANY.get();
    }

    public static void setBranchId(String branchId) {
        CURRENT_BRANCH.set(branchId);
    }

    public static String getBranchId() {
        return CURRENT_BRANCH.get();
    }

    public static void setUserId(String userId) {
        CURRENT_USER.set(userId);
    }

    public static String getUserId() {
        return CURRENT_USER.get();
    }

    public static void clear() {
        CURRENT_TENANT.remove();
        CURRENT_COMPANY.remove();
        CURRENT_BRANCH.remove();
        CURRENT_USER.remove();
    }
}
