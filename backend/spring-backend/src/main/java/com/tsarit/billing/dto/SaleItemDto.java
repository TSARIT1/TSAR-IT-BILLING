package com.tsarit.billing.dto;

public class SaleItemDto {

    private String saleItemId;
    private String productCode;
    private String productName;
    private String category;
    private String unit;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
    private Double taxRate;
    private Double discount;

    // Constructor
    public SaleItemDto(String saleItemId, String productCode, String productName, String category,
            String unit, Integer quantity, Double unitPrice, Double totalPrice,
            Double taxRate, Double discount) {
        this.saleItemId = saleItemId;
        this.productCode = productCode;
        this.productName = productName;
        this.category = category;
        this.unit = unit;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = totalPrice;
        this.taxRate = taxRate;
        this.discount = discount;
    }

    // Getters and Setters
    public String getSaleItemId() {
        return saleItemId;
    }

    public void setSaleItemId(String saleItemId) {
        this.saleItemId = saleItemId;
    }

    public String getProductCode() {
        return productCode;
    }

    public void setProductCode(String productCode) {
        this.productCode = productCode;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Double getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(Double taxRate) {
        this.taxRate = taxRate;
    }

    public Double getDiscount() {
        return discount;
    }

    public void setDiscount(Double discount) {
        this.discount = discount;
    }
}
