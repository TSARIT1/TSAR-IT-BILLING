package com.tsarit.billing.repository;

import com.tsarit.billing.model.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, String> {
    List<BankAccount> findAllByOrderByCreatedAtDesc();
    List<BankAccount> findByBusinessIdOrderByCreatedAtDesc(String businessId);
    Optional<BankAccount> findByIsPrimaryTrue();
    Optional<BankAccount> findByIdAndBusinessId(String id, String businessId);
}
