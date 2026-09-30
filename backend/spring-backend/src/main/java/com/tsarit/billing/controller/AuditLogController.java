package com.tsarit.billing.controller;

import com.tsarit.billing.repository.AuditLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Read-only CA-audit trail API:
 *   GET /api/audit?businessId=...               latest 200 entries
 *   GET /api/audit?businessId=...&entityType=INVOICE   filtered trail
 */
@RestController
@RequestMapping("/api/audit")
@CrossOrigin(originPatterns = "*")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam("businessId") String businessId,
            @RequestParam(value = "entityType", required = false) String entityType) {
        if (businessId == null || businessId.isBlank()) {
            return ResponseEntity.badRequest().body("businessId is required");
        }
        java.util.List<?> entries;
        if (entityType != null && !entityType.isBlank()) {
            String mod = entityType.toUpperCase();
            entries = auditLogRepository.findByTenantIdOrderByCreatedAtDesc(businessId).stream()
                    .filter(e -> mod.equals(e.getModuleName()))
                    .limit(200)
                    .toList();
        } else {
            entries = auditLogRepository.findByTenantIdOrderByCreatedAtDesc(businessId);
        }
        return ResponseEntity.ok(Map.of(
                "entries", entries,
                "count", entries.size()));
    }
}
