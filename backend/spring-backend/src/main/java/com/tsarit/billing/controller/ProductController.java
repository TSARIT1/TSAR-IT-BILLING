
package com.tsarit.billing.controller;

import com.tsarit.billing.dto.ProductRequestDto;
import com.tsarit.billing.dto.ProductResponseDto;
import com.tsarit.billing.dto.ProductStockSummaryDto;
import com.tsarit.billing.dto.ProductUpdateRequestDto;
import com.tsarit.billing.model.Godown;
import com.tsarit.billing.model.Product;
import com.tsarit.billing.model.UserBusiness;
import com.tsarit.billing.repository.GodownRepository;
import com.tsarit.billing.repository.InvoiceItemsRepository;
import com.tsarit.billing.repository.ProductRepository;
import com.tsarit.billing.repository.UserBusinessRepository;
import com.tsarit.billing.service.PdfService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import com.tsarit.billing.service.AuditService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(originPatterns = "*")
@Transactional(readOnly = true)
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private GodownRepository godownRepository;

    @Autowired
    private UserBusinessRepository userBusinessRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private InvoiceItemsRepository invoiceItemsRepository;

    @Autowired
    private PdfService pdfService;

    // ✅ CREATE PRODUCT (all fields optional — sensible defaults applied)
    @PostMapping("/createProduct")
    @Transactional(readOnly = false)
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> request) {

        Product product = new Product();

        // Barcode uniqueness (409) — prevents duplicate scan matches at POS.
        String barcodeReq = request.get("barcode") != null ? request.get("barcode").toString().trim() : "";
        if (!barcodeReq.isEmpty() && productRepository.existsByBarcode(barcodeReq)) {
            return ResponseEntity.status(409).body(Map.of("message", "Barcode already exists for another product"));
        }
        // HSN format (422) — 4/6/8 digits, blank allowed.
        String hsnReq = request.get("hsnCode") != null ? request.get("hsnCode").toString().trim() : "";
        if (!hsnReq.isEmpty() && !hsnReq.matches("^[0-9]{4}([0-9]{2})?([0-9]{2})?$")) {
            return ResponseEntity.status(422).body(Map.of("message", "Invalid HSN: must be 4, 6 or 8 digits"));
        }

        String productCode = (String) request.get("productCode");
        if (productCode == null || productCode.isBlank()) {
            productCode = "SKU-" + System.currentTimeMillis();
        }
        String productName = (String) request.get("productName");
        if (productName == null || productName.isBlank()) {
            productName = "Unnamed Item";
        }
        product.setProductCode(productCode);
        product.setProductName(productName);
        product.setCategory((String) request.get("category"));
        product.setUnit((String) request.get("unit"));
        product.setBarcode((String) request.get("barcode"));
        product.setHsnCode((String) request.get("hsnCode"));
        product.setSacCode((String) request.get("sacCode"));
        product.setDescription((String) request.get("description"));

        Number purchasePrice = (Number) request.get("purchasePrice");
        product.setPurchasePrice(purchasePrice != null ? purchasePrice.doubleValue() : 0.0);

        Number sellingPrice = (Number) request.get("sellingPrice");
        product.setSellingPrice(sellingPrice != null ? sellingPrice.doubleValue() : 0.0);

        Number stockQty = (Number) (request.get("stockQuantity") != null ? request.get("stockQuantity") : request.get("currentStock"));
        int stock = stockQty != null ? stockQty.intValue() : 0;
        product.setTotalStock(stock);
        product.setRemainingStock(stock);

        Number minStock = (Number) request.get("minStockLevel");
        product.setMinStockLevel(minStock != null ? minStock.intValue() : 0);

        Number tax = (Number) request.get("taxRate");
        product.setTaxRate(tax != null ? tax.doubleValue() : 0.0);

        Number discount = (Number) request.get("discount");
        product.setDiscount(discount != null ? discount.doubleValue() : 0.0);

        String expiryStr = (String) request.get("expiryDate");
        if (expiryStr != null && !expiryStr.isBlank()) {
            try {
                product.setExpiryDate(LocalDate.parse(expiryStr));
            } catch (Exception ignored) {}
        }

        product.setManufacturerNameOrCode((String) request.get("manufacturerName"));
        product.setSupplierNameOrCode((String) request.get("supplierName"));

        // 🔹 Relations
        String godownId = (String) request.get("godownId");
        String userBusinessId = (String) request.get("userBusinessId");

        if (godownId != null && !godownId.isBlank()) {
            godownRepository.findById(godownId).ifPresent(product::setGodown);
        }

        if (userBusinessId != null && !userBusinessId.isBlank()) {
            userBusinessRepository.findById(userBusinessId).ifPresent(product::setUserBusiness);
        }
        if (product.getUserBusiness() == null) {
            String businessId = (String) request.get("businessId");
            if (businessId != null && !businessId.isBlank()) {
                List<UserBusiness> ubList = userBusinessRepository.findByBusiness_Id(businessId);
                if (!ubList.isEmpty()) {
                    product.setUserBusiness(ubList.get(0));
                }
            }
        }
        if (product.getUserBusiness() == null) {
            String userId = (String) request.get("userId");
            if (userId != null && !userId.isBlank()) {
                List<UserBusiness> ubList = userBusinessRepository.findByUserId(userId);
                if (!ubList.isEmpty()) {
                    product.setUserBusiness(ubList.get(0));
                }
            }
        }

        product.setActive(true);
        product.setDeleted(false);

        Product saved = productRepository.save(product);

        String bid = product.getUserBusiness() != null ? product.getUserBusiness().getId()
                : (request.get("userBusinessId") instanceof String s && !s.isBlank() ? s : "UNKNOWN");
        auditService.log(bid, "owner", "OWNER", "CREATE", "PRODUCT",
                String.valueOf(saved.getId()), saved.getSellingPrice(),
                "Item added: " + saved.getProductName() + " (" + saved.getProductCode() + ")");

        return ResponseEntity.ok(toDto(saved));
    }
    /* ================= GET PRODUCTS BY GODOWN ================= */

    @GetMapping("/godown/{godownId}")
    public ResponseEntity<List<ProductResponseDto>> getByGodown(
            @PathVariable String godownId) {
        List<Product> products = productRepository
                .findByGodown_GodownIdAndActiveTrueAndDeletedFalseAndRemainingStockGreaterThan(
                        godownId, 0);

        List<ProductResponseDto> response = products.stream()
                .map(this::toDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/stock-summary")
    public ResponseEntity<List<ProductStockSummaryDto>> getProductStockSummary(
            @RequestParam(required = false) String userBusinessId) {

        List<Product> products;
        if (userBusinessId != null && !userBusinessId.trim().isEmpty()) {
            products = productRepository.findByUserBusiness_IdAndActiveTrueAndDeletedFalse(userBusinessId.trim());
        } else {
            products = productRepository.findByActiveTrueAndDeletedFalse();
        }

        List<ProductStockSummaryDto> response = products
                .stream()
                .map(p -> new ProductStockSummaryDto(
                        p.getId(),
                        p.getProductName(),
                        p.getCategory(),
                        p.getTotalStock(),
                        p.getRemainingStock(),
                        (p.getTotalStock() - p.getRemainingStock()) // ✅ TOTAL SOLD
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    // ✅ GET PRODUCT BY ID
    /* ================= GET PRODUCT BY ID ================= */

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDto> getById(@PathVariable Long id) {

        return productRepository.findById(id)
                .filter(p -> p.getActive() && !p.getDeleted())
                .map(p -> ResponseEntity.ok(toDto(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getAll(
            @RequestParam(required = false) String userBusinessId,
            @RequestParam(required = false) String businessId) {

        List<Product> products;
        if (userBusinessId != null && !userBusinessId.trim().isEmpty()) {
            products = productRepository.findByUserBusiness_IdAndActiveTrueAndDeletedFalse(userBusinessId.trim());
        } else if (businessId != null && !businessId.trim().isEmpty()) {
            products = productRepository.findForSyncByBusinessId(businessId.trim()).stream()
                    .filter(p -> Boolean.TRUE.equals(p.getActive()) && !Boolean.TRUE.equals(p.getDeleted()))
                    .toList();
        } else {
            // Tenant-scoped fallback: never leak other businesses' catalogs.
            var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            com.tsarit.billing.model.User caller = authentication != null && authentication.isAuthenticated()
                    && authentication.getPrincipal() instanceof com.tsarit.billing.model.User u ? u : null;
            if (caller == null) {
                return ResponseEntity.status(401).build();
            }
            java.util.Set<String> businessIds = userBusinessRepository.findByUserId(caller.getId()).stream()
                    .map(ub -> ub.getBusiness().getId())
                    .collect(java.util.stream.Collectors.toSet());
            products = productRepository.findByActiveTrueAndDeletedFalse().stream()
                    .filter(p -> {
                        try {
                            String bid = null;
                            if (p.getUserBusiness() != null && p.getUserBusiness().getBusiness() != null) {
                                bid = p.getUserBusiness().getBusiness().getId();
                            } else if (p.getGodown() != null && p.getGodown().getUserBusiness() != null
                                    && p.getGodown().getUserBusiness().getBusiness() != null) {
                                bid = p.getGodown().getUserBusiness().getBusiness().getId();
                            }
                            return bid != null && businessIds.contains(bid);
                        } catch (jakarta.persistence.EntityNotFoundException orphaned) {
                            return false;
                        }
                    })
                    .toList();
        }

        return ResponseEntity.ok(
                products.stream()
                        .map(this::toDto)
                        .toList());
    }

    @PutMapping("/update/{productId}")
    @Transactional(readOnly = false)
    public ResponseEntity<?> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody ProductUpdateRequestDto data,
            BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            result.getFieldErrors()
                    .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        return productRepository.findById(productId).map(product -> {

            product.setProductCode(data.getProductCode());
            product.setProductName(data.getProductName());
            product.setCategory(data.getCategory());
            product.setUnit(data.getUnit());
            product.setPurchasePrice(data.getPurchasePrice());
            product.setSellingPrice(data.getSellingPrice());
            if (data.getAddedStock() != null && data.getAddedStock() > 0) {

                product.setTotalStock(
                        product.getTotalStock() + data.getAddedStock());

                product.setRemainingStock(
                        product.getRemainingStock() + data.getAddedStock());
            }

            product.setMinStockLevel(data.getMinStockLevel());
            if (data.getBarcode() != null && !data.getBarcode().isBlank()) {
                var other = productRepository.findByBarcode(data.getBarcode().trim());
                if (other.isPresent() && !other.get().getId().equals(product.getId())) {
                    return ResponseEntity.status(409).body(Map.of("message", "Barcode already exists for another product"));
                }
                product.setBarcode(data.getBarcode().trim());
            }
            if (data.getHsnCode() != null) {
                String h = data.getHsnCode().trim();
                if (!h.isEmpty() && !h.matches("^[0-9]{4}([0-9]{2})?([0-9]{2})?$")) {
                    return ResponseEntity.status(422).body(Map.of("message", "Invalid HSN: must be 4, 6 or 8 digits"));
                }
                product.setHsnCode(data.getHsnCode());
            }
            if (data.getSacCode() != null) product.setSacCode(data.getSacCode());
            product.setTaxRate(data.getTaxRate());
            product.setDiscount(data.getDiscount());
            product.setExpiryDate(data.getExpiryDate());
            product.setManufacturerNameOrCode(data.getManufacturerNameOrCode());
            product.setSupplierNameOrCode(data.getSupplierNameOrCode());
            product.setDescription(data.getDescription());

            if (!product.getActive() || product.getDeleted()) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Inactive or deleted product cannot be updated"));
            }
            Product saved = productRepository.save(product);

            return ResponseEntity.ok(toDto(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{productId}")
    @Transactional(readOnly = false)
    public ResponseEntity<?> deleteProduct(@PathVariable Long productId) {

        if (invoiceItemsRepository.existsByProduct_Id(productId)) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Product cannot be deleted because it is used in invoices"));
        }

        return productRepository.findById(productId)
                .map(product -> {
                    product.setActive(false);
                    product.setDeleted(true);
                    productRepository.save(product);

                    return ResponseEntity.ok(
                            Map.of("message", "Product deactivated successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Download a single product as PDF (invoice-style)
    @GetMapping("/{id}/download/pdf")
    public ResponseEntity<byte[]> downloadProductPdf(@PathVariable Long id) {

        return productRepository.findById(id)
                .map(product -> {
                    byte[] pdfBytes = pdfService.generateProductPdf(product);

                    return ResponseEntity.ok()
                            .header(
                                    HttpHeaders.CONTENT_DISPOSITION,
                                    "attachment; filename=product-" + id + ".pdf")
                            .contentType(MediaType.APPLICATION_PDF)
                            .body(pdfBytes);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Download Items Inventory Report as PDF
    @GetMapping("/report/pdf/{businessId}")
    public ResponseEntity<byte[]> downloadInventoryReport(@PathVariable String businessId) {
        try {
            // Fetch all active products for this business
            List<Product> products = productRepository.findByActiveTrueAndDeletedFalse();

            // Filter by business if needed (assuming products are linked to business via
            // godown)
            // If you have a direct business relationship, adjust the query accordingly

            if (products == null || products.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            // Generate PDF
            byte[] pdfBytes = pdfService.generateInventoryReport(products, businessId);

            if (pdfBytes == null || pdfBytes.length == 0) {
                return ResponseEntity.internalServerError().build();
            }

            // Set response headers for PDF download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData(
                    "attachment",
                    "Inventory_Report_" + businessId + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private ProductResponseDto toDto(Product product) {

        ProductResponseDto dto = new ProductResponseDto();

        dto.setProductId(product.getId());
        dto.setProductCode(product.getProductCode());
        dto.setProductName(product.getProductName());
        dto.setCategory(product.getCategory());
        dto.setUnit(product.getUnit());

        dto.setPurchasePrice(product.getPurchasePrice());
        dto.setSellingPrice(product.getSellingPrice());

        dto.setStockQuantity(product.getTotalStock());
        dto.setRemainingStock(product.getRemainingStock());
        dto.setMinStockLevel(product.getMinStockLevel());

        dto.setBarcode(product.getBarcode());
        dto.setHsnCode(product.getHsnCode());
        dto.setSacCode(product.getSacCode());
        dto.setTaxRate(product.getTaxRate());
        dto.setDiscount(product.getDiscount());

        dto.setExpiryDate(product.getExpiryDate());
        dto.setDescription(product.getDescription());

        dto.setManufacturerName(product.getManufacturerNameOrCode());
        dto.setSupplierName(product.getSupplierNameOrCode());

        // Orphan-safe: a stale FK (deleted business/godown) must never 500 the
        // whole product list — degrade to a product without that mapping.
        try {
            if (product.getGodown() != null) {
                dto.setGodownId(product.getGodown().getGodownId());
                dto.setGodownName(product.getGodown().getGodownName());
            }
        } catch (jakarta.persistence.EntityNotFoundException orphaned) {
            // godown row no longer exists — leave godown fields empty
        }

        // Business mapping
        try {
            if (product.getUserBusiness() != null &&
                    product.getUserBusiness().getBusiness() != null) {

                dto.setUserBusinessId(product.getUserBusiness().getId());
                dto.setBusinessName(
                        product.getUserBusiness().getBusiness().getBusinessName());
            }
        } catch (jakarta.persistence.EntityNotFoundException orphaned) {
            // membership row no longer exists — leave business fields empty
        }

        return dto;
    }

}
