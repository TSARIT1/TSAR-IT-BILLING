package com.tsarit.billing.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.tsarit.billing.model.Sale;

public interface SaleRepository extends JpaRepository<Sale, Long> {
//	List<Sale> findAllByInvoiceIdIsNotNullOrderByCreatedAtDesc();
//	Optional<Sale> findByInvoiceId(String invoiceId);
	List<Sale> findByCustomerId(Long customerId);
	List<Sale> findAllByOrderByCreatedAtDesc();
	List<Sale> findByIsPaidFalseOrderByCreatedAtDesc();
}
