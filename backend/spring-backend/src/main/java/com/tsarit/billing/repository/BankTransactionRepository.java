package com.tsarit.billing.repository;

import com.tsarit.billing.model.BankTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankTransactionRepository extends JpaRepository<BankTransaction, String> {
    List<BankTransaction> findByBankAccountIdOrderByTransactionDateDesc(String bankAccountId);
    List<BankTransaction> findAllByOrderByTransactionDateDesc();
}
