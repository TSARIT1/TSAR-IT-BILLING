package com.tsarit.billing.controller;

import com.tsarit.billing.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(originPatterns = "*")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionService.PlanDetails>> getPlans() {
        return ResponseEntity.ok(subscriptionService.getAvailablePlans());
    }

    @GetMapping("/usage")
    public ResponseEntity<Map<String, Object>> getUsage(@RequestParam(required = false, defaultValue = "default") String tenantId) {
        return ResponseEntity.ok(subscriptionService.getCurrentTenantUsage(tenantId));
    }
}
