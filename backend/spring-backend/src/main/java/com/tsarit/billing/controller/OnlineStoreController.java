package com.tsarit.billing.controller;

import com.tsarit.billing.model.OnlineStore;
import com.tsarit.billing.model.OnlineStoreProduct;
import com.tsarit.billing.model.IdGenerator;
import com.tsarit.billing.repository.OnlineStoreRepository;
import com.tsarit.billing.repository.OnlineStoreProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/online-stores")
@CrossOrigin(origins = "*")
public class OnlineStoreController {

    @Autowired
    private OnlineStoreRepository onlineStoreRepository;

    @Autowired
    private OnlineStoreProductRepository onlineStoreProductRepository;

    // ✅ CREATE ONLINE STORE
    @PostMapping
    public ResponseEntity<?> createStore(@RequestBody Map<String, Object> request) {
        try {
            OnlineStore store = new OnlineStore();
            store.setId(IdGenerator.onlineStoreId());
            store.setStoreName((String) request.get("storeName"));
            store.setCategories((String) request.get("categories"));
            store.setStatus("ACTIVE");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> productsData = (List<Map<String, Object>>) request.get("products");

            List<OnlineStoreProduct> products = new ArrayList<>();
            if (productsData != null) {
                for (Map<String, Object> pd : productsData) {
                    OnlineStoreProduct sp = new OnlineStoreProduct();
                    sp.setId(IdGenerator.onlineStoreProductId());
                    sp.setOnlineStore(store);
                    sp.setProductId(pd.get("productId") != null
                            ? ((Number) pd.get("productId")).longValue()
                            : null);
                    sp.setProductName((String) pd.get("productName"));
                    sp.setProductCode((String) pd.get("productCode"));
                    sp.setTotalStock(pd.get("totalStock") != null
                            ? ((Number) pd.get("totalStock")).intValue()
                            : 0);
                    products.add(sp);
                }
            }

            store.setProducts(products);
            OnlineStore saved = onlineStoreRepository.save(store);
            return ResponseEntity.ok(toDto(saved));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ GET ALL STORES
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllStores() {
        List<OnlineStore> stores = onlineStoreRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = stores.stream().map(this::toDto).toList();
        return ResponseEntity.ok(result);
    }

    // ✅ GET STORE PRODUCTS
    @GetMapping("/{storeId}/products")
    public ResponseEntity<List<Map<String, Object>>> getStoreProducts(@PathVariable String storeId) {
        List<OnlineStoreProduct> products = onlineStoreProductRepository.findByOnlineStore_Id(storeId);
        List<Map<String, Object>> result = products.stream().map(p -> {
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", p.getId());
            dto.put("productId", p.getProductId());
            dto.put("productName", p.getProductName());
            dto.put("productCode", p.getProductCode());
            dto.put("totalStock", p.getTotalStock());
            return dto;
        }).toList();
        return ResponseEntity.ok(result);
    }

    // ✅ DELETE STORE
    @DeleteMapping("/{storeId}")
    public ResponseEntity<?> deleteStore(@PathVariable String storeId) {
        return onlineStoreRepository.findById(storeId).map(store -> {
            onlineStoreRepository.delete(store);
            return ResponseEntity.ok(Map.of("message", "Store deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toDto(OnlineStore store) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", store.getId());
        dto.put("storeName", store.getStoreName());
        dto.put("categories", store.getCategories());
        dto.put("status", store.getStatus());
        dto.put("createdAt", store.getCreatedAt() != null ? store.getCreatedAt().toString() : null);
        dto.put("productCount", store.getProducts() != null ? store.getProducts().size() : 0);
        return dto;
    }
}
