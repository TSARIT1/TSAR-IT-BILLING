package com.tsarit.billing.repository;

import com.tsarit.billing.model.InvoiceItems;
import com.tsarit.billing.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceItemsRepository extends JpaRepository<InvoiceItems, String> {

    // Fetch items by invoice ID
    List<InvoiceItems> findByInvoice_InvoiceId(String invoiceId);
    int countByInvoice_InvoiceId(String invoiceId);
    List<InvoiceItems> findByInvoice_InvoiceIdOrderByItemNoAsc(String invoiceId);
    Optional<InvoiceItems> findByIdAndInvoice_InvoiceId(
            String itemId,
            String invoiceId
    );
}

