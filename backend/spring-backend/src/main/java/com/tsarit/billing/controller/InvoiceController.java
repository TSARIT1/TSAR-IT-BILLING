package com.tsarit.billing.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.tsarit.billing.dto.InvoiceItemsDto;
import com.tsarit.billing.dto.InvoiceRequestDto;
import com.tsarit.billing.dto.InvoiceResponseDto;
import com.tsarit.billing.model.Customer;
import com.tsarit.billing.model.Invoice;
import com.tsarit.billing.model.InvoiceItems;
import com.tsarit.billing.model.Product;
import com.tsarit.billing.model.User;
import com.tsarit.billing.model.UserBusiness;
import com.tsarit.billing.model.GstDetails;
import com.tsarit.billing.model.Business;
import com.tsarit.billing.repository.CustomerRepository;
import com.tsarit.billing.repository.InvoiceItemsRepository;
import com.tsarit.billing.repository.InvoiceRepository;
import com.tsarit.billing.repository.ProductRepository;
import com.tsarit.billing.repository.UserRepository;
import com.tsarit.billing.repository.UserBusinessRepository;
import com.tsarit.billing.service.PurchaseService;
import com.tsarit.billing.service.SaleService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvoiceRepository invoiceRepo;

    @Autowired
    private InvoiceItemsRepository itemRepo;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private com.tsarit.billing.repository.BusinessRepository businessRepository;

    @Autowired
    private com.tsarit.billing.repository.GstDetailsRepository gstDetailsRepository;

    @Autowired
    private com.tsarit.billing.service.PdfService pdfService;

    @Autowired
    private UserBusinessRepository userBusinessRepo;

    private final SaleService saleService;

    private final PurchaseService purchaseService;

    public InvoiceController(SaleService saleService,
            PurchaseService purchaseService) {
        this.saleService = saleService;
        this.purchaseService = purchaseService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createInvoice(
            @Valid @RequestBody InvoiceRequestDto request) {

        if (request.getUserId() == null) {
            throw new RuntimeException("User ID is required");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Invoice items are required");
        }

        System.out.println("UserId: " + request.getUserId());
        System.out.println("CustomerId: " + request.getCustomerId());

        for (InvoiceItemsDto dto : request.getItems()) {
            System.out.println("ProductId: " + dto.getProductId());
        }
        // Fetch user object
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Save invoice
        Invoice invoice = new Invoice();
        invoice.setUser(user); // FK relation
        invoice.setCustomer(customer);
        invoice.setCity(request.getCity());
        invoice.setMobileNo(request.getMobileNo());
        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setTotalItems(request.getTotalItems());
        invoice.setTotalAmount(request.getTotalAmount());

        Invoice savedInvoice = invoiceRepo.save(invoice);

        // Save each item
        for (InvoiceItemsDto dto : request.getItems()) {

            if (dto.getProductId() == null) {
                throw new RuntimeException("Product ID is required for invoice item");
            }

            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            InvoiceItems item = new InvoiceItems();
            item.setItemNo(dto.getItemNo());
            item.setProduct(product);
            item.setItemName(product.getProductName());
            item.setQty(dto.getQty());
            item.setPrice(dto.getPrice());
            item.setDiscount(dto.getDiscount());
            item.setTax(dto.getTax());
            item.setTotalLineAmount(dto.getTotalLineAmount());

            item.setInvoice(savedInvoice); // foreign key setup

            itemRepo.save(item);
        }
        // CREATE SALE FROM INVOICE
        // saleService.createSaleFromInvoice(savedInvoice.getInvoiceId());

        return ResponseEntity.ok("Invoice created successfully.");
    }

    // Get invoices by user ID
    @GetMapping("/list/{userId}")
    public ResponseEntity<List<InvoiceResponseDto>> getInvoicesByUser(@PathVariable String userId) {

        // List<Invoice> invoices = invoiceRepo.findByUser_Id(userId);

        List<Invoice> invoices = invoiceRepo.findByUser_IdAndIsDeletedFalseOrderByInvoiceDateDesc(userId);

        List<InvoiceResponseDto> response = invoices.stream()
                .map(inv -> {

                    // Count items from invoice_items table
                    int totalItems = itemRepo.countByInvoice_InvoiceId(
                            inv.getInvoiceId());

                    // Calculate total quantity from all items
                    int totalQuantity = itemRepo.findByInvoice_InvoiceId(inv.getInvoiceId())
                            .stream()
                            .mapToInt(InvoiceItems::getQty)
                            .sum();

                    Customer c = inv.getCustomer();

                    return new InvoiceResponseDto(
                            inv.getInvoiceId(),
                            inv.getInvoiceDate(),
                            c != null ? c.getId() : null,
                            c != null ? c.getName() : "-",
                            c != null ? c.getPhone() : "-",
                            c != null ? c.getCity() : "-",
                            inv.getTotalAmount(),
                            totalItems,
                            totalQuantity,
                            inv.isSaled(),
                            inv.isDeleted(),
                            inv.isPurchased(),
                            inv.isPartiallyReturned(),
                            inv.isFullyReturned());
                }).toList();

        return ResponseEntity.ok(response);
    }

    // Update invoice by ID
    @PutMapping("/update/{invoiceId}")
    public ResponseEntity<?> updateInvoice(
            @PathVariable String invoiceId,
            @RequestBody InvoiceRequestDto request) {

        // Find existing invoice
        Invoice existingInvoice = invoiceRepo.findByInvoiceIdAndIsDeletedFalse(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));

        if (existingInvoice.isSaled()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Sold invoice cannot be edited");
        }
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            existingInvoice.setCustomer(customer);
        }

        existingInvoice.setInvoiceDate(request.getInvoiceDate());
        existingInvoice.setTotalItems(request.getTotalItems());
        existingInvoice.setTotalAmount(request.getTotalAmount());

        // Save updated invoice
        invoiceRepo.save(existingInvoice);

        List<InvoiceItems> dbItems = itemRepo.findByInvoice_InvoiceIdAndIsDeletedFalse(invoiceId);

        // Map request items by ID
        Map<String, InvoiceItemsDto> requestMap = request.getItems().stream()
                .filter(i -> i.getId() != null)
                .collect(Collectors.toMap(
                        InvoiceItemsDto::getId,
                        i -> i));

        // Update or soft-delete existing items
        for (InvoiceItems dbItem : dbItems) {

            InvoiceItemsDto dto = requestMap.get(dbItem.getId());

            if (dto == null) {
                dbItem.setDeleted(true);
                continue;
            }

            if (dbItem.isSaled()) {
                continue;
            }

            dbItem.setItemNo(dto.getItemNo());
            dbItem.setQty(dto.getQty());
            dbItem.setPrice(dto.getPrice());
            dbItem.setDiscount(dto.getDiscount());
            dbItem.setTax(dto.getTax());
            dbItem.setTotalLineAmount(dto.getTotalLineAmount());
        }

        itemRepo.saveAll(dbItems);
        // Insert NEW items
        for (InvoiceItemsDto dto : request.getItems()) {

            if (dto.getId() != null)
                continue;

            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            InvoiceItems newItem = new InvoiceItems();
            newItem.setItemNo(dto.getItemNo());
            newItem.setItemName(dto.getItemName());
            newItem.setProduct(product);
            newItem.setQty(dto.getQty());
            newItem.setPrice(dto.getPrice());
            newItem.setDiscount(dto.getDiscount());
            newItem.setTax(dto.getTax());
            newItem.setTotalLineAmount(dto.getTotalLineAmount());
            newItem.setInvoice(existingInvoice);

            itemRepo.save(newItem);
        }

        return ResponseEntity.ok("Invoice updated successfully.");
    }

    // Delete invoice by ID
    @DeleteMapping("/delete/{invoiceId}")
    public ResponseEntity<?> deleteInvoice(@PathVariable String invoiceId) {

        // Check if invoice exists
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));

        if (invoice.isSaled()) {
            throw new RuntimeException(
                    "Invoice already sold. Cannot delete. You may cancel it.");
        }

        if (invoice.isDeleted()) {
            return ResponseEntity.badRequest()
                    .body("Invoice already deleted.");
        }

        // Delete all associated items first (due to foreign key constraint)
        // List<InvoiceItems> items = itemRepo.findByInvoice_InvoiceId(invoiceId);
        // itemRepo.deleteAll(items);

        invoice.setDeleted(true); // soft delete
        // Delete the invoice
        // invoiceRepo.delete(invoice);
        invoiceRepo.save(invoice);
        // itemRepo.softDeleteByInvoiceId(invoiceId);
        return ResponseEntity.ok("Invoice deleted successfully.");
    }

    /// For Invoice Items

    @GetMapping("/{invoiceId}/items")
    public ResponseEntity<List<InvoiceItemsDto>> getInvoiceItems(
            @PathVariable String invoiceId) {

        List<InvoiceItems> items = itemRepo.findByInvoice_InvoiceIdOrderByItemNoAsc(invoiceId);

        List<InvoiceItemsDto> response = items.stream()
                .map(item -> new InvoiceItemsDto(
                        item.getId(),
                        item.getItemNo(),
                        item.getItemName(),
                        item.getQty(),
                        item.getPrice(),
                        item.getDiscount(),
                        item.getTax(),
                        item.getTotalLineAmount(),
                        item.getProduct() != null ? item.getProduct().getId() : null))
                .toList();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{invoiceId}/items/{id}")
    public ResponseEntity<?> deleteInvoiceItem(
            @PathVariable String invoiceId,
            @PathVariable String id) {

        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.isSaled()) {
            return ResponseEntity.badRequest()
                    .body("Cannot delete items from a sold invoice");
        }

        // Deleted invoice → no item delete
        if (invoice.isDeleted()) {
            return ResponseEntity.badRequest()
                    .body("Cannot delete items from a deleted invoice");
        }

        InvoiceItems item = itemRepo.findByIdAndInvoice_InvoiceId(id, invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice Item not found with ID: " + id));

        item.setDeleted(true); // soft deleted
        itemRepo.save(item);

        return ResponseEntity.ok("Invoice item deleted successfully.");
    }

    @PostMapping("/{invoiceId}/confirm-sale")
    public ResponseEntity<?> confirmSaleFromInvoice(
            @PathVariable String invoiceId) {

        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.isDeleted()) {
            throw new RuntimeException("Deleted invoice cannot be sold");
        }

        if (invoice.isSaled()) {
            throw new RuntimeException("Invoice already sold");
        }

        saleService.createSaleFromInvoice(invoiceId);
        invoice.setSaled(true);
        invoiceRepo.save(invoice);
        return ResponseEntity.ok("Sale created successfully from invoice");
    }

    @PostMapping("/{invoiceId}/confirm-purchase")
    public ResponseEntity<?> confirmPurchase(
            @PathVariable String invoiceId) {

        purchaseService.confirmPurchase(invoiceId);

        return ResponseEntity.ok("Purchase confirmed successfully");
    }

    //// Get PURCHASE invoices only (is_saled = false AND customer is supplier)
    @GetMapping("/list/purchases/{userId}")
    public ResponseEntity<List<InvoiceResponseDto>> getPurchaseInvoicesByUser(@PathVariable String userId) {

        // Fetch only purchase invoices with supplier customers
        List<Invoice> purchaseInvoices = invoiceRepo.findPurchaseInvoicesByUserId(userId);

        List<InvoiceResponseDto> response = purchaseInvoices.stream()
                .map(inv -> {
                    // Count items from invoice_items table
                    int totalItems = itemRepo.countByInvoice_InvoiceId(inv.getInvoiceId());

                    // Calculate total quantity from all items
                    int totalQuantity = itemRepo.findByInvoice_InvoiceId(inv.getInvoiceId())
                            .stream()
                            .mapToInt(InvoiceItems::getQty)
                            .sum();

                    Customer c = inv.getCustomer();

                    return new InvoiceResponseDto(
                            inv.getInvoiceId(),
                            inv.getInvoiceDate(),
                            c != null ? c.getId() : null,
                            c != null ? c.getName() : "-",
                            c != null ? c.getPhone() : "-",
                            c != null ? c.getCity() : "-",
                            inv.getTotalAmount(),
                            totalItems,
                            totalQuantity,
                            inv.isSaled(),
                            inv.isDeleted(),
                            inv.isPurchased(),
                            inv.isPartiallyReturned(),
                            inv.isFullyReturned());
                }).toList();

        return ResponseEntity.ok(response);
    }

    /**
     * Get print data for a purchase invoice
     * Includes business details and supplier information
     * GET /api/invoices/print-data/{invoiceId}?businessId={businessId}
     */
    @GetMapping("/print-data/{invoiceId}")
    public ResponseEntity<?> getInvoicePrintData(
            @PathVariable String invoiceId,
            @org.springframework.web.bind.annotation.RequestParam String businessId) {
        try {
            System.out.println("\n========== GET INVOICE PRINT DATA CONTROLLER ==========");
            System.out.println("Invoice ID: " + invoiceId);
            System.out.println("Business ID: " + businessId);

            // Fetch invoice
            Invoice invoice = invoiceRepo.findById(invoiceId)
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            // Fetch business settings
            Business business = businessRepository.findById(businessId)
                    .orElse(null);

            // Fetch supplier (customer)
            Customer supplier = invoice.getCustomer();

            // Create response DTOs
            Map<String, Object> response = new HashMap<>();

            // Business data
            if (business != null) {
                Map<String, Object> businessData = new HashMap<>();
                businessData.put("businessName", business.getBusinessName());
                businessData.put("phoneNo", business.getPhoneNo());
                businessData.put("email", business.getEmail());

                // Fetch GST number from gst_details table
                String gstNo = null;
                try {
                    GstDetails gstDetails = gstDetailsRepository.findByBusiness_Id(businessId)
                            .orElse(null);
                    if (gstDetails != null && gstDetails.getIsGstRegistered() != null
                            && gstDetails.getIsGstRegistered()) {
                        gstNo = gstDetails.getGstNo();
                    }
                } catch (Exception e) {
                    System.err.println("Error fetching GST details: " + e.getMessage());
                }
                businessData.put("gstNo", gstNo);

                businessData.put("address", business.getAddress());
                businessData.put("city", business.getCity());
                businessData.put("state", business.getState());
                businessData.put("pincode", business.getPincode());
                businessData.put("logo",
                        business.getBusinessLogo() != null
                                ? java.util.Base64.getEncoder().encodeToString(business.getBusinessLogo())
                                : null);
                response.put("business", businessData);
            }

            // Supplier data
            if (supplier != null) {
                Map<String, Object> supplierData = new HashMap<>();
                supplierData.put("name", supplier.getName());
                supplierData.put("id", supplier.getId());
                supplierData.put("phone", supplier.getPhone());
                supplierData.put("city", supplier.getCity());
                response.put("supplier", supplierData);
            }

            System.out.println("========== INVOICE PRINT DATA CONTROLLER COMPLETE ==========\n");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("\n========== ERROR IN INVOICE PRINT DATA CONTROLLER ==========");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch invoice print data: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Generate and download PDF for a single purchase invoice
     * GET /api/invoices/pdf/{invoiceId}?businessId={businessId}
     */
    @GetMapping("/pdf/{invoiceId}")
    public ResponseEntity<byte[]> downloadPurchaseInvoicePdf(
            @PathVariable String invoiceId,
            @org.springframework.web.bind.annotation.RequestParam String businessId) {
        try {
            System.out.println("\n========== GENERATE PURCHASE INVOICE PDF ==========");
            System.out.println("Invoice ID: " + invoiceId);
            System.out.println("Business ID: " + businessId);

            // Fetch invoice
            Invoice invoice = invoiceRepo.findById(invoiceId)
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            // Fetch invoice items
            List<InvoiceItems> items = itemRepo.findByInvoice_InvoiceIdAndIsDeletedFalse(invoiceId);

            // Generate PDF
            byte[] pdfBytes = pdfService.generateSinglePurchaseInvoicePdf(invoice, items, businessId);

            if (pdfBytes == null || pdfBytes.length == 0) {
                throw new RuntimeException("Failed to generate PDF");
            }

            // Set response headers
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    "purchase-invoice-" + invoiceId.substring(0, 8) + ".pdf");

            System.out.println("PDF generated successfully, size: " + pdfBytes.length + " bytes");
            System.out.println("========== PDF GENERATION COMPLETE ==========\n");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            System.err.println("\n========== ERROR GENERATING PDF ==========");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Generate and download Sales Slip PDF
     * GET /api/invoices/slip/{invoiceId}?businessId={businessId}
     */
    @GetMapping("/slip/{invoiceId}")
    public ResponseEntity<byte[]> downloadSalesSlip(
            @PathVariable String invoiceId,
            @org.springframework.web.bind.annotation.RequestParam String businessId) {
        try {
            System.out.println("\n========== GENERATE SALES SLIP PDF ==========");
            System.out.println("Invoice ID: " + invoiceId);
            System.out.println("Business ID: " + businessId);

            // Fetch invoice
            Invoice invoice = invoiceRepo.findById(invoiceId)
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            // Fetch invoice items
            List<InvoiceItems> invoiceItems = itemRepo.findByInvoice_InvoiceIdAndIsDeletedFalse(invoiceId);

            if (invoiceItems == null || invoiceItems.isEmpty()) {
                throw new RuntimeException("No invoice items found for this invoice");
            }

            // Generate Sales Slip PDF
            byte[] pdfBytes = pdfService.generateSalesSlip(invoice, invoiceItems, businessId);

            if (pdfBytes == null || pdfBytes.length == 0) {
                throw new RuntimeException("Failed to generate sales slip PDF");
            }

            // Set response headers
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    "sales-slip-" + invoiceId.substring(0, Math.min(8, invoiceId.length())) + ".pdf");

            System.out.println("Sales slip PDF generated successfully, size: " + pdfBytes.length + " bytes");
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

    /**
     * Generate and download Purchase Slip PDF
     * GET /api/invoices/purchase-slip/{invoiceId}?businessId={businessId}
     */
    @GetMapping("/purchase-slip/{invoiceId}")
    public ResponseEntity<byte[]> downloadPurchaseSlip(
            @PathVariable String invoiceId)
            {
        try {
            System.out.println("\n========== GENERATE PURCHASE SLIP PDF ==========");
            System.out.println("Invoice ID: " + invoiceId);

            // Fetch invoice
            Invoice invoice = invoiceRepo.findById(invoiceId)
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            if (invoice.getCustomer() == null) {
                throw new RuntimeException("Customer not linked with invoice");
            }

            Customer customer = customerRepository.findById(invoice.getCustomer().getId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            
            //  Get businessId from customer
            String businessId = customer.getBusinessId();
            if (businessId == null || businessId.isEmpty()) {
                throw new RuntimeException("Business ID not found for customer");
            }

            System.out.println("Business ID from customer table: " + businessId);

            // Fetch invoice items
            List<InvoiceItems> invoiceItems = itemRepo.findByInvoice_InvoiceIdAndIsDeletedFalse(invoiceId);

            if (invoiceItems == null || invoiceItems.isEmpty()) {
                throw new RuntimeException("No invoice items found for this invoice");
            }

            // Generate Purchase Slip PDF
            byte[] pdfBytes = pdfService.generatePurchaseSlip(invoice, invoiceItems, businessId);

            if (pdfBytes == null || pdfBytes.length == 0) {
                throw new RuntimeException("Failed to generate purchase slip PDF");
            }

            // Set response headers
           HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    "purchase-slip-" + invoiceId.substring(0, Math.min(8, invoiceId.length())) + ".pdf");

            System.out.println("Purchase slip PDF generated successfully, size: " + pdfBytes.length + " bytes");
            System.out.println("========== PURCHASE SLIP PDF GENERATION COMPLETE ==========\n");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            System.err.println("\n========== ERROR GENERATING PURCHASE SLIP PDF ==========");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Error generating purchase slip: " + e.getMessage()).getBytes());
        }
    }

}
