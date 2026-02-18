package com.tsarit.billing.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.tsarit.billing.model.Invoice;
import com.tsarit.billing.model.InvoiceItems;
import com.tsarit.billing.model.Product;
import com.tsarit.billing.model.StockTransaction;
import com.tsarit.billing.model.TransactionType;
import com.tsarit.billing.repository.InvoiceItemsRepository;
import com.tsarit.billing.repository.InvoiceRepository;
import com.tsarit.billing.repository.ProductRepository;
import com.tsarit.billing.repository.StockTransactionRepository;

import jakarta.transaction.Transactional;

@Service
public class PurchaseService {

    private final ProductRepository productRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemsRepository invoiceItemsRepository;
    private final StockTransactionRepository stockTransactionRepository;

    public PurchaseService(
            ProductRepository productRepository,
            InvoiceRepository invoiceRepository,
            InvoiceItemsRepository invoiceItemsRepository,
            StockTransactionRepository stockTransactionRepository) {

        this.productRepository = productRepository;
        this.invoiceRepository = invoiceRepository;
        this.invoiceItemsRepository = invoiceItemsRepository;
        this.stockTransactionRepository = stockTransactionRepository;
    }

    @Transactional
    public void confirmPurchase(String invoiceId) {

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.isDeleted()) {
            throw new RuntimeException("Deleted invoice cannot be purchased");
        }

        if (invoice.isPurchased()) {
            throw new RuntimeException("Invoice already purchased");
        }

        List<InvoiceItems> items = invoiceItemsRepository.findByInvoice_InvoiceIdAndIsDeletedFalse(invoiceId);

        if (items.isEmpty()) {
            throw new RuntimeException("No invoice items found");
        }

        for (InvoiceItems item : items) {

            Product product = productRepository.findById(
                    item.getProduct().getId()).orElseThrow(() -> new RuntimeException("Product not found"));

            int beforeStock = product.getRemainingStock() == null ? 0 : product.getRemainingStock();

            int buyQty = item.getQty();
            int afterStock = beforeStock + buyQty;

            // ADD STOCK
            product.setRemainingStock(afterStock);
            productRepository.save(product);

            // BUY TRANSACTION
            StockTransaction tx = new StockTransaction();
            tx.setTransactionDate(LocalDate.now());
            tx.setTransactionTime(LocalTime.now());
            tx.setTransactionType(TransactionType.BUY);
            tx.setTotalStock(beforeStock);
            tx.setTotalBuy(buyQty);
            tx.setTotalSell(0);
            tx.setRemainingStock(afterStock);
            tx.setProductId(product.getId());

            stockTransactionRepository.save(tx);
        }

        invoice.setPurchased(true);
        invoiceRepository.save(invoice);
    }
}
