package com.tsarit.billing.repository;

import com.tsarit.billing.model.SubscriptionTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionTransactionRepository extends JpaRepository<SubscriptionTransaction, String> {
    List<SubscriptionTransaction> findTop50ByBusinessIdOrderByCreatedAtDesc(String businessId);
    Optional<SubscriptionTransaction> findByPaymentId(String paymentId);
}
