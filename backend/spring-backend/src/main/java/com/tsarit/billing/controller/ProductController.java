
package com.tsarit.billing.controller;

import com.tsarit.billing.dto.ProductRequestDto;
import com.tsarit.billing.dto.ProductResponseDto;
import com.tsarit.billing.dto.ProductUpdateRequestDto;
import com.tsarit.billing.model.Godown;
import com.tsarit.billing.model.Product;
import com.tsarit.billing.model.UserBusiness;
import com.tsarit.billing.repository.GodownRepository;
import com.tsarit.billing.repository.ProductRepository;
import com.tsarit.billing.repository.UserBusinessRepository;
import com.tsarit.billing.service.PdfService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/products") 
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private GodownRepository godownRepository;

    @Autowired
    private UserBusinessRepository userBusinessRepository;
    
    @Autowired
    private PdfService pdfService;

    // ✅ CREATE PRODUCT
    @PostMapping("/createProduct")
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> request) {

        Product product = new Product();

        product.setProductCode((String) request.get("productCode"));
        product.setProductName((String) request.get("productName"));
        product.setCategory((String) request.get("category"));
        product.setUnit((String) request.get("unit"));
        product.setBarcode((String) request.get("barcode"));
        product.setDescription((String) request.get("description"));

        product.setPurchasePrice(((Number) request.get("purchasePrice")).doubleValue());
        product.setSellingPrice(((Number) request.get("sellingPrice")).doubleValue());
        product.setStockQuantity(((Number) request.get("stockQuantity")).intValue());
        product.setMinStockLevel(((Number) request.get("minStockLevel")).intValue());
        product.setTaxRate(((Number) request.get("taxRate")).doubleValue());
        product.setDiscount(((Number) request.get("discount")).doubleValue());

        product.setExpiryDate(
                LocalDate.parse((String) request.get("expiryDate"))
        );

        product.setManufacturerNameOrCode((String) request.get("manufacturerName"));
        product.setSupplierNameOrCode((String) request.get("supplierName"));

        // 🔹 Relations
        String godownId = (String) request.get("godownId");
        String userBusinessId = (String) request.get("userBusinessId");

        Godown godown = godownRepository.findById(godownId)
                .orElseThrow(() -> new RuntimeException("Godown not found"));

        UserBusiness ub = userBusinessRepository.findById(userBusinessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        product.setGodown(godown);
        product.setUserBusiness(ub);

        Product saved = productRepository.save(product);

        return ResponseEntity.ok(toDto(saved));
    }
    /* ================= GET PRODUCTS BY GODOWN ================= */

    @GetMapping("/godown/{godownId}")
    public ResponseEntity<List<ProductResponseDto>> getByGodown(
            @PathVariable String godownId
    ) {
        List<Product> products =
                productRepository.findByGodown_GodownId(godownId);

        List<ProductResponseDto> response =
                products.stream()
                        .map(this::toDto)
                        .toList();

        return ResponseEntity.ok(response);
    }
    // ✅ GET PRODUCT BY ID
    /* ================= GET PRODUCT BY ID ================= */

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDto> getById(@PathVariable Long id) {

        return productRepository.findById(id)
                .map(p -> ResponseEntity.ok(toDto(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getAll() {

        return ResponseEntity.ok(
            productRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList()
        );
    }
    
    @PutMapping("/update/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody ProductUpdateRequestDto data,
            BindingResult result
    ) {
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
            product.setStockQuantity(data.getStockQuantity());
            product.setMinStockLevel(data.getMinStockLevel());
            product.setBarcode(data.getBarcode());
            product.setTaxRate(data.getTaxRate());
            product.setDiscount(data.getDiscount());
            product.setExpiryDate(data.getExpiryDate());
            product.setManufacturerNameOrCode(data.getManufacturerNameOrCode());
            product.setSupplierNameOrCode(data.getSupplierNameOrCode());
            product.setDescription(data.getDescription());

            Product saved = productRepository.save(product);

            return ResponseEntity.ok(toDto(saved)); 
        }).orElse(ResponseEntity.notFound().build());
    }
    
    // ✅ DELETE PRODUCT
    @DeleteMapping("/delete/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long productId) {
        return productRepository.findById(productId).map(product -> {
            productRepository.delete(product);
            return ResponseEntity.ok(
                    Map.of("message", "Product deleted successfully")
            );
        }).orElse(ResponseEntity.notFound().build());
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
                                "attachment; filename=product-" + id + ".pdf"
                            )
                            .contentType(MediaType.APPLICATION_PDF)
                            .body(pdfBytes);
                })
                .orElse(ResponseEntity.notFound().build());
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

        dto.setStockQuantity(product.getStockQuantity());
        dto.setMinStockLevel(product.getMinStockLevel());

        dto.setBarcode(product.getBarcode());
        dto.setTaxRate(product.getTaxRate());
        dto.setDiscount(product.getDiscount());

        dto.setExpiryDate(product.getExpiryDate());
        dto.setDescription(product.getDescription());

        dto.setManufacturerName(product.getManufacturerNameOrCode());
        dto.setSupplierName(product.getSupplierNameOrCode());

        if (product.getGodown() != null) {
            dto.setGodownId(product.getGodown().getGodownId());
            dto.setGodownName(product.getGodown().getGodownName());
        }

        // ✅ Business mapping
        if (product.getUserBusiness() != null &&
                product.getUserBusiness().getBusiness() != null) {

                dto.setUserBusinessId(product.getUserBusiness().getId());
                dto.setBusinessName(
                    product.getUserBusiness().getBusiness().getBusinessName()
                );
            }

        return dto;
    }
}
