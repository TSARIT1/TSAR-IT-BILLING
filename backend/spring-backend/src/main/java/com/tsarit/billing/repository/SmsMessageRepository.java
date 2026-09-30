package com.tsarit.billing.repository;

import com.tsarit.billing.model.SmsMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SmsMessageRepository extends JpaRepository<SmsMessage, Long> {
    List<SmsMessage> findTop50ByStatusOrderByCreatedAtAsc(SmsMessage.Status status);
    long countByStatus(SmsMessage.Status status);
}
