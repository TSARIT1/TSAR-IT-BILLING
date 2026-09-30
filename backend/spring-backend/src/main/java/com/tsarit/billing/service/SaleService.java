package com.tsarit.billing.service;

import com.tsarit.billing.model.*;
import com.tsarit.billing.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemsRepository invoiceItemsRepository;
    private final StockTransactionRepository stockTransactionRepository;

    public SaleService(
            SaleRepository saleRepository,
            SaleItemRepository saleItemRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            InvoiceRepository invoiceRepository,
            InvoiceItemsRepository invoiceItemsRepository,
            StockTransactionRepository stockTransactionRepository) {

        this.saleRepository = saleRepository;
        this.saleItemRepository = saleItemRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.invoiceRepository = invoiceRepository;
        this.invoiceItemsRepository = invoiceItemsRepository;
        this.stockTransactionRepository = stockTransactionRepository;
    }

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    @Transactional
    public Sale createSale(Sale sale) {

        if (sale.getItems() == null || sale.getItems().isEmpty()) {
            throw new RuntimeException("Sale must contain at least one item");
        }

        double totalAmount = 0;

        for (SaleItem item : sale.getItems()) {

            Product product = productRepository.findById(
                    item.getProduct().getId()
            ).orElseThrow(() -> new RuntimeException("Product not found"));

            // STATUS CHECK — never bill inactive/deleted items.
            if (Boolean.FALSE.equals(product.getActive()) || Boolean.TRUE.equals(product.getDeleted())) {
                throw new RuntimeException("Product is inactive: " + product.getProductName());
            }
            // EXPIRY CHECK — expired batches cannot be billed.
            if (product.getExpiryDate() != null && product.getExpiryDate().isBefore(LocalDate.now())) {
                throw new RuntimeException("Product expired on " + product.getExpiryDate() + ": " + product.getProductName());
            }

            Integer remainingStock =
                    product.getRemainingStock() == null ? 0 : product.getRemainingStock();

            // STOCK CHECK — out of stock / insufficient stock both block.
            if (remainingStock <= 0) {
                throw new RuntimeException("Product is currently out of stock: " + product.getProductName());
            }
            if (remainingStock < item.getQuantity()) {
                throw new RuntimeException(
                        "Only " + remainingStock + " units are available for: " + product.getProductName()
                );
            }

            int beforeStock = remainingStock;
            int sellQty = item.getQuantity();
            int afterStock = beforeStock - sellQty;

            // UPDATE STOCK
            product.setRemainingStock(afterStock);

            productRepository.save(product);

            // 🔹 SAVE STOCK TRANSACTION (SELL)
            StockTransaction tx = new StockTransaction();
            tx.setTransactionDate(LocalDate.now());
            tx.setTransactionTime(LocalTime.now());
            tx.setTransactionType(TransactionType.SELL);
            tx.setTotalStock(beforeStock);
            tx.setTotalBuy(0);
            tx.setTotalSell(sellQty);
            tx.setRemainingStock(afterStock);
            tx.setProductId(product.getId());

            stockTransactionRepository.save(tx);

            // SET PRICE FROM PRODUCT
            if (item.getPrice() == null || item.getPrice() <= 0) {
                item.setPrice(product.getSellingPrice());
            }
            item.setSale(sale);
            item.setProduct(product);
            if (item.getProductName() == null || item.getProductName().trim().isEmpty()) {
                item.setProductName(product.getProductName());
            }

            totalAmount += item.getPrice() * item.getQuantity();
        }

        sale.setTotalAmount(totalAmount);

        return saleRepository.save(sale);
    }

    @Transactional
    public Sale updateSale(Long saleId, Sale updatedSale) {
        Sale existingSale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Sale not found with ID: " + saleId));

        if (updatedSale.getCustomerId() != null) {
            existingSale.setCustomerId(updatedSale.getCustomerId());
        }
        if (updatedSale.getIsPaid() != null) {
            existingSale.setIsPaid(updatedSale.getIsPaid());
        }

        // Adjust stock if items are being updated
        if (updatedSale.getItems() != null && !updatedSale.getItems().isEmpty()) {
            List<SaleItem> currentItems = saleItemRepository.findBySale_Id(saleId);
            // 1. Restore previous stock for items sold
            for (SaleItem oldItem : currentItems) {
                if (oldItem.getProduct() != null && oldItem.getProduct().getId() != null) {
                    productRepository.findById(oldItem.getProduct().getId()).ifPresent(p -> {
                        int rem = p.getRemainingStock() != null ? p.getRemainingStock() : 0;
                        int restoreQty = oldItem.getQuantity() != null ? oldItem.getQuantity() : 0;
                        p.setRemainingStock(rem + restoreQty);
                        productRepository.save(p);
                    });
                }
            }

            // 2. Remove old items
            existingSale.getItems().clear();
            saleItemRepository.deleteAll(currentItems);

            double totalAmount = 0.0;
            // 3. Deduct new stock and add updated items
            for (SaleItem newItem : updatedSale.getItems()) {
                Product product = null;
                if (newItem.getProduct() != null && newItem.getProduct().getId() != null) {
                    product = productRepository.findById(newItem.getProduct().getId()).orElse(null);
                }

                int qty = newItem.getQuantity() != null ? newItem.getQuantity() : 1;
                double price = newItem.getPrice() != null ? newItem.getPrice() : (product != null && product.getSellingPrice() != null ? product.getSellingPrice() : 0.0);

                if (product != null) {
                    int rem = product.getRemainingStock() != null ? product.getRemainingStock() : 0;
                    if (rem < qty) {
                        throw new IllegalArgumentException("Insufficient stock for " + product.getProductName()
                                + " (available " + rem + ", requested " + qty + ")");
                    }
                    int afterStock = rem - qty;
                    product.setRemainingStock(afterStock);
                    productRepository.save(product);

                    StockTransaction tx = new StockTransaction();
                    tx.setTransactionDate(LocalDate.now());
                    tx.setTransactionTime(LocalTime.now());
                    tx.setTransactionType(TransactionType.SELL);
                    tx.setTotalStock(rem);
                    tx.setTotalBuy(0);
                    tx.setTotalSell(qty);
                    tx.setRemainingStock(afterStock);
                    tx.setProductId(product.getId());
                    stockTransactionRepository.save(tx);
                }

                newItem.setSale(existingSale);
                newItem.setProduct(product);
                newItem.setQuantity(qty);
                newItem.setPrice(price);
                if (newItem.getProductName() == null && product != null) {
                    newItem.setProductName(product.getProductName());
                }

                existingSale.getItems().add(newItem);
                totalAmount += (qty * price);
            }

            if (updatedSale.getTotalAmount() != null && updatedSale.getTotalAmount() > 0) {
                existingSale.setTotalAmount(updatedSale.getTotalAmount());
            } else {
                existingSale.setTotalAmount(totalAmount);
            }
        } else if (updatedSale.getTotalAmount() != null) {
            existingSale.setTotalAmount(updatedSale.getTotalAmount());
        }

        // 4. If linked to an invoice, synchronize companion invoice
        if (existingSale.getInvoiceId() != null && !existingSale.getInvoiceId().trim().isEmpty()) {
            try {
                invoiceRepository.findById(existingSale.getInvoiceId()).ifPresent(inv -> {
                    if (existingSale.getCustomerId() != null) {
                        customerRepository.findById(existingSale.getCustomerId()).ifPresent(inv::setCustomer);
                    }
                    inv.setTotalAmount(existingSale.getTotalAmount());
                    inv.setTotalItems(existingSale.getItems().size());
                    invoiceRepository.save(inv);
                });
            } catch (Exception ignored) {}
        }

        return saleRepository.save(existingSale);
    }

    @Transactional
    public Sale createSaleFromInvoice(String invoiceId) {

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.isDeleted()) {
            throw new RuntimeException("Deleted invoice cannot be sold");
        }

        if (invoice.isSaled()) {
            throw new RuntimeException("Invoice already sold");
        }

        List<InvoiceItems> invoiceItems =
                invoiceItemsRepository.findByInvoice_InvoiceIdAndIsDeletedFalse(invoiceId);

        if (invoiceItems.isEmpty()) {
            throw new RuntimeException("No invoice items found");
        }

        Sale sale = new Sale();
        sale.setCustomerId(invoice.getCustomer().getId());
        sale.setCreatedAt(LocalDateTime.now());
        sale.setInvoiceId(invoice.getInvoiceId());

        double totalAmount = 0;
        for (InvoiceItems invItem : invoiceItems) {

            Product product = productRepository.findById(
                    invItem.getProduct().getId()
            ).orElseThrow(() -> new RuntimeException("Product not found"));

            int remainingStock =
                    product.getRemainingStock() == null ? 0 : product.getRemainingStock();

            if (remainingStock < invItem.getQty()) {
                throw new RuntimeException(
                        "Insufficient stock for product: " + product.getProductName()
                );
            }

            int beforeStock = remainingStock;
            int sellQty = invItem.getQty();
            int afterStock = beforeStock - sellQty;

            // DEDUCT STOCK
            product.setRemainingStock(afterStock);
            productRepository.save(product);

            // 🔹 SAVE STOCK TRANSACTION (SELL)
            StockTransaction tx = new StockTransaction();
            tx.setTransactionDate(LocalDate.now());
            tx.setTransactionTime(LocalTime.now());
            tx.setTransactionType(TransactionType.SELL);
            tx.setTotalStock(beforeStock);
            tx.setTotalBuy(0);
            tx.setTotalSell(sellQty);
            tx.setRemainingStock(afterStock);
            tx.setProductId(product.getId());

            stockTransactionRepository.save(tx);

            // CREATE SALE ITEM
            SaleItem saleItem = new SaleItem();
            saleItem.setSale(sale);
            saleItem.setProduct(product);
            saleItem.setQuantity(invItem.getQty());
            saleItem.setPrice(invItem.getPrice());
            saleItem.setSaleItemId(invItem.getId());

            sale.getItems().add(saleItem);

            totalAmount += invItem.getTotalLineAmount();
        }

        sale.setTotalAmount(totalAmount);
        Sale savedSale = saleRepository.save(sale);

        invoice.setSaled(true);
        invoiceRepository.save(invoice);

        return savedSale;
    }
}
