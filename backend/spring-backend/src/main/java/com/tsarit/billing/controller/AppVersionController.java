package com.tsarit.billing.controller;

import com.tsarit.billing.service.AppConfigService;
import com.tsarit.billing.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Super-admin remote control of the Android app.
 *
 *  GET  /api/app/version     — legacy release info (kept for older APKs)
 *  GET  /api/app/config      — full remote config the APK reads at startup (public)
 *  GET  /api/app/plans       — plan catalogue (public; respects super-admin overrides)
 *  PUT  /api/app/config      — super-admin only: feature flags, force update, plans, etc.
 */
@RestController
@RequestMapping("/api/app")
@CrossOrigin(originPatterns = "*")
public class AppVersionController {

    @Autowired
    private AppConfigService appConfigService;

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private com.tsarit.billing.repository.UserBusinessRepository userBusinessRepository;

    @GetMapping("/version")
    public ResponseEntity<?> getAppVersion() {
        return ResponseEntity.ok(appConfigService.publicPayload());
    }

    /** Everything the APK needs on cold start: version gate, flags, banner, support. */
    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        return ResponseEntity.ok(appConfigService.publicPayload());
    }

    /** Plan catalogue — super-admin overrides win over the built-in defaults. */
    @GetMapping("/plans")
    public ResponseEntity<?> getPlans() {
        List<Map<String, Object>> builtin = subscriptionService.getAvailablePlans().stream()
                .map(p -> {
                    Map<String, Object> m = new java.util.LinkedHashMap<>();
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
                .toList();
        return ResponseEntity.ok(appConfigService.effectivePlans(builtin));
    }

    /** Super-admin only. Partial patch: send just the keys you want to change. */
    @PutMapping("/config")
    public ResponseEntity<?> updateConfig(@RequestBody Map<String, Object> patch) {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof com.tsarit.billing.model.User caller)) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        boolean isSuper = userBusinessRepository.findByUserId(caller.getId()).stream()
                .anyMatch(ub -> ub.getRole() == com.tsarit.billing.model.UserRole.SUPER_ADMIN);
        if (!isSuper) {
            return ResponseEntity.status(403).body(Map.of("error", "SUPER_ADMIN role required"));
        }
        var saved = appConfigService.patch(patch, caller.getEmail());
        return ResponseEntity.ok(Map.of("success", true, "config", appConfigService.adminPayload(),
                "updatedBy", saved.getUpdatedBy(), "updatedAt", String.valueOf(saved.getUpdatedAt())));
    }
}
