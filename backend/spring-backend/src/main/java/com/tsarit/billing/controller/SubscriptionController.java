package com.tsarit.billing.controller;

import com.tsarit.billing.model.SubscriptionTransaction;
import com.tsarit.billing.model.TenantSubscription;
import com.tsarit.billing.repository.SubscriptionTransactionRepository;
import com.tsarit.billing.repository.TenantSubscriptionRepository;
import com.tsarit.billing.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(originPatterns = "*")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private SubscriptionTransactionRepository transactionRepo;

    @Autowired
    private TenantSubscriptionRepository subscriptionRepo;

    @org.springframework.beans.factory.annotation.Value("${razorpay.key.secret:}")
    private String razorpaySecret;

    @Autowired
    private com.tsarit.billing.service.AppConfigService appConfigService;

    /**
     * Public plan catalogue (also permitted unauthenticated in SecurityConfig).
     * Super-admin overrides in app_config win, so prices/durations can be changed
     * for every tenant without shipping a new APK.
     */
    @GetMapping("/plans")
    public ResponseEntity<List<Map<String, Object>>> getPlans() {
        List<Map<String, Object>> builtin = subscriptionService.getAvailablePlans().stream()
                .map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("planId", p.planId);
                    m.put("name", p.name);
                    m.put("tagline", p.tagline);
                    m.put("price", p.price);
                    m.put("duration", p.duration);
                    m.put("durationDays", p.durationDays);
                    m.put("maxUsers", p.maxUsers);
                    m.put("maxGodowns", p.maxGodowns);
                    m.put("maxInvoicesPerMonth", p.maxInvoicesPerMonth);
                    m.put("eInvoiceEnabled", p.eInvoiceEnabled);
                    m.put("posEnabled", p.posEnabled);
                    m.put("badge", p.badge);
                    m.put("isPopular", p.isPopular);
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(appConfigService.effectivePlans(builtin));
    }

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentSubscription(@RequestParam(required = false) String businessId) {
        return ResponseEntity.ok(subscriptionService.getCurrentTenantUsage(businessId));
    }

    @GetMapping("/usage")
    public ResponseEntity<Map<String, Object>> getUsage(@RequestParam(required = false, defaultValue = "default") String tenantId) {
        return ResponseEntity.ok(subscriptionService.getCurrentTenantUsage(tenantId));
    }

    /**
     * Plan purchase / upgrade. Every successful call is also written to the
     * subscription_transactions ledger so tenants (and the mobile app) can show
     * their full payment + transaction history.
     */
    @PostMapping("/upgrade")
    @Transactional
    public ResponseEntity<?> upgradeSubscription(@RequestBody Map<String, Object> request) {
        String businessId = request.get("businessId") != null ? request.get("businessId").toString() : "default";
        String planId = request.get("planId") != null ? request.get("planId").toString() : "plan_1_year";
        String paymentId = request.get("paymentId") != null ? request.get("paymentId").toString() : null;
        String paymentMethod = request.get("paymentMethod") != null ? request.get("paymentMethod").toString() : "RAZORPAY";
        Double amount = request.get("amount") != null ? Double.valueOf(request.get("amount").toString()) : null;

        TenantSubscription upgraded;
        try {
            upgraded = subscriptionService.upgradePlan(businessId, planId, paymentId, paymentMethod, amount);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }

        // Ledger entry (idempotent per paymentId where one exists)
        if (paymentId == null || paymentId.isBlank()
                || transactionRepo.findByPaymentId(paymentId).isEmpty()) {
            SubscriptionTransaction tx = new SubscriptionTransaction();
            tx.setBusinessId(businessId);
            tx.setPlanId(upgraded.getPlanId());
            tx.setPlanName(upgraded.getPlanName());
            tx.setAmount(upgraded.getAmountPaid());
            tx.setPaymentId(paymentId != null && !paymentId.isBlank() ? paymentId : upgraded.getPaymentId());
            tx.setPaymentMethod(paymentMethod);
            tx.setStatus("SUCCESS");
            tx.setNotes("Plan purchase: " + upgraded.getPlanName());
            transactionRepo.save(tx);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Subscription plan upgraded successfully!");
        body.put("subscription", upgraded);
        return ResponseEntity.ok(body);
    }

    /**
     * Razorpay webhook: verifies HMAC-SHA256 signature, then activates the plan.
     * Idempotent per paymentId — duplicate deliveries return the existing record.
     * Configure in Razorpay dashboard as https://billing.tsaritservices.com/api/subscriptions/webhook
     */
    @PostMapping("/webhook")
    @Transactional
    public ResponseEntity<?> razorpayWebhook(@RequestBody(required = false) String rawBody,
                                             @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        if (rawBody == null || signature == null || signature.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing webhook payload or signature"));
        }
        if (razorpaySecret == null || razorpaySecret.isBlank()) {
            return ResponseEntity.status(503).body(Map.of("message", "Payment webhook not configured"));
        }
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(razorpaySecret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(rawBody.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : digest) hex.append(String.format("%02x", b));
            if (!hex.toString().equalsIgnoreCase(signature.trim())) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid webhook signature"));
            }
            // Minimal event parsing without new deps: only payment.captured activates.
            String paymentId = extractJsonString(rawBody, "razorpay_payment_id");
            if (paymentId == null) paymentId = extractJsonString(rawBody, "id");
            String event = extractJsonString(rawBody, "event");
            if (paymentId != null && transactionRepo.findByPaymentId(paymentId).isPresent()) {
                return ResponseEntity.ok(Map.of("success", true, "deduped", true));
            }
            if (event != null && event.contains("captured") && paymentId != null) {
                String businessId = extractJsonString(rawBody, "businessId");
                String planId = extractJsonString(rawBody, "planId");
                if (businessId == null) businessId = "default";
                if (planId == null) planId = "plan_1_year";
                TenantSubscription upgraded = subscriptionService.upgradePlan(businessId, planId, paymentId, "RAZORPAY", null);
                SubscriptionTransaction tx = new SubscriptionTransaction();
                tx.setBusinessId(businessId);
                tx.setPlanId(upgraded.getPlanId());
                tx.setPlanName(upgraded.getPlanName());
                tx.setAmount(upgraded.getAmountPaid());
                tx.setPaymentId(paymentId);
                tx.setPaymentMethod("RAZORPAY");
                tx.setStatus("SUCCESS");
                tx.setNotes("Verified via Razorpay webhook: " + event);
                transactionRepo.save(tx);
                return ResponseEntity.ok(Map.of("success", true, "subscription", upgraded));
            }
            return ResponseEntity.ok(Map.of("success", true, "ignored", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Webhook processing failed"));
        }
    }

    private static String extractJsonString(String json, String key) {
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("\"" + java.util.regex.Pattern.quote(key) + "\"\\s*:\\s*\"([^\"]+)\"")
                .matcher(json);
        return m.find() ? m.group(1) : null;
    }

    /** Payment history (ledger) for a tenant — powers the mobile Transactions screen. */
    @GetMapping("/transactions")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getTransactions(@RequestParam(required = false) String businessId) {
        String bid = (businessId == null || businessId.isBlank()) ? "default" : businessId;
        List<Map<String, Object>> rows = transactionRepo.findTop50ByBusinessIdOrderByCreatedAtDesc(bid).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rows);
    }

    /** Full subscription history for a tenant (every plan period, past + current). */
    @GetMapping("/history")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getSubscriptionHistory(@RequestParam(required = false) String businessId) {
        String bid = (businessId == null || businessId.isBlank()) ? "default" : businessId;
        List<Map<String, Object>> rows = subscriptionRepo.findByBusinessId(bid).stream()
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("planId", s.getPlanId());
                    m.put("planName", s.getPlanName());
                    m.put("status", s.getStatus());
                    m.put("startDate", s.getStartDate());
                    m.put("endDate", s.getEndDate());
                    m.put("amountPaid", s.getAmountPaid());
                    m.put("paymentId", s.getPaymentId());
                    m.put("paymentMethod", s.getPaymentMethod());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(rows);
    }

    private Map<String, Object> toDto(SubscriptionTransaction t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.getId());
        m.put("planId", t.getPlanId());
        m.put("planName", t.getPlanName());
        m.put("amount", t.getAmount());
        m.put("paymentId", t.getPaymentId());
        m.put("paymentMethod", t.getPaymentMethod());
        m.put("status", t.getStatus());
        m.put("notes", t.getNotes());
        m.put("createdAt", t.getCreatedAt());
        return m;
    }
}
