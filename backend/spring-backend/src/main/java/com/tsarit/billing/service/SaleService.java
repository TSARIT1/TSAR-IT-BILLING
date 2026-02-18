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
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemsRepository invoiceItemsRepository;
    private final StockTransactionRepository stockTransactionRepository;
    
    public SaleService(
            SaleRepository saleRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            InvoiceRepository invoiceRepository,
            InvoiceItemsRepository invoiceItemsRepository,
            StockTransactionRepository stockTransactionRepository) {

        this.saleRepository = saleRepository;
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

            Integer remainingStock =
                    product.getRemainingStock() == null ? 0 : product.getRemainingStock();
            
            // STOCK CHECK
            if (remainingStock < item.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for product: " + product.getProductName()
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
            item.setPrice(product.getSellingPrice());
            item.setSale(sale);

            totalAmount += item.getPrice() * item.getQuantity();
        }


        sale.setTotalAmount(totalAmount);

        return saleRepository.save(sale);
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

       // invoiceItemsRepository.markItemsAsSaled(invoiceId);
        return savedSale;
    }
}

