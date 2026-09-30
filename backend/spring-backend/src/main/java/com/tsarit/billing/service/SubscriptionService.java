package com.tsarit.billing.service;

import com.tsarit.billing.model.TenantSubscription;
import com.tsarit.billing.repository.GodownRepository;
import com.tsarit.billing.repository.InvoiceRepository;
import com.tsarit.billing.repository.TenantSubscriptionRepository;
import com.tsarit.billing.repository.UserBusinessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class SubscriptionService {

    @Autowired
    private TenantSubscriptionRepository subscriptionRepo;

    @Autowired(required = false)
    private InvoiceRepository invoiceRepo;

    @Autowired(required = false)
    private GodownRepository godownRepo;

    @Autowired(required = false)
    private UserBusinessRepository userBusinessRepo;

    public static class PlanDetails {
        public String planId;
        public String name;
        public String tagline;
        public double price;
        public String duration;
        public int durationDays;
        public int maxUsers;
        public int maxGodowns;
        public int maxInvoicesPerMonth;
        public boolean eInvoiceEnabled;
        public boolean posEnabled;
        public String badge;
        public boolean isPopular;

        public PlanDetails(String planId, String name, String tagline, double price, String duration, int durationDays,
                           int maxUsers, int maxGodowns, int maxInvoicesPerMonth,
                           boolean eInvoiceEnabled, boolean posEnabled, String badge, boolean isPopular) {
            this.planId = planId;
            this.name = name;
            this.tagline = tagline;
            this.price = price;
            this.duration = duration;
            this.durationDays = durationDays;
            this.maxUsers = maxUsers;
            this.maxGodowns = maxGodowns;
            this.maxInvoicesPerMonth = maxInvoicesPerMonth;
            this.eInvoiceEnabled = eInvoiceEnabled;
            this.posEnabled = posEnabled;
            this.badge = badge;
            this.isPopular = isPopular;
        }
    }

    public List<PlanDetails> getAvailablePlans() {
        return Arrays.asList(
            new PlanDetails("plan_1_month", "1 Month Plan", "Monthly billing for full enterprise flexibility.",
                    500, "1 Month Validity", 30, 5, 5, 5000, true, true, "MONTHLY", false),
            new PlanDetails("plan_3_months", "3 Months Plan", "Quarterly subscription plan with cost savings.",
                    1400, "3 Months Validity", 90, 10, 10, 15000, true, true, "QUARTERLY", false),
            new PlanDetails("plan_6_months", "6 Months Plan", "Semi-annual plan designed for growing businesses.",
                    2700, "6 Months Validity", 180, 25, 25, 50000, true, true, "SEMI-ANNUAL", false),
            new PlanDetails("plan_1_year", "1 Year Plan", "Annual commitment with 2 months free savings.",
                    5000, "1 Year Validity", 365, 50, 50, 100000, true, true, "BEST VALUE", true),
            new PlanDetails("plan_2_years", "2 Years Enterprise Plan", "VIP dedicated support with custom cloud deployment.",
                    25000, "2 Years Validity", 730, 999, 999, 999999, true, true, "VIP ENTERPRISE", false)
        );
    }

    public TenantSubscription provisionFreeTrial(String businessId) {
        if (businessId == null || businessId.isBlank()) {
            businessId = "default";
        }

        Optional<TenantSubscription> existing = subscriptionRepo.findFirstByBusinessIdOrderByEndDateDesc(businessId);
        if (existing.isPresent()) {
            return existing.get();
        }

        TenantSubscription sub = new TenantSubscription();
        sub.setBusinessId(businessId);
        sub.setPlanId("trial_15_days");
        sub.setPlanName("15 Days Free Trial");
        sub.setStatus("TRIAL");
        sub.setStartDate(LocalDateTime.now());
        sub.setEndDate(LocalDateTime.now().plusDays(15));
        sub.setAmountPaid(0.0);
        sub.setPaymentMethod("FREE_TRIAL");
        sub.setMaxUsers(5);
        sub.setMaxGodowns(5);
        sub.setMaxInvoicesPerMonth(1000);
        sub.setEInvoiceEnabled(true);
        sub.setPosEnabled(true);
        sub.setSmsCredits(100);

        return subscriptionRepo.save(sub);
    }

    public TenantSubscription upgradePlan(String businessId, String planId, String paymentId, String paymentMethod, Double amount) {
        if (businessId == null || businessId.isBlank()) {
            businessId = "default";
        }

        PlanDetails selectedPlan = getAvailablePlans().stream()
                .filter(p -> p.planId.equalsIgnoreCase(planId))
                .findFirst()
                .orElse(getAvailablePlans().get(3)); // default to 1 Year Plan

        TenantSubscription sub = subscriptionRepo.findFirstByBusinessIdOrderByEndDateDesc(businessId)
                .orElse(new TenantSubscription());

        LocalDateTime start = LocalDateTime.now();
        if (sub.getEndDate() != null && sub.getEndDate().isAfter(start)) {
            // Extend existing active subscription
            start = sub.getEndDate();
        }

        if (paymentId == null || paymentId.isBlank()) {
            throw new IllegalArgumentException("paymentId from the payment gateway is required");
        }
        sub.setBusinessId(businessId);
        sub.setPlanId(selectedPlan.planId);
        sub.setPlanName(selectedPlan.name);
        // Never trust the client amount: underpayment stays PENDING until webhook verifies.
        boolean paidInFull = amount != null && amount >= selectedPlan.price - 0.01;
        sub.setStatus(paidInFull ? "ACTIVE" : "PENDING_VERIFICATION");
        sub.setStartDate(LocalDateTime.now());
        sub.setEndDate(start.plusDays(selectedPlan.durationDays));
        sub.setAmountPaid(amount != null && amount > 0 ? amount : selectedPlan.price);
        sub.setPaymentId(paymentId);
        sub.setPaymentMethod(paymentMethod != null && !paymentMethod.isBlank() ? paymentMethod : "RAZORPAY");
        sub.setMaxUsers(selectedPlan.maxUsers);
        sub.setMaxGodowns(selectedPlan.maxGodowns);
        sub.setMaxInvoicesPerMonth(selectedPlan.maxInvoicesPerMonth);
        sub.setEInvoiceEnabled(selectedPlan.eInvoiceEnabled);
        sub.setPosEnabled(selectedPlan.posEnabled);

        return subscriptionRepo.save(sub);
    }

    public Map<String, Object> getCurrentTenantUsage(String businessId) {
        final String tenantId = (businessId != null && !businessId.isBlank()) ? businessId : "default";

        TenantSubscription sub = subscriptionRepo.findFirstByBusinessIdOrderByEndDateDesc(tenantId)
                .orElseGet(() -> provisionFreeTrial(tenantId));

        LocalDateTime now = LocalDateTime.now();
        long daysRemaining = sub.getEndDate() != null ? Duration.between(now, sub.getEndDate()).toDays() : 0;
        if (daysRemaining < 0) daysRemaining = 0;

        boolean isExpired = sub.getEndDate() != null && sub.getEndDate().isBefore(now);
        String currentStatus = isExpired ? "EXPIRED" : sub.getStatus();

        // Calculate live quota usages
        int invoicesUsed = 0;
        try {
            if (invoiceRepo != null) {
                invoicesUsed = (int) invoiceRepo.count();
            }
        } catch (Exception ignored) {}

        int godownsUsed = 1;
        try {
            if (godownRepo != null) {
                godownsUsed = (int) godownRepo.count();
            }
        } catch (Exception ignored) {}

        int usersUsed = 1;
        try {
            if (userBusinessRepo != null) {
                usersUsed = (int) userBusinessRepo.count();
            }
        } catch (Exception ignored) {}

        Map<String, Object> result = new HashMap<>();
        result.put("businessId", businessId);
        result.put("subscriptionId", sub.getId());
        result.put("activePlan", sub.getPlanId());
        result.put("planName", sub.getPlanName());
        result.put("status", currentStatus);
        result.put("isTrialActive", "TRIAL".equalsIgnoreCase(sub.getStatus()) && !isExpired);
        result.put("startDate", sub.getStartDate() != null ? sub.getStartDate().format(DateTimeFormatter.ISO_LOCAL_DATE) : "");
        result.put("endDate", sub.getEndDate() != null ? sub.getEndDate().format(DateTimeFormatter.ISO_LOCAL_DATE) : "");
        result.put("daysRemaining", daysRemaining);
        result.put("paymentMethod", sub.getPaymentMethod());
        result.put("amountPaid", sub.getAmountPaid());

        Map<String, Object> quotas = new HashMap<>();
        quotas.put("invoices", Map.of("used", invoicesUsed, "max", sub.getMaxInvoicesPerMonth()));
        quotas.put("users", Map.of("used", usersUsed, "max", sub.getMaxUsers()));
        quotas.put("godowns", Map.of("used", godownsUsed, "max", sub.getMaxGodowns()));
        quotas.put("eInvoiceEnabled", sub.isEInvoiceEnabled());
        quotas.put("posEnabled", sub.isPosEnabled());
        quotas.put("smsCredits", sub.getSmsCredits());

        result.put("quotas", quotas);
        return result;
    }

    private String finalBusinessId(String bId) {
        return (bId != null && !bId.isBlank()) ? bId : "default";
    }
}
