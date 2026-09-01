package com.tsarit.billing.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SubscriptionService {

    public static class PlanDetails {
        public String planId;
        public String name;
        public double monthlyPrice;
        public double annualPrice;
        public int maxUsers;
        public int maxGodowns;
        public int maxInvoicesPerMonth;
        public boolean eInvoiceEnabled;
        public boolean eWayBillEnabled;
        public boolean multiBranchEnabled;
        public boolean posEnabled;
        public boolean prioritySupport;

        public PlanDetails(String planId, String name, double monthlyPrice, double annualPrice,
                           int maxUsers, int maxGodowns, int maxInvoicesPerMonth,
                           boolean eInvoiceEnabled, boolean eWayBillEnabled,
                           boolean multiBranchEnabled, boolean posEnabled, boolean prioritySupport) {
            this.planId = planId;
            this.name = name;
            this.monthlyPrice = monthlyPrice;
            this.annualPrice = annualPrice;
            this.maxUsers = maxUsers;
            this.maxGodowns = maxGodowns;
            this.maxInvoicesPerMonth = maxInvoicesPerMonth;
            this.eInvoiceEnabled = eInvoiceEnabled;
            this.eWayBillEnabled = eWayBillEnabled;
            this.multiBranchEnabled = multiBranchEnabled;
            this.posEnabled = posEnabled;
            this.prioritySupport = prioritySupport;
        }
    }

    public List<PlanDetails> getAvailablePlans() {
        return Arrays.asList(
            new PlanDetails("starter", "Starter Tier", 499, 349, 1, 1, 1000, false, false, false, true, false),
            new PlanDetails("growth_pro", "Growth & Business Pro", 1299, 899, 5, 5, 10000, true, true, true, true, true),
            new PlanDetails("enterprise", "Enterprise Chain", 2999, 2099, 999, 999, 999999, true, true, true, true, true)
        );
    }

    public Map<String, Object> getCurrentTenantUsage(String tenantId) {
        Map<String, Object> usage = new HashMap<>();
        usage.put("tenantId", tenantId != null ? tenantId : "default");
        usage.put("activePlan", "growth_pro");
        usage.put("planName", "Growth & Business Pro");
        usage.put("userQuota", Map.of("used", 2, "max", 5));
        usage.put("godownQuota", Map.of("used", 3, "max", 5));
        usage.put("monthlyInvoiceQuota", Map.of("used", 142, "max", 10000));
        usage.put("eInvoiceQuota", Map.of("used", 28, "max", 500));
        usage.put("storageMb", Map.of("used", 45.8, "max", 5000));
        usage.put("renewalDate", "2027-03-31");
        usage.put("status", "ACTIVE");
        return usage;
    }
}
