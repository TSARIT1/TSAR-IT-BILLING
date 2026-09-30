package com.tsarit.billing.repository;

import com.tsarit.billing.model.TenantSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantSubscriptionRepository extends JpaRepository<TenantSubscription, String> {
    List<TenantSubscription> findByBusinessId(String businessId);
    Optional<TenantSubscription> findFirstByBusinessIdOrderByEndDateDesc(String businessId);
}
