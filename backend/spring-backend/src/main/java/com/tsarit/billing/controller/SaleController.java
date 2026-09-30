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
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

        @Autowired
        private SaleService saleService;

        @Autowired
        private PdfService pdfService;

        @Autowired
        private UserBusinessRepository userBusinessRepository;

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

        // GET ALL SALES (tenant-scoped: only sales belonging to the caller's business)
        @Transactional(readOnly = true)
        @GetMapping
        public List<SalesListDto> getAllSales() {

                // 1 Resolve the caller and their business membership
                var authentication = SecurityContextHolder.getContext().getAuthentication();
                User caller = authentication != null && authentication.isAuthenticated()
                                && authentication.getPrincipal() instanceof User u ? u : null;
                if (caller == null) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED, "Authentication required");
                }

                List<UserBusiness> memberships = userBusinessRepository.findByUserId(caller.getId());
                Set<String> businessIds = memberships.stream()
                                .map(ub -> ub.getBusiness().getId())
                                .collect(Collectors.toSet());

                // 2 Get only SOLD invoices
                List<Invoice> soldInvoices = invoiceRepository.findByIsSaledTrueAndIsDeletedFalse();

                List<Sale> sales = saleRepository.findAllByOrderByCreatedAtDesc().stream()
                                .filter(sale -> {
                                        Customer c = customerRepository.findById(sale.getCustomerId()).orElse(null);
                                        return c != null && businessIds.contains(c.getBusinessId());
                                })
                                .toList();

                // 3 Map invoice → sale → customer (only this tenant's customers)
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

                // Ownership check: the sale's customer must belong to the caller's business
                var authentication = SecurityContextHolder.getContext().getAuthentication();
                User caller = authentication != null && authentication.isAuthenticated()
                                && authentication.getPrincipal() instanceof User u ? u : null;
                if (caller == null) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED, "Authentication required");
                }
                Customer saleCustomer = customerRepository.findById(sale.getCustomerId()).orElse(null);
                Set<String> callerBusinessIds = userBusinessRepository.findByUserId(caller.getId()).stream()
                                .map(ub -> ub.getBusiness().getId())
                                .collect(Collectors.toSet());
                if (saleCustomer == null || !callerBusinessIds.contains(saleCustomer.getBusinessId())) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        HttpStatus.FORBIDDEN, "This sale does not belong to your business");
                }

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

                List<SaleItem> items = null;
                try {
                        items = sale.getItems();
                } catch (Exception ignored) {}

                if (items == null || items.isEmpty()) {
                        items = saleItemRepository.findBySale_Id(saleId);
                }

                // If sale items are still empty, fall back to companion invoice items
                if (items == null || items.isEmpty()) {
                        List<InvoiceItems> invItems = null;
                        if (sale.getInvoiceId() != null && !sale.getInvoiceId().trim().isEmpty()) {
                                invItems = invoiceItemsRepository.findByInvoice_InvoiceIdAndIsDeletedFalse(sale.getInvoiceId());
                        }
                        if (invItems == null || invItems.isEmpty()) {
                                List<Invoice> candidateInvoices = invoiceRepository.findByCustomer_IdAndIsDeletedFalse(sale.getCustomerId());
                                for (Invoice inv : candidateInvoices) {
                                        if (Math.abs(inv.getTotalAmount() - (sale.getTotalAmount() != null ? sale.getTotalAmount() : 0.0)) < 0.05) {
                                                invItems = invoiceItemsRepository.findByInvoice_InvoiceIdAndIsDeletedFalse(inv.getInvoiceId());
                                                if (invItems != null && !invItems.isEmpty()) {
                                                        break;
                                                }
                                        }
                                }
                        }

                        if (invItems != null && !invItems.isEmpty()) {
                                return invItems.stream().map(invItem -> {
                                        String name = invItem.getItemName();
                                        if (name == null || name.trim().isEmpty()) {
                                                name = (invItem.getProduct() != null && invItem.getProduct().getProductName() != null)
                                                                ? invItem.getProduct().getProductName()
                                                                : "Item";
                                        }
                                        Double tax = invItem.getTax();
                                        Double discount = invItem.getDiscount();
                                        Double total = invItem.getTotalLineAmount();
                                        return new SaleItemResponseDto(
                                                        invItem.getId(),
                                                        name,
                                                        invItem.getQty(),
                                                        invItem.getPrice(),
                                                        tax,
                                                        discount,
                                                        total);
                                }).toList();
                        }
                }

                if (items == null) {
                        items = java.util.Collections.emptyList();
                }

                return items.stream().map(item -> {
                        InvoiceItems invoiceItem = null;
                        if (item.getSaleItemId() != null && !item.getSaleItemId().trim().isEmpty()) {
                                invoiceItem = invoiceItemsRepository
                                                .findByIdAndIsDeletedFalse(item.getSaleItemId())
                                                .orElse(null);
                        }

                        Double tax = invoiceItem != null ? invoiceItem.getTax() : 0.0;
                        Double discount = invoiceItem != null ? invoiceItem.getDiscount() : 0.0;

                        int qty = item.getQuantity() != null ? item.getQuantity() : 0;
                        double price = item.getPrice() != null ? item.getPrice() : 0.0;
                        Double baseAmount = qty * price;
                        Double totalPrice = invoiceItem != null
                                        ? invoiceItem.getTotalLineAmount()
                                        : (baseAmount + (baseAmount * tax / 100.0) - (baseAmount * discount / 100.0));

                        String prodName = "Item";
                        if (item.getProduct() != null && item.getProduct().getProductName() != null) {
                                prodName = item.getProduct().getProductName();
                        } else if (item.getProductName() != null && !item.getProductName().trim().isEmpty()) {
                                prodName = item.getProductName();
                        } else if (invoiceItem != null && invoiceItem.getItemName() != null) {
                                prodName = invoiceItem.getItemName();
                        }

                        String displayId = item.getSaleItemId();
                        if (displayId == null || displayId.trim().isEmpty()) {
                                displayId = item.getId() != null ? String.valueOf(item.getId()) : "SI-" + item.hashCode();
                        }

                        return new SaleItemResponseDto(
                                        displayId,
                                        prodName,
                                        qty,
                                        price,
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

        // GET SALE BY ID
        @Transactional(readOnly = true)
        @GetMapping("/{saleId}")
        public ResponseEntity<?> getSaleById(@PathVariable Long saleId) {
                Sale sale = saleRepository.findById(saleId)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                HttpStatus.NOT_FOUND, "Sale not found with ID: " + saleId));

                Customer customer = customerRepository.findById(sale.getCustomerId()).orElse(null);
                List<SaleItemResponseDto> items = getSaleItems(saleId);

                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("saleId", sale.getId());
                map.put("id", sale.getId());
                map.put("invoiceId", sale.getInvoiceId() != null ? sale.getInvoiceId() : String.valueOf(sale.getId()));
                map.put("totalAmount", sale.getTotalAmount());
                map.put("createdAt", sale.getCreatedAt());
                map.put("isPaid", sale.getIsPaid());
                map.put("customerId", sale.getCustomerId());
                map.put("customerName", customer != null ? customer.getName() : "Unknown");
                map.put("mobileNo", customer != null ? customer.getPhone() : "-");
                map.put("city", customer != null ? customer.getCity() : "-");
                map.put("items", items);

                return ResponseEntity.ok(map);
        }

        // UPDATE SALE (Stock and item sync)
        @Transactional
        @PutMapping("/{saleId}")
        public ResponseEntity<?> updateSale(@PathVariable Long saleId, @RequestBody Sale sale) {
                Sale updated = saleService.updateSale(saleId, sale);
                return ResponseEntity.ok(updated);
        }

        /**
         * Generate and download Sales Slip PDF
         * GET /api/sales/{saleId}/slip?businessId={businessId}
         */
        @Transactional(readOnly = true)
        @GetMapping("/{saleId}/slip")
        public ResponseEntity<byte[]> downloadSalesSlip(
                        @PathVariable Long saleId,
                        @RequestParam(required = false) String businessId) {
                try {
                        System.out.println("\n========== GENERATE SALES SLIP PDF (FROM SALE) ==========");
                        System.out.println("Sale ID: " + saleId);
                        System.out.println("Business ID: " + businessId);

                        // Fetch sale
                        Sale sale = saleRepository.findById(saleId)
                                        .orElseThrow(() -> new RuntimeException("Sale not found with ID: " + saleId));

                        // Fetch customer
                        Customer customer = null;
                        if (sale.getCustomerId() != null) {
                                customer = customerRepository.findById(sale.getCustomerId()).orElse(null);
                        }

                        if ((businessId == null || businessId.trim().isEmpty()) && customer != null) {
                                businessId = customer.getBusinessId();
                        }

                        // Fetch sale items with fallback to repository and invoice items
                        List<SaleItem> saleItems = null;
                        try {
                                saleItems = sale.getItems();
                        } catch (Exception ignored) {}

                        if (saleItems == null || saleItems.isEmpty()) {
                                saleItems = saleItemRepository.findBySale_Id(saleId);
                        }

                        if (saleItems == null || saleItems.isEmpty()) {
                                saleItems = new java.util.ArrayList<>();
                                List<InvoiceItems> invItems = null;
                                if (sale.getInvoiceId() != null && !sale.getInvoiceId().trim().isEmpty()) {
                                        invItems = invoiceItemsRepository.findByInvoice_InvoiceIdAndIsDeletedFalse(sale.getInvoiceId());
                                }
                                if (invItems == null || invItems.isEmpty()) {
                                        List<Invoice> candidateInvoices = invoiceRepository.findByCustomer_IdAndIsDeletedFalse(sale.getCustomerId());
                                        for (Invoice inv : candidateInvoices) {
                                                if (Math.abs(inv.getTotalAmount() - (sale.getTotalAmount() != null ? sale.getTotalAmount() : 0.0)) < 0.05) {
                                                        invItems = invoiceItemsRepository.findByInvoice_InvoiceIdAndIsDeletedFalse(inv.getInvoiceId());
                                                        if (invItems != null && !invItems.isEmpty()) {
                                                                break;
                                                        }
                                                }
                                        }
                                }

                                if (invItems != null && !invItems.isEmpty()) {
                                        for (InvoiceItems invItem : invItems) {
                                                SaleItem si = new SaleItem();
                                                si.setSale(sale);
                                                si.setProduct(invItem.getProduct());
                                                si.setProductName(invItem.getItemName());
                                                si.setQuantity(invItem.getQty());
                                                si.setPrice(invItem.getPrice());
                                                si.setSaleItemId(invItem.getId());
                                                saleItems.add(si);
                                        }
                                }
                        }

                        if (saleItems == null) {
                                saleItems = new java.util.ArrayList<>();
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
