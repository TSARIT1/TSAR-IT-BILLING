package com.tsarit.billing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tsarit.billing.model.Sale;

public interface SaleRepository extends JpaRepository<Sale, String> {}
