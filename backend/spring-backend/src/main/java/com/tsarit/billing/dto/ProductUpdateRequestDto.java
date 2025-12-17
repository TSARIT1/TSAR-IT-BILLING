package com.tsarit.billing.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class ProductUpdateRequestDto {

    @NotBlank
    private String productCode;

    @NotBlank
    private String productName;

    private String category;
    private String unit;

    @PositiveOrZero
    private Double purchasePrice;

    @PositiveOrZero
    private Double sellingPrice;

    @PositiveOrZero
    private Integer stockQuantity;

    @PositiveOrZero
    private Integer minStockLevel;

    @PositiveOrZero
    private Double taxRate;

    @PositiveOrZero
    private Double discount;

    private LocalDate expiryDate;
    private String barcode;
    private String manufacturerNameOrCode;
    private String supplierNameOrCode;
    private String description;
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

   
}

