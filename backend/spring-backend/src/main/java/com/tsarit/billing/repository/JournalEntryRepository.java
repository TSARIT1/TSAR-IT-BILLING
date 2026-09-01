package com.tsarit.billing.repository;

import com.tsarit.billing.model.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, String> {
    List<JournalEntry> findByTenantIdOrderByEntryDateDesc(String tenantId);
    List<JournalEntry> findByTenantIdAndEntryDateBetweenOrderByEntryDateAsc(String tenantId, LocalDate start, LocalDate end);
    Optional<JournalEntry> findByTenantIdAndReferenceNumber(String tenantId, String referenceNumber);
}
