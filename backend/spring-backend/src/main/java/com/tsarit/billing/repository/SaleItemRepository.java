package com.tsarit.billing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tsarit.billing.model.SaleItem;

public interface SaleItemRepository extends JpaRepository<SaleItem, String> {}
