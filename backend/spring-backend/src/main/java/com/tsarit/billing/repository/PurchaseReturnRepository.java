package com.tsarit.billing.repository;

import com.tsarit.billing.model.PurchaseReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseReturnRepository extends JpaRepository<PurchaseReturn, String> {

    List<PurchaseReturn> findByIsDeletedFalseOrderByReturnDateDesc();

    Optional<PurchaseReturn> findByIdAndIsDeletedFalse(String id);

    // Find all returns for a specific invoice (not deleted)
    List<PurchaseReturn> findByInvoice_InvoiceIdAndIsDeletedFalse(String invoiceId);
}
