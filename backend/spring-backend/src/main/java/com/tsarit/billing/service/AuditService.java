package com.tsarit.billing.service;

import com.tsarit.billing.model.AuditLog;
import com.tsarit.billing.repository.AuditLogRepository;
import com.tsarit.billing.security.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public AuditLog logEvent(String moduleName, String actionType, String recordId, 
                             String oldValue, String newValue, String notes) {
        String tenantId = TenantContext.getTenantId();
        String companyId = TenantContext.getCompanyId();
        String userId = TenantContext.getUserId();

        AuditLog log = new AuditLog(
            tenantId, companyId, userId, "System User",
            moduleName, actionType, recordId,
            oldValue, newValue, "127.0.0.1", notes
        );
        return auditLogRepository.save(log);
    }

    public List<AuditLog> getLogsByTenant(String tenantId) {
        return auditLogRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    public Page<AuditLog> getLogsPaged(String tenantId, int page, int size) {
        return auditLogRepository.findByTenantId(tenantId, PageRequest.of(page, size));
    }

    /**
     * Business-friendly audit write used by controllers: tenant defaults to the
     * caller-supplied businessId when no TenantContext is bound (mobile app flows).
     * Money-aware entries keep CA totals quick; failures never break business flows.
     */
    public void log(String businessId, String actor, String role, String action,
                    String entityType, String entityId, Double amount, String description) {
        try {
            AuditLog entry = new AuditLog(
                    businessId,
                    businessId,
                    actor != null ? actor : TenantContext.getUserId() != null ? TenantContext.getUserId() : "system",
                    role != null ? role : "OWNER",
                    entityType,
                    action,
                    entityId,
                    null,
                    amount != null ? String.valueOf(amount) : null,
                    null,
                    description);
            auditLogRepository.save(entry);
        } catch (Exception ignored) {
            // auditing must never break the business flow
        }
    }
}
