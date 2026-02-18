package com.tsarit.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PurchaseReturnItemListDto {
    private String id;
    private String itemId;
    private String itemName;
    private Integer quantityReturned;
    private Integer originalQuantity; // Original quantity from the invoice
    private BigDecimal price;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    private String returnReason;
    private LocalDate dueDate;

    // Constructors
    public PurchaseReturnItemListDto() {
    }

    public PurchaseReturnItemListDto(String id, String itemId, String itemName,
            Integer quantityReturned, Integer originalQuantity, BigDecimal price, BigDecimal tax,
            BigDecimal discount, BigDecimal totalAmount, String returnReason, LocalDate dueDate) {
        this.id = id;
        this.itemId = itemId;
        this.itemName = itemName;
        this.quantityReturned = quantityReturned;
        this.originalQuantity = originalQuantity;
        this.price = price;
        this.tax = tax;
        this.discount = discount;
        this.totalAmount = totalAmount;
        this.returnReason = returnReason;
        this.dueDate = dueDate;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public Integer getQuantityReturned() {
        return quantityReturned;
    }

    public void setQuantityReturned(Integer quantityReturned) {
        this.quantityReturned = quantityReturned;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getTax() {
        return tax;
    }

    public void setTax(BigDecimal tax) {
        this.tax = tax;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getReturnReason() {
        return returnReason;
    }

    public void setReturnReason(String returnReason) {
        this.returnReason = returnReason;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Integer getOriginalQuantity() {
        return originalQuantity;
    }

    public void setOriginalQuantity(Integer originalQuantity) {
        this.originalQuantity = originalQuantity;
    }
}
