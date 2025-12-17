package com.tsarit.billing.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "products")
public class Product {

    /* ================= PRIMARY KEY ================= */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ================= PRODUCT BASIC INFO ================= */

    @Column(name = "product_code", nullable = false, unique = true)
    @NotBlank(message = "Product code is required")
    private String productCode;

    @Column(name = "product_name", nullable = false)
    @NotBlank(message = "Product name is required")
    private String productName;

    @Column(name = "category")
    private String category;

    @Column(name = "unit")
    private String unit;

    /* ================= PRICING & STOCK ================= */

    @Column(name = "purchase_price")
    @PositiveOrZero
    private Double purchasePrice;

    @Column(name = "selling_price")
    @PositiveOrZero
    private Double sellingPrice;

    @Column(name = "stock_quantity")
    @PositiveOrZero
    private Integer stockQuantity;

    @Column(name = "min_stock_level")
    @PositiveOrZero
    private Integer minStockLevel;

    /* ================= TAX & DISCOUNT ================= */

    @Column(name = "tax_rate")
    @PositiveOrZero
    private Double taxRate;

    @Column(name = "discount")
    @PositiveOrZero
    private Double discount;

    /* ================= ADDITIONAL DETAILS ================= */

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "barcode")
    private String barcode;

    @Column(name = "manufacturer_name_or_code")
    private String manufacturerNameOrCode;

    @Column(name = "supplier_name_or_code")
    private String supplierNameOrCode;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    /* ================= RELATIONSHIPS ================= */

    // FK → godowns.godown_id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "godown_id", nullable = false)
    private Godown godown;

    // FK → user_business.userBusiness_id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_business_id", nullable = false)
    private UserBusiness userBusiness;

    /* ================= LIFECYCLE ================= */

    @PrePersist
    protected void onCreate() {
        this.createdDate = LocalDateTime.now();
    }

    /* ================= GETTERS & SETTERS ================= */

    public Long getId() {
        return id;
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

    public Double getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(Double purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public Double getSellingPrice() {
        return sellingPrice;
    }

    public void setSellingPrice(Double sellingPrice) {
        this.sellingPrice = sellingPrice;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Integer getMinStockLevel() {
        return minStockLevel;
    }

    public void setMinStockLevel(Integer minStockLevel) {
        this.minStockLevel = minStockLevel;
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

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public String getManufacturerNameOrCode() {
        return manufacturerNameOrCode;
    }

    public void setManufacturerNameOrCode(String manufacturerNameOrCode) {
        this.manufacturerNameOrCode = manufacturerNameOrCode;
    }

    public String getSupplierNameOrCode() {
        return supplierNameOrCode;
    }

    public void setSupplierNameOrCode(String supplierNameOrCode) {
        this.supplierNameOrCode = supplierNameOrCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public Godown getGodown() {
        return godown;
    }

    public void setGodown(Godown godown) {
        this.godown = godown;
    }

    public UserBusiness getUserBusiness() {
        return userBusiness;
    }

    public void setUserBusiness(UserBusiness userBusiness) {
        this.userBusiness = userBusiness;
    }
}
