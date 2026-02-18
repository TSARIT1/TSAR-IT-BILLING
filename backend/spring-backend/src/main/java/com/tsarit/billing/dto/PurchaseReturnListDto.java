package com.tsarit.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class PurchaseReturnListDto {
    private String id;
    private String purchaseNo;
    private String supplierName;
    private LocalDate returnDate;
    private String status;
    private int totalItems;
    private BigDecimal totalAmount;
    private LocalDateTime receivedAt;
    private List<PurchaseReturnItemListDto> items;

    // Constructors
    public PurchaseReturnListDto() {
    }

    public PurchaseReturnListDto(String id, String purchaseNo, String supplierName,
            LocalDate returnDate, String status, int totalItems, BigDecimal totalAmount,
            List<PurchaseReturnItemListDto> items) {
        this.id = id;
        this.purchaseNo = purchaseNo;
        this.supplierName = supplierName;
        this.returnDate = returnDate;
        this.status = status;
        this.totalItems = totalItems;
        this.totalAmount = totalAmount;
        this.items = items;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public String getPurchaseNo() {
        return purchaseNo;
    }

    public void setPurchaseNo(String purchaseNo) {
        this.purchaseNo = purchaseNo;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(LocalDateTime receivedAt) {
        this.receivedAt = receivedAt;
    }

    public List<PurchaseReturnItemListDto> getItems() {
        return items;
    }

    public void setItems(List<PurchaseReturnItemListDto> items) {
        this.items = items;
    }
}
