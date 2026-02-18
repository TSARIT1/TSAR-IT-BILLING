package com.tsarit.billing.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tsarit.billing.model.Invoice;

public interface InvoiceRepository extends JpaRepository<Invoice, String> {
	List<Invoice> findByUser_Id(String userId);

	List<Invoice> findByUser_IdOrderByInvoiceDateDesc(String userId);
	List<Invoice> findByUserIdAndIsDeletedFalse(String userId);
	List<Invoice> findByUser_IdAndIsDeletedFalseOrderByInvoiceDateDesc(String userId);

	Optional<Invoice> findByInvoiceIdAndIsDeletedFalse(String invoiceId);
	
	List<Invoice> findByIsSaledTrueAndIsDeletedFalse();
	
	 // Fetch only purchase invoices (is_saled = false)
    List<Invoice> findByUser_IdAndIsSaledFalseAndIsDeletedFalseOrderByInvoiceDateDesc(String userId);

 // NEW: Fetch only purchase invoices with supplier customers
    @Query("SELECT i FROM Invoice i JOIN i.customer c WHERE i.user.id = :userId " +
           "AND i.isSaled = false " +
           "AND i.isDeleted = false " +
           "AND (c.customerType = 'Supplier' OR c.customerType = 'Both') " +
           "ORDER BY i.invoiceDate DESC")
    List<Invoice> findPurchaseInvoicesByUserId(@Param("userId") String userId);

}
