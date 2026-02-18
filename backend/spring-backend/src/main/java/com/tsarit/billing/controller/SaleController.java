package com.tsarit.billing.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import com.tsarit.billing.model.*;
import com.tsarit.billing.dto.SaleItemResponseDto;
import com.tsarit.billing.dto.SalesListDto;
import com.tsarit.billing.repository.*;
import com.tsarit.billing.service.SaleService;
import com.tsarit.billing.service.PdfService;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

        @Autowired
        private SaleService saleService;

        @Autowired
        private PdfService pdfService;

        private final InvoiceRepository invoiceRepository;
        private final InvoiceItemsRepository invoiceItemsRepository;
        private final SaleRepository saleRepository;
        private final SaleItemRepository saleItemRepository;
        private final CustomerRepository customerRepository;

        public SaleController(
                        InvoiceRepository invoiceRepository,
                        InvoiceItemsRepository invoiceItemsRepository,
                        SaleRepository saleRepository,
                        CustomerRepository customerRepository,
                        SaleItemRepository saleItemRepository) {

                this.invoiceRepository = invoiceRepository;
                this.invoiceItemsRepository = invoiceItemsRepository;
                this.saleRepository = saleRepository;
                this.customerRepository = customerRepository;
                this.saleItemRepository = saleItemRepository;
        }

        // GET ALL SALES
        @Transactional(readOnly = true)
        @GetMapping
        public List<SalesListDto> getAllSales() {

                // 1 Get only SOLD invoices
                List<Invoice> soldInvoices = invoiceRepository.findByIsSaledTrueAndIsDeletedFalse();

                List<Sale> sales = saleRepository.findAllByOrderByCreatedAtDesc();

                // 2 Map invoice → sale → customer
                return sales.stream()
                                .map(sale -> {

                                        Customer customer = customerRepository
                                                        .findById(sale.getCustomerId())
                                                        .orElse(null);

                                        List<String> saleItemIds = sale.getItems().stream()
                                                        .map(SaleItem::getSaleItemId)
                                                        .toList();

                                        return new SalesListDto(
                                                        sale.getCreatedAt(), // Sale Date
                                                        sale.getTotalAmount(), // Amount
                                                        sale.getCustomerId(), // Customer ID
                                                        customer != null ? customer.getName() : "Unknown",
                                                        customer != null ? customer.getPhone() : "-", // PHONE
                                                        sale.getId(),
                                                        saleItemIds,
                                                        sale.getIsPaid() != null ? sale.getIsPaid() : false, // isPaid
                                                                                                             // status
                                                        sale.getItems().size() // Total Items count
                                        );
                                })
                                .toList();
        }

        @PutMapping("/{saleId}/mark-paid")
        public ResponseEntity<String> markSaleAsPaid(@PathVariable Long saleId) {

                Sale sale = saleRepository.findById(saleId)
                                .orElseThrow(() -> new RuntimeException("Sale not found"));

                sale.setIsPaid(true);
                saleRepository.save(sale);

                return ResponseEntity.ok("Sale marked as PAID successfully");
        }

        // 🔹 VIEW SALE ITEMS
        @Transactional(readOnly = true)
        @GetMapping("/{saleId}/items")
        public List<SaleItemResponseDto> getSaleItems(@PathVariable Long saleId) {

                Sale sale = saleRepository.findById(saleId)
                                .orElseThrow(() -> new RuntimeException("Sale not found"));

                return sale.getItems().stream().map(item -> {

                        InvoiceItems invoiceItem = invoiceItemsRepository
                                        .findByIdAndIsDeletedFalse(item.getSaleItemId())
                                        .orElse(null);

                        Double tax = invoiceItem != null ? invoiceItem.getTax() : 0.0;
                        Double discount = invoiceItem != null ? invoiceItem.getDiscount() : 0.0;

                        Double baseAmount = item.getQuantity() * item.getPrice();
                        Double totalPrice = baseAmount + tax - discount;

                        return new SaleItemResponseDto(
                                        item.getSaleItemId(),
                                        item.getProduct().getProductName(), // Product Name
                                        item.getQuantity(),
                                        item.getPrice(),
                                        tax,
                                        discount,
                                        totalPrice);
                }).toList();
        }

        // CREATE SALE (STOCK CHECK INSIDE SERVICE)
        @PostMapping("/create")
        public Sale createSale(@RequestBody Sale sale) {
                return saleService.createSale(sale);
        }

        /**
         * Generate and download Sales Slip PDF
         * GET /api/sales/{saleId}/slip?businessId={businessId}
         */
        @GetMapping("/{saleId}/slip")
        public ResponseEntity<byte[]> downloadSalesSlip(
                        @PathVariable Long saleId,
                        @RequestParam String businessId) {
                try {
                        System.out.println("\n========== GENERATE SALES SLIP PDF (FROM SALE) ==========");
                        System.out.println("Sale ID: " + saleId);
                        System.out.println("Business ID: " + businessId);

                        // Fetch sale
                        Sale sale = saleRepository.findById(saleId)
                                        .orElseThrow(() -> new RuntimeException("Sale not found"));

                        // Fetch customer
                        Customer customer = customerRepository.findById(sale.getCustomerId())
                                        .orElse(null);

                        // Fetch sale items
                        List<SaleItem> saleItems = sale.getItems();

                        if (saleItems == null || saleItems.isEmpty()) {
                                throw new RuntimeException("No sale items found for this sale");
                        }

                        // Generate Sales Slip PDF using Sale data
                        byte[] pdfBytes = pdfService.generateSalesSlipFromSale(sale, saleItems, customer, businessId);

                        if (pdfBytes == null || pdfBytes.length == 0) {
                                throw new RuntimeException("Failed to generate sales slip PDF");
                        }

                        // Set response headers
                        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
                        headers.setContentDispositionFormData("attachment",
                                        "sales-slip-" + saleId + ".pdf");

                        System.out.println(
                                        "Sales slip PDF generated successfully, size: " + pdfBytes.length + " bytes");
                        System.out.println("========== SALES SLIP PDF GENERATION COMPLETE ==========\n");

                        return ResponseEntity.ok()
                                        .headers(headers)
                                        .body(pdfBytes);
                } catch (Exception e) {
                        System.err.println("\n========== ERROR GENERATING SALES SLIP PDF ==========");
                        System.err.println("Error message: " + e.getMessage());
                        e.printStackTrace();

                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(("Error generating sales slip: " + e.getMessage()).getBytes());
                }
        }
}
