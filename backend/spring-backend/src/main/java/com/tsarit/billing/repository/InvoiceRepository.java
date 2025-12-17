package com.tsarit.billing.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tsarit.billing.model.Invoice;

public interface InvoiceRepository extends JpaRepository<Invoice, String> {
	List<Invoice> findByUser_Id(String userId);

	List<Invoice> findByUser_IdOrderByInvoiceDateDesc(String userId);
	
}
