package com.tsarit.billing.controller;

import com.tsarit.billing.model.OnlineOrder;
import com.tsarit.billing.model.OnlineOrderItem;
import com.tsarit.billing.model.IdGenerator;
import com.tsarit.billing.repository.OnlineOrderRepository;
import com.tsarit.billing.repository.OnlineOrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/online-orders")
@CrossOrigin(origins = "*")
public class OnlineOrderController {

    @Autowired
    private OnlineOrderRepository onlineOrderRepository;

    @Autowired
    private OnlineOrderItemRepository onlineOrderItemRepository;

    // ✅ CREATE ONLINE ORDER
    @PostMapping
    public ResponseEntity<?> createOnlineOrder(@RequestBody Map<String, Object> request) {
        try {
            OnlineOrder order = new OnlineOrder();
            order.setId(IdGenerator.onlineOrderId());
            order.setOrderNumber("ORD-" + System.currentTimeMillis());
            order.setCustomerName((String) request.get("customerName"));
            order.setCustomerPhone((String) request.get("customerPhone"));
            order.setTermsAndConditions((String) request.get("termsAndConditions"));
            order.setNotes((String) request.get("notes"));
            order.setPaymentMode((String) request.get("paymentMode"));
            order.setStatus("PENDING");

            // Parse items
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsData = (List<Map<String, Object>>) request.get("items");

            double totalAmount = 0.0;
            List<OnlineOrderItem> items = new ArrayList<>();

            if (itemsData != null) {
                for (Map<String, Object> itemData : itemsData) {
                    OnlineOrderItem item = new OnlineOrderItem();
                    item.setId(IdGenerator.onlineOrderItemId());
                    item.setOnlineOrder(order);

                    item.setProductId(itemData.get("productId") != null
                            ? ((Number) itemData.get("productId")).longValue()
                            : null);
                    item.setProductName((String) itemData.get("productName"));
                    item.setProductCode((String) itemData.get("productCode"));
                    item.setQuantity(((Number) itemData.get("quantity")).intValue());
                    item.setSellingPrice(((Number) itemData.get("sellingPrice")).doubleValue());

                    if (itemData.get("expiryDate") != null && !itemData.get("expiryDate").toString().isEmpty()) {
                        item.setExpiryDate(LocalDate.parse(itemData.get("expiryDate").toString()));
                    }

                    Double taxRate = itemData.get("taxRate") != null
                            ? ((Number) itemData.get("taxRate")).doubleValue()
                            : 0.0;
                    Double discount = itemData.get("discount") != null
                            ? ((Number) itemData.get("discount")).doubleValue()
                            : 0.0;

                    item.setTaxRate(taxRate);
                    item.setDiscount(discount);

                    double baseAmount = item.getQuantity() * item.getSellingPrice();
                    double taxAmount = baseAmount * taxRate / 100;
                    double discountAmount = baseAmount * discount / 100;
                    double itemTotal = baseAmount + taxAmount - discountAmount;

                    item.setTotalPrice(itemTotal);
                    totalAmount += itemTotal;
                    items.add(item);
                }
            }

            order.setTotalAmount(totalAmount);
            order.setItems(items);

            OnlineOrder saved = onlineOrderRepository.save(order);

            return ResponseEntity.ok(toDto(saved));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ GET ALL ONLINE ORDERS
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllOrders() {
        List<OnlineOrder> orders = onlineOrderRepository.findAllByOrderByOrderDateDesc();
        List<Map<String, Object>> result = orders.stream().map(this::toDto).toList();
        return ResponseEntity.ok(result);
    }

    // ✅ GET ORDER ITEMS
    @GetMapping("/{orderId}/items")
    public ResponseEntity<List<Map<String, Object>>> getOrderItems(@PathVariable String orderId) {
        List<OnlineOrderItem> items = onlineOrderItemRepository.findByOnlineOrder_Id(orderId);
        List<Map<String, Object>> result = items.stream().map(item -> {
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", item.getId());
            dto.put("productId", item.getProductId());
            dto.put("productName", item.getProductName());
            dto.put("productCode", item.getProductCode());
            dto.put("quantity", item.getQuantity());
            dto.put("sellingPrice", item.getSellingPrice());
            dto.put("expiryDate", item.getExpiryDate() != null ? item.getExpiryDate().toString() : null);
            dto.put("taxRate", item.getTaxRate());
            dto.put("discount", item.getDiscount());
            dto.put("totalPrice", item.getTotalPrice());
            return dto;
        }).toList();
        return ResponseEntity.ok(result);
    }

    // ✅ UPDATE ORDER STATUS
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String orderId,
            @RequestBody Map<String, String> body) {
        return onlineOrderRepository.findById(orderId).map(order -> {
            order.setStatus(body.get("status"));
            onlineOrderRepository.save(order);
            return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ✅ DELETE ORDER
    @DeleteMapping("/{orderId}")
    public ResponseEntity<?> deleteOrder(@PathVariable String orderId) {
        return onlineOrderRepository.findById(orderId).map(order -> {
            onlineOrderRepository.delete(order);
            return ResponseEntity.ok(Map.of("message", "Order deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toDto(OnlineOrder order) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", order.getId());
        dto.put("orderNumber", order.getOrderNumber());
        dto.put("customerName", order.getCustomerName());
        dto.put("customerPhone", order.getCustomerPhone());
        dto.put("orderDate", order.getOrderDate() != null ? order.getOrderDate().toString() : null);
        dto.put("status", order.getStatus());
        dto.put("totalAmount", order.getTotalAmount());
        dto.put("termsAndConditions", order.getTermsAndConditions());
        dto.put("notes", order.getNotes());
        dto.put("paymentMode", order.getPaymentMode());
        dto.put("totalItems", order.getItems() != null ? order.getItems().size() : 0);
        return dto;
    }
}
