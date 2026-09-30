package com.tsarit.billing.repository;

import com.tsarit.billing.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, String> {

    List<Expense> findByBusinessIdOrderByExpenseDateDesc(String businessId);
    List<Expense> findByExpenseDateBetween(LocalDateTime start, LocalDateTime end);
}
