package com.tsarit.billing.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.tsarit.billing.model.Sale;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.customerId IN " +
           "(SELECT c.id FROM Customer c WHERE c.businessId = :businessId)")
    long countByCustomerBusinessId(@Param("businessId") String businessId);

    Optional<Sale> findByInvoiceId(String invoiceId);
    List<Sale> findAllByInvoiceId(String invoiceId);
    List<Sale> findByCustomerId(Long customerId);
    List<Sale> findAllByOrderByCreatedAtDesc();
    List<Sale> findByIsPaidFalseOrderByCreatedAtDesc();
}
