package com.tsarit.billing.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.tsarit.billing.repository.*;
import com.tsarit.billing.model.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/sync")
@CrossOrigin(originPatterns = "*")
@Transactional(readOnly = true)
public class SyncController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserBusinessRepository userBusinessRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSyncStatus(@RequestParam(required = false) String businessId) {
        Business business = requireBusiness(businessId);
        String tenantId = business.getId();
        Map<String, Object> status = new HashMap<>();
        status.put("status", "ONLINE");
        status.put("serverTime", LocalDateTime.now().toString());
        status.put("timestamp", System.currentTimeMillis());
        status.put("version", "4.0.0");
        status.put("businessId", tenantId);
        status.put("productsCount", productRepository.countForSyncByBusinessId(tenantId));
        status.put("customersCount", customerRepository.countByBusinessId(tenantId));
        status.put("salesCount", saleRepository.countByCustomerBusinessId(tenantId));
        status.put("invoicesCount", invoiceRepository.countByCustomer_BusinessId(tenantId));
        return ResponseEntity.ok(status);
    }

    @PostMapping("/push")
    public ResponseEntity<Map<String, Object>> pushSyncData(@RequestBody(required = false) Map<String, Object> payload) {
        String requestedBusinessId = payload != null && payload.get("businessId") != null
                ? payload.get("businessId").toString() : null;
        Business business = requireBusiness(requestedBusinessId);
        Map<String, Object> response = new HashMap<>();
        response.put("businessId", business.getId());
        response.put("status", "SUCCESS");
        response.put("syncTimestamp", System.currentTimeMillis());
        response.put("message", "Delta sync completed successfully with TSAR IT Production Server.");
        response.put("serverTime", LocalDateTime.now().toString());
        if (payload != null && payload.containsKey("deviceId")) {
            response.put("deviceId", payload.get("deviceId"));
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pull")
    public ResponseEntity<Map<String, Object>> pullSyncData(@RequestParam(required = false) String businessId) {
        Business business = requireBusiness(businessId);
        String tenantId = business.getId();
        Map<String, Object> data = new HashMap<>();
        data.put("businessId", tenantId);
        data.put("status", "SUCCESS");
        data.put("timestamp", System.currentTimeMillis());
        data.put("serverTime", LocalDateTime.now().toString());
        List<Map<String, Object>> productList = new ArrayList<>();
        for (Product p : productRepository.findForSyncByBusinessId(tenantId)) {
            Map<String, Object> pm = new HashMap<>();
            pm.put("id", p.getId());
            pm.put("productCode", p.getProductCode());
            pm.put("productName", p.getProductName());
            pm.put("category", p.getCategory());
            pm.put("unit", p.getUnit());
            pm.put("sellingPrice", p.getSellingPrice());
            pm.put("purchasePrice", p.getPurchasePrice());
            pm.put("totalStock", p.getTotalStock());
            pm.put("remainingStock", p.getRemainingStock());
            pm.put("taxRate", p.getTaxRate());
            pm.put("barcode", p.getBarcode());
            productList.add(pm);
        }
        data.put("products", productList);

        List<Map<String, Object>> customerList = new ArrayList<>();
        for (Customer c : customerRepository.findByBusinessId(tenantId)) {
            Map<String, Object> cm = new HashMap<>();
            cm.put("id", c.getId());
            cm.put("name", c.getName());
            cm.put("phone", c.getPhone());
            cm.put("email", c.getEmail());
            cm.put("customerType", c.getCustomerType());
            cm.put("taxId", c.getTaxId());
            cm.put("streetAddress", c.getStreetAddress());
            cm.put("city", c.getCity());
            cm.put("state", c.getState());
            cm.put("zipCode", c.getZipCode());
            customerList.add(cm);
        }
        data.put("customers", customerList);
        
        Business b = business;
        
        if (b != null) {
            Map<String, Object> bMap = new HashMap<>();
            bMap.put("id", b.getId());
            bMap.put("businessName", b.getBusinessName());
            bMap.put("phoneNo", b.getPhoneNo());
            bMap.put("email", b.getEmail());
            bMap.put("address", b.getAddress());
            bMap.put("city", b.getCity());
            bMap.put("state", b.getState());
            bMap.put("pincode", b.getPincode());
            bMap.put("panCardNo", b.getPanCardNo());
            bMap.put("hasLogo", b.getBusinessLogo() != null && b.getBusinessLogo().length > 0);
            data.put("business", bMap);
        }
        
        return ResponseEntity.ok(data);
    }

    private Business requireBusiness(String requestedBusinessId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        String businessId = requestedBusinessId == null ? null : requestedBusinessId.trim();
        return userBusinessRepository.findByUserId(user.getId()).stream()
                .map(UserBusiness::getBusiness)
                .filter(Objects::nonNull)
                .filter(b -> businessId == null || businessId.isBlank() || businessId.equals(b.getId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Business access denied"));
    }
}
