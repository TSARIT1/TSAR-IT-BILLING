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
import org.springframework.transaction.annotation.Transactional;
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

import org.springframework.web.bind.annotation.RequestParam;

import com.tsarit.billing.dto.InvoiceItemsDto;
import com.tsarit.billing.dto.InvoiceRequestDto;
import com.tsarit.billing.dto.InvoiceResponseDto;
import com.tsarit.billing.model.Customer;
import com.tsarit.billing.model.Invoice;
import com.tsarit.billing.model.InvoiceItems;
import com.tsarit.billing.model.Product;
import com.tsarit.billing.model.Sale;
import com.tsarit.billing.model.SaleItem;
import com.tsarit.billing.model.User;
import com.tsarit.billing.model.UserBusiness;
import com.tsarit.billing.model.GstDetails;
import com.tsarit.billing.model.Business;
import com.tsarit.billing.repository.CustomerRepository;
import com.tsarit.billing.repository.InvoiceItemsRepository;
import com.tsarit.billing.repository.InvoiceRepository;
import com.tsarit.billing.repository.ProductRepository;
import com.tsarit.billing.repository.SaleRepository;
import com.tsarit.billing.repository.SaleItemRepository;
import com.tsarit.billing.repository.UserRepository;
import com.tsarit.billing.repository.UserBusinessRepository;
import com.tsarit.billing.service.PurchaseService;
import com.tsarit.billing.service.SaleService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(originPatterns = "*")
@Transactional(readOnly = true)
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

    @Autowired(required = false)
    private SaleRepository saleRepository;

    @Autowired
    private com.tsarit.billing.service.AuditService auditService;

    @Autowired
    private SaleService saleService;

    @Autowired
    private PurchaseService purchaseService;

    @Autowired(required = false)
    private com.tsarit.billing.repository.InvoiceSeriesRepository invoiceSeriesRepository;

    @Autowired(required = false)
    private com.tsarit.billing.service.AccountingService accountingService;

    @Autowired(required = false)
    private com.tsarit.billing.repository.JournalEntryRepository journalEntryRepository;

    @Autowired(required = false)
    private com.tsarit.billing.repository.UserBusinessRepository userBusinessRepository;

    // =========================================================================
    // GET /api/invoices - Universal Endpoint for Mobile App & Web App
    // =========================================================================
    @GetMapping
    public ResponseEntity<?> getAllInvoices(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String businessId) {

        List<Invoice> invoices;
        if (userId != null && !userId.isBlank()) {
            invoices = invoiceRepo.findByUser_IdAndIsDeletedFalseOrderByInvoiceDateDesc(userId);
        } else if (businessId != null && !businessId.isBlank()) {
            invoices = invoiceRepo.findByIsDeletedFalse().stream()
                    .filter(inv -> inv.getCustomer() != null
                            && businessId.equals(inv.getCustomer().getBusinessId()))
                    .toList();
        } else {
            // Never dump every tenant's invoices: caller must scope by user or business.
            return ResponseEntity.badRequest().body(Map.of("message",
                    "userId or businessId is required"));
        }

        List<InvoiceResponseDto> response = invoices.stream()
                .map(inv -> {
                    int totalItems = itemRepo.countByInvoice_InvoiceId(inv.getInvoiceId());
                    int totalQuantity = itemRepo.findByInvoice_InvoiceId(inv.getInvoiceId())
                            .stream()
                            .mapToInt(InvoiceItems::getQty)
                            .sum();
                    Customer c = inv.getCustomer();
                    InvoiceResponseDto dto = new InvoiceResponseDto(
                            inv.getInvoiceId(),
                            inv.getInvoiceDate(),
                            c != null ? c.getId() : null,
                            c != null ? c.getName() : "-",
                            c != null ? c.getPhone() : (inv.getMobileNo() != null ? inv.getMobileNo() : "-"),
                            c != null ? c.getCity() : (inv.getCity() != null ? inv.getCity() : "-"),
                            inv.getTotalAmount(),
                            totalItems,
                            totalQuantity,
                            inv.isSaled(),
                            inv.isDeleted(),
                            inv.isPurchased(),
                            inv.isPartiallyReturned(),
                            inv.isFullyReturned());
                    applyInvoicePaymentStatus(dto, inv);
                    dto.setItems(itemRepo.findByInvoice_InvoiceId(inv.getInvoiceId())
                            .stream()
                            .map(this::toInvoiceItemDto)
                            .toList());
                    return dto;
                }).toList();

        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // POST /api/invoices - Universal POS Bill Creation (Mobile App & Web POS)
    // =========================================================================
    @PostMapping
    @Transactional(readOnly = false)
    public ResponseEntity<?> saveInvoiceUniversal(@RequestBody Map<String, Object> req) {
        try {
            String userId = (String) req.get("userId");
            User user = null;
            if (userId != null && !userId.isBlank()) {
                user = userRepository.findById(userId).orElse(null);
            }
            if (user == null) {
                List<User> users = userRepository.findAll();
                if (!users.isEmpty()) {
                    user = users.get(0);
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "No valid user found to associate bill"));
                }
            }

            // Customer
            String customerName = (String) req.get("customerName");
            if (customerName == null || customerName.isBlank()) customerName = "Walk-in Customer";
            String mobileNo = (String) req.get("mobileNo");
            if (mobileNo == null) mobileNo = "";

            Customer customer = null;
            if (req.get("customerId") != null) {
                try {
                    Long cid = Long.valueOf(req.get("customerId").toString());
                    customer = customerRepository.findById(cid).orElse(null);
                } catch (Exception ignored) {}
            }
            if (customer == null && !mobileNo.isBlank()) {
                customer = customerRepository.findByPhone(mobileNo).orElse(null);
            }
            if (customer == null) {
                customer = customerRepository.findByName(customerName).orElse(null);
            }
            if (customer == null) {
                customer = new Customer();
                customer.setName(customerName);
                customer.setPhone(!mobileNo.isBlank() ? mobileNo : ("9999" + (int)(Math.random() * 900000)));
                customer.setBusinessId(req.get("businessId") != null ? req.get("businessId").toString() : "BIZ-DEFAULT");
                customer.setCustomerType("Customer");
                customer.setStatus(Customer.Status.ACTIVE);
                try {
                    customer = customerRepository.save(customer);
                } catch (Exception ignored) {
                    customer = customerRepository.findAll().stream().findFirst().orElse(null);
                }
            }

            // Invoice - Check if this is an update to an already generated bill
            Invoice invoice;
            boolean isUpdate = false;
            String customInvoiceId = (String) req.get("invoiceId");
            boolean hasReplacementItems = req.get("items") instanceof List<?> replacementItems
                    && !replacementItems.isEmpty();
            if (customInvoiceId != null && !customInvoiceId.isBlank() && invoiceRepo.findById(customInvoiceId).isPresent()) {
                invoice = invoiceRepo.findById(customInvoiceId).get();
                isUpdate = true;
                if (hasReplacementItems) {
                    // Restore stock for previous items before replacing them.
                    List<InvoiceItems> existingItems = itemRepo.findByInvoice_InvoiceIdAndIsDeletedFalse(customInvoiceId);
                    for (InvoiceItems ex : existingItems) {
                        if (ex.getProduct() != null) {
                            try {
                                Product p = ex.getProduct();
                                int curStock = p.getRemainingStock() != null ? p.getRemainingStock() : 0;
                                p.setRemainingStock(curStock + ex.getQty());
                                productRepository.save(p);
                            } catch (Exception ignored) {}
                        }
                        ex.setDeleted(true);
                    }
                    itemRepo.saveAll(existingItems);
                }
            } else {
                invoice = new Invoice();
                if (customInvoiceId != null && !customInvoiceId.isBlank()) {
                    invoice.setInvoiceId(customInvoiceId);
                } else {
                    // Sequential per-business FY series (concurrency-safe). Legacy callers
                    // that omit invoiceId get a compliant number instead of a random one.
                    invoice.setInvoiceId(nextSeriesInvoiceNo(req, customer));
                }
            }
            invoice.setUser(user);
            invoice.setCustomer(customer);
            invoice.setMobileNo(mobileNo);
            invoice.setCity(req.get("city") != null ? req.get("city").toString() : "Store Counter");

            String dateStr = (String) req.get("invoiceDate");
            if (dateStr == null || dateStr.isBlank()) {
                dateStr = java.time.LocalDate.now().toString();
            }
            invoice.setInvoiceDate(dateStr);

            Number totalAmt = numberValue(req, "totalAmount", "grandTotal", "total");
            double total = totalAmt != null ? totalAmt.doubleValue() : 0.0;
            invoice.setTotalAmount(total);

            invoice.setSaled(true);
            invoice.setDeleted(false);

            Invoice savedInvoice = invoiceRepo.save(invoice);

            // Invoice items if provided
            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) req.get("items");
            int totalItemsCount = 0;
            if (itemsList != null && !itemsList.isEmpty()) {
                for (int i = 0; i < itemsList.size(); i++) {
                    Map<String, Object> itemMap = itemsList.get(i);
                    InvoiceItems item = new InvoiceItems();
                    item.setItemNo(i + 1);
                    String itemName = stringValue(itemMap, "itemName", "name", "productName");
                    item.setItemName(itemName);
                    Number qty = numberValue(itemMap, "quantity", "qty");
                    item.setQty(qty != null ? qty.intValue() : 1);
                    Number price = numberValue(itemMap, "unitPrice", "price", "rate");
                    item.setPrice(price != null ? price.doubleValue() : 0.0);
                    Number tax = numberValue(itemMap, "taxPercent", "tax", "gst");
                    item.setTax(tax != null ? tax.doubleValue() : 0.0);
                    Number lineTot = numberValue(itemMap, "lineTotal", "totalLineAmount", "total");
                    double computedLine = item.getQty() * item.getPrice();
                    if (lineTot == null && item.getTax() > 0) {
                        computedLine = computedLine + (computedLine * item.getTax() / 100.0);
                    }
                    item.setTotalLineAmount(lineTot != null ? lineTot.doubleValue() : computedLine);
                    // HSN cascade: request line → linked product → null (shown as NA).
                    Object hsnObj = itemMap.get("hsnCode") != null ? itemMap.get("hsnCode") : itemMap.get("hsn");
                    if (hsnObj != null && !hsnObj.toString().isBlank()) {
                        item.setHsnCode(hsnObj.toString().trim());
                    }
                    Product product = resolveInvoiceProduct(itemMap, item.getItemName());
                    if (product != null) {
                        item.setProduct(product);
                        if (item.getHsnCode() == null && product.getHsnCode() != null) {
                            item.setHsnCode(product.getHsnCode());
                        }
                        if (Boolean.FALSE.equals(product.getActive()) || Boolean.TRUE.equals(product.getDeleted())) {
                            return ResponseEntity.badRequest().body(Map.of("message",
                                    "Product is inactive: " + product.getProductName()));
                        }
                        if (product.getExpiryDate() != null && product.getExpiryDate().isBefore(java.time.LocalDate.now())) {
                            return ResponseEntity.badRequest().body(Map.of("message",
                                    "Product expired on " + product.getExpiryDate() + ": " + product.getProductName()));
                        }
                        int soldQty = item.getQty() > 0 ? item.getQty() : 1;
                        int curStock = product.getRemainingStock() != null ? product.getRemainingStock() : (product.getTotalStock() != null ? product.getTotalStock() : 0);
                        if (curStock <= 0) {
                            return ResponseEntity.badRequest().body(Map.of("message",
                                    "Product is currently out of stock: " + product.getProductName()));
                        }
                        if (curStock < soldQty) {
                            return ResponseEntity.badRequest().body(Map.of("message",
                                    "Only " + curStock + " units are available for: " + product.getProductName()));
                        }
                        product.setRemainingStock(curStock - soldQty);
                        productRepository.save(product);
                    }
                    item.setInvoice(savedInvoice);
                    item.setSaled(true);
                    itemRepo.save(item);
                    totalItemsCount++;
                }
            }
            savedInvoice.setTotalItems(totalItemsCount > 0 ? totalItemsCount : 1);
            invoiceRepo.save(savedInvoice);

            // CA-audit trail entry
            String auditBiz = req.get("businessId") != null ? req.get("businessId").toString()
                    : (customer.getBusinessId() != null ? customer.getBusinessId() : "UNKNOWN");
            auditService.log(auditBiz,
                    user != null && user.getId() != null ? user.getId() : "owner", "OWNER",
                    isUpdate ? "UPDATE" : "CREATE", "INVOICE",
                    savedInvoice.getInvoiceId(), total,
                    "POS bill " + (isUpdate ? "updated" : "raised") + " for " + customerName + (mobileNo.isBlank() ? "" : " (" + mobileNo + ")"));

            // Also create or update companion Sale record so sales reports & web app stay synchronized
            if (saleRepository != null) {
                try {
                    Sale sale = saleRepository.findByInvoiceId(savedInvoice.getInvoiceId()).orElse(null);
                    if (sale == null) {
                        sale = new Sale();
                        sale.setCreatedAt(java.time.LocalDateTime.now());
                        sale.setInvoiceId(savedInvoice.getInvoiceId());
                    }
                    sale.setCustomerId(customer != null ? customer.getId() : 1L);
                    sale.setTotalAmount(total);
                    boolean paid = requestMarksPaid(req);
                    sale.setIsPaid(paid);

                    if (itemsList != null && !itemsList.isEmpty()) {
                        // Clear previous sale items only when the caller sent replacement lines.
                        sale.getItems().clear();
                        for (int i = 0; i < itemsList.size(); i++) {
                            Map<String, Object> itemMap = itemsList.get(i);
                            SaleItem saleItem = new SaleItem();
                            saleItem.setSale(sale);
                            String itemName = stringValue(itemMap, "itemName", "name", "productName");
                            Product p = resolveInvoiceProduct(itemMap, itemName);
                            saleItem.setProduct(p);
                            saleItem.setProductName(itemName);
                            Number q = numberValue(itemMap, "quantity", "qty");
                            saleItem.setQuantity(q != null ? q.intValue() : 1);
                            Number pr = numberValue(itemMap, "unitPrice", "price", "rate");
                            saleItem.setPrice(pr != null ? pr.doubleValue() : 0.0);
                            saleItem.setSaleItemId(java.util.UUID.randomUUID().toString());
                            sale.getItems().add(saleItem);
                        }
                    }
                    saleRepository.save(sale);
                } catch (Exception e) {
                    System.err.println("Warning: failed to record companion Sale entity for invoice: " + e.getMessage());
                }
            }

            // Double-entry posting (idempotent; never fails the bill itself).
            postSalesLedgerBestEffort(savedInvoice, customer, total);

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Invoice and POS sale recorded successfully",
                    "invoiceId", savedInvoice.getInvoiceId(),
                    "totalAmount", savedInvoice.getTotalAmount(),
                    "isPaid", requestMarksPaid(req),
                    "status", requestMarksPaid(req) ? "PAID" : "UNPAID"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to save invoice: " + e.getMessage()));
        }
    }

    /**
     * Sequential per-business FY invoice number, concurrency-safe via
     * PESSIMISTIC_WRITE on the series row. Format: INV-{BUS4}-{FY}-{SEQ6}.
     * Falls back to a timestamp id only if the series table is unavailable.
     */
    private String nextSeriesInvoiceNo(Map<String, Object> req, Customer customer) {
        String biz = req.get("businessId") != null ? req.get("businessId").toString()
                : (customer != null && customer.getBusinessId() != null ? customer.getBusinessId() : "DEFAULT");
        String fy = indianFinYear(java.time.LocalDate.now());
        if (invoiceSeriesRepository == null) {
            return "INV-" + System.currentTimeMillis();
        }
        try {
            var series = invoiceSeriesRepository.findForUpdate(biz, fy)
                    .orElseGet(() -> invoiceSeriesRepository.save(new com.tsarit.billing.model.InvoiceSeries(biz, fy)));
            long seq = (series.getLastSeq() == null ? 0L : series.getLastSeq()) + 1;
            series.setLastSeq(seq);
            invoiceSeriesRepository.save(series);
            String bus4 = biz.replaceAll("[^A-Za-z0-9]", "");
            bus4 = (bus4.length() >= 4 ? bus4.substring(bus4.length() - 4) : String.format("%4s", bus4).replace(' ', '0'))
                    .toUpperCase();
            return String.format("INV-%s-%s-%06d", bus4, fy, seq);
        } catch (Exception e) {
            return "INV-" + System.currentTimeMillis();
        }
    }

    private static String indianFinYear(java.time.LocalDate date) {
        int y = date.getYear();
        int start = date.getMonthValue() >= 4 ? y : y - 1;
        return String.format("%02d-%02d", start % 100, (start + 1) % 100);
    }

    /**
     * Posts the sales journal once per invoice (idempotent on reference number).
     * Tax-exclusive line math: taxable = qty*price, tax = taxable*rate/100,
     * split CGST/SGST intra-state. Failures only log — the bill itself stands.
     */
    private void postSalesLedgerBestEffort(Invoice savedInvoice, Customer customer, double total) {
        if (accountingService == null || journalEntryRepository == null || savedInvoice == null) return;
        try {
            String tenant = customer != null && customer.getBusinessId() != null ? customer.getBusinessId() : "default";
            String ref = savedInvoice.getInvoiceId();
            if (journalEntryRepository.findByTenantIdAndReferenceNumber(tenant, ref).isPresent()) return;
            var lines = itemRepo.findByInvoice_InvoiceIdAndIsDeletedFalse(ref);
            java.math.BigDecimal taxable = java.math.BigDecimal.ZERO;
            java.math.BigDecimal taxSum = java.math.BigDecimal.ZERO;
            for (var li : lines) {
                java.math.BigDecimal lineTaxable = java.math.BigDecimal.valueOf(li.getQty())
                        .multiply(java.math.BigDecimal.valueOf(li.getPrice()));
                java.math.BigDecimal lineTax = lineTaxable
                        .multiply(java.math.BigDecimal.valueOf(li.getTax()))
                        .divide(java.math.BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                taxable = taxable.add(lineTaxable);
                taxSum = taxSum.add(lineTax);
            }
            java.math.BigDecimal cgst = taxSum.divide(java.math.BigDecimal.valueOf(2), 2, java.math.RoundingMode.HALF_UP);
            java.math.BigDecimal sgst = taxSum.subtract(cgst);
            java.math.BigDecimal grand = java.math.BigDecimal.valueOf(total);
            if (taxable.compareTo(java.math.BigDecimal.ZERO) == 0 && grand.compareTo(java.math.BigDecimal.ZERO) > 0) {
                taxable = grand;
            }
            String custName = customer != null ? customer.getName() : "Walk-in Customer";
            accountingService.postSalesInvoice(ref, custName, taxable, cgst, sgst,
                    java.math.BigDecimal.ZERO, grand, java.time.LocalDate.now(), tenant);
        } catch (Exception e) {
            System.err.println("Warning: sales ledger posting failed for " + savedInvoice.getInvoiceId() + ": " + e.getMessage());
        }
    }

    private InvoiceItemsDto toInvoiceItemDto(InvoiceItems item) {
        return new InvoiceItemsDto(
                item.getId(),
                item.getItemNo(),
                item.getItemName(),
                item.getQty(),
                item.getPrice(),
                item.getDiscount(),
                item.getTax(),
                item.getTotalLineAmount(),
                item.getProduct() != null ? item.getProduct().getId() : null);
    }

    private void applyInvoicePaymentStatus(InvoiceResponseDto dto, Invoice invoice) {
        boolean paid = invoice != null && invoice.isSaled();
        if (saleRepository != null && invoice != null && invoice.getInvoiceId() != null) {
            try {
                Sale sale = saleRepository.findByInvoiceId(invoice.getInvoiceId()).orElse(null);
                if (sale != null && sale.getIsPaid() != null) {
                    paid = Boolean.TRUE.equals(sale.getIsPaid());
                }
            } catch (Exception ignored) {}
        }
        dto.setIsPaid(paid);
        dto.setStatus(paid ? "PAID" : "UNPAID");
    }

    private boolean requestMarksPaid(Map<String, Object> req) {
        Object explicitPaid = req.get("isPaid");
        if (explicitPaid instanceof Boolean b) return b;
        if (explicitPaid instanceof String s && !s.isBlank()) {
            return "true".equalsIgnoreCase(s) || "paid".equalsIgnoreCase(s);
        }

        Object status = req.get("status");
        if (status != null) {
            String text = status.toString().trim();
            if ("UNPAID".equalsIgnoreCase(text) || "PENDING".equalsIgnoreCase(text) || "DUE".equalsIgnoreCase(text)) {
                return false;
            }
            if ("PAID".equalsIgnoreCase(text) || "SETTLED".equalsIgnoreCase(text)) {
                return true;
            }
        }

        Object paymentMode = req.get("paymentMode");
        if (paymentMode != null) {
            String mode = paymentMode.toString().toUpperCase(java.util.Locale.US);
            if (mode.contains("CREDIT") || mode.contains("DUE")) {
                return false;
            }
        }

        Number due = numberValue(req, "dueAmount", "balanceDue", "balance");
        return due == null || due.doubleValue() <= 0.0;
    }

    private String stringValue(Map<String, Object> map, String... keys) {
        if (map == null) return null;
        for (String key : keys) {
            Object value = map.get(key);
            if (value != null && !value.toString().isBlank()) {
                return value.toString();
            }
        }
        return null;
    }

    private Number numberValue(Map<String, Object> map, String... keys) {
        if (map == null) return null;
        for (String key : keys) {
            Object value = map.get(key);
            if (value instanceof Number number) {
                return number;
            }
            if (value instanceof String text && !text.isBlank()) {
                try {
                    return Double.parseDouble(text.trim());
                } catch (NumberFormatException ignored) {}
            }
        }
        return null;
    }

    private Product resolveInvoiceProduct(Map<String, Object> itemMap, String itemName) {
        Object productIdValue = itemMap.get("productId");
        if (productIdValue instanceof Number number) {
            Optional<Product> product = productRepository.findById(number.longValue());
            if (product.isPresent()) return product.get();
        }
        if (productIdValue instanceof String text && !text.isBlank()) {
            try {
                Optional<Product> product = productRepository.findById(Long.parseLong(text));
                if (product.isPresent()) return product.get();
            } catch (NumberFormatException ignored) {}
        }
        if (itemName != null && !itemName.isBlank()) {
            return productRepository.findByProductName(itemName).orElse(null);
        }
        return null;
    }

    @PostMapping("/create")
    @Transactional(readOnly = false)
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
        invoice.setInvoiceId(nextSeriesInvoiceNo(Map.of("businessId",
                customer.getBusinessId() != null ? customer.getBusinessId() : "DEFAULT"), customer));

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
            item.setItemName(dto.getItemName() != null ? dto.getItemName() : product.getProductName());
            item.setQty(dto.getQty() != null ? dto.getQty() : 1);
            item.setPrice(dto.getPrice() != null ? dto.getPrice() : product.getSellingPrice());
            item.setDiscount(dto.getDiscount() != null ? dto.getDiscount() : 0.0);
            item.setTax(dto.getTax() != null ? dto.getTax() : (product.getTaxRate() != null ? product.getTaxRate() : 0.0));
            item.setTotalLineAmount(dto.getTotalLineAmount() != null ? dto.getTotalLineAmount() : (item.getQty() * item.getPrice()));

            item.setInvoice(savedInvoice); // foreign key setup

            itemRepo.save(item);
        }

        // CA-audit trail entry (per line-item detail in description)
        String invBiz = customer.getBusinessId() != null ? customer.getBusinessId() : "UNKNOWN";
        StringBuilder itemSummary = new StringBuilder();
        for (InvoiceItemsDto dto : request.getItems()) {
            if (itemSummary.length() > 0) itemSummary.append(", ");
            itemSummary.append(dto.getItemName() != null ? dto.getItemName() : "item")
                    .append(" x").append(dto.getQty() != null ? dto.getQty() : 1);
        }
        auditService.log(invBiz, request.getUserId() != null ? request.getUserId() : "owner", "OWNER", "CREATE", "INVOICE",
                savedInvoice.getInvoiceId(),
                savedInvoice.getTotalAmount(),
                "Invoice created for " + customer.getName() + " — " + itemSummary);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Invoice created successfully");
        result.put("invoiceId", savedInvoice.getInvoiceId());
        result.put("totalAmount", savedInvoice.getTotalAmount());
        return ResponseEntity.ok(result);
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

                    InvoiceResponseDto dto = new InvoiceResponseDto(
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
                    applyInvoicePaymentStatus(dto, inv);
                    return dto;
                }).toList();

        return ResponseEntity.ok(response);
    }

    // Get single invoice by ID with full details (ownership-enforced)
    @GetMapping("/{invoiceId}")
    public ResponseEntity<?> getInvoiceById(@PathVariable String invoiceId) {
        Invoice invoice = invoiceRepo.findByInvoiceIdAndIsDeletedFalse(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found with ID: " + invoiceId));
        // Caller must own the bill: same user, or same business via membership.
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            Object principal = auth != null ? auth.getPrincipal() : null;
            if (principal instanceof com.tsarit.billing.model.User caller && userBusinessRepository != null) {
                boolean sameUser = invoice.getUser() != null && caller.getId() != null
                        && caller.getId().equals(invoice.getUser().getId());
                boolean sameBusiness = false;
                if (!sameUser && invoice.getCustomer() != null && invoice.getCustomer().getBusinessId() != null) {
                    String invBiz = invoice.getCustomer().getBusinessId();
                    sameBusiness = userBusinessRepository.findByUserId(caller.getId()).stream()
                            .anyMatch(ub -> ub.getBusiness() != null && invBiz.equals(ub.getBusiness().getId()));
                }
                if (!sameUser && !sameBusiness) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This invoice does not belong to your business");
                }
            }
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception ignored) {}
        List<InvoiceItems> items = itemRepo.findByInvoice_InvoiceIdAndIsDeletedFalse(invoiceId);

        Map<String, Object> map = new HashMap<>();
        map.put("invoiceId", invoice.getInvoiceId());
        map.put("id", invoice.getInvoiceId());
        map.put("invoiceDate", invoice.getInvoiceDate());
        map.put("totalAmount", invoice.getTotalAmount());
        map.put("totalItems", invoice.getTotalItems());
        map.put("isSaled", invoice.isSaled());
        map.put("saled", invoice.isSaled());
        map.put("customerId", invoice.getCustomer() != null ? invoice.getCustomer().getId() : null);
        map.put("customerName", invoice.getCustomer() != null ? invoice.getCustomer().getName() : "Unknown");
        map.put("mobileNo", invoice.getCustomer() != null ? invoice.getCustomer().getPhone() : (invoice.getMobileNo() != null ? invoice.getMobileNo() : "-"));
        map.put("city", invoice.getCustomer() != null ? invoice.getCustomer().getCity() : (invoice.getCity() != null ? invoice.getCity() : "-"));
        map.put("items", items.stream().map(i -> {
            Map<String, Object> it = new HashMap<>();
            it.put("id", i.getId());
            it.put("itemId", i.getId());
            it.put("itemNo", i.getItemNo());
            it.put("itemName", i.getItemName());
            it.put("hsnCode", i.getHsnCode());
            it.put("qty", i.getQty());
            it.put("price", i.getPrice());
            it.put("discount", i.getDiscount());
            it.put("tax", i.getTax());
            it.put("totalLineAmount", i.getTotalLineAmount());
            it.put("productId", i.getProduct() != null ? i.getProduct().getId() : null);
            return it;
        }).toList());

        return ResponseEntity.ok(map);
    }

    // Update invoice by ID (allows updating already generated and sold bills)
    @PutMapping("/update/{invoiceId}")
    @Transactional(readOnly = false)
    public ResponseEntity<?> updateInvoice(
            @PathVariable String invoiceId,
            @RequestBody InvoiceRequestDto request) {

        // Find existing invoice
        Invoice existingInvoice = invoiceRepo.findByInvoiceIdAndIsDeletedFalse(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));

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
        Map<String, InvoiceItemsDto> requestMap = request.getItems() != null
                ? request.getItems().stream()
                        .filter(i -> i.getId() != null)
                        .collect(Collectors.toMap(
                                InvoiceItemsDto::getId,
                                i -> i))
                : new HashMap<>();

        // Update or soft-delete existing items with stock synchronization
        for (InvoiceItems dbItem : dbItems) {

            InvoiceItemsDto dto = requestMap.get(dbItem.getId());

            if (dto == null) {
                dbItem.setDeleted(true);
                // Return stock if this bill was sold
                if (existingInvoice.isSaled() && dbItem.getProduct() != null) {
                    try {
                        Product p = dbItem.getProduct();
                        int curStock = p.getRemainingStock() != null ? p.getRemainingStock() : 0;
                        p.setRemainingStock(curStock + dbItem.getQty());
                        productRepository.save(p);
                    } catch (Exception ignored) {}
                }
                continue;
            }

            // Sync stock difference
            if (existingInvoice.isSaled() && dbItem.getProduct() != null) {
                int oldQty = dbItem.getQty();
                int newQty = dto.getQty();
                int diff = newQty - oldQty;
                if (diff != 0) {
                    try {
                        Product p = dbItem.getProduct();
                        int curStock = p.getRemainingStock() != null ? p.getRemainingStock() : 0;
                        p.setRemainingStock(Math.max(0, curStock - diff));
                        productRepository.save(p);
                    } catch (Exception ignored) {}
                }
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
        if (request.getItems() != null) {
            for (InvoiceItemsDto dto : request.getItems()) {

                if (dto.getId() != null)
                    continue;

                Product product = productRepository.findById(dto.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found"));

                // Deduct stock for new items if bill is sold
                if (existingInvoice.isSaled()) {
                    try {
                        int curStock = product.getRemainingStock() != null ? product.getRemainingStock() : 0;
                        product.setRemainingStock(Math.max(0, curStock - dto.getQty()));
                        productRepository.save(product);
                    } catch (Exception ignored) {}
                }

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
                if (existingInvoice.isSaled()) {
                    newItem.setSaled(true);
                }

                itemRepo.save(newItem);
            }
        }

        // Synchronize companion Sale record if present
        if (saleRepository != null) {
            try {
                Sale linkedSale = saleRepository.findByInvoiceId(invoiceId).orElse(null);
                if (linkedSale != null) {
                    linkedSale.setTotalAmount(existingInvoice.getTotalAmount());
                    if (existingInvoice.getCustomer() != null) {
                        linkedSale.setCustomerId(existingInvoice.getCustomer().getId());
                    }
                    saleRepository.save(linkedSale);
                }
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok("Invoice updated successfully.");
    }

    // Delete invoice by ID
    @DeleteMapping("/delete/{invoiceId}")
    @Transactional(readOnly = false)
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
    @Transactional(readOnly = false)
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
    @Transactional(readOnly = false)
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
    @Transactional(readOnly = false)
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

                    InvoiceResponseDto dto = new InvoiceResponseDto(
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
                    applyInvoicePaymentStatus(dto, inv);
                    return dto;
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
            @org.springframework.web.bind.annotation.RequestParam(required = false) String businessId) {
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
            @org.springframework.web.bind.annotation.RequestParam(required = false) String businessId) {
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
