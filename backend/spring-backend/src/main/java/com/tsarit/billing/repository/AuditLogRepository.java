package com.tsarit.billing.repository;

import com.tsarit.billing.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
    List<AuditLog> findByTenantIdOrderByCreatedAtDesc(String tenantId);
    Page<AuditLog> findByTenantId(String tenantId, Pageable pageable);
    List<AuditLog> findByModuleNameAndRecordIdOrderByCreatedAtDesc(String moduleName, String recordId);
}
