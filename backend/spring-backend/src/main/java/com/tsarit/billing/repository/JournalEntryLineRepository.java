package com.tsarit.billing.repository;

import com.tsarit.billing.model.JournalEntryLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JournalEntryLineRepository extends JpaRepository<JournalEntryLine, String> {
    List<JournalEntryLine> findByAccountId(String accountId);
}
