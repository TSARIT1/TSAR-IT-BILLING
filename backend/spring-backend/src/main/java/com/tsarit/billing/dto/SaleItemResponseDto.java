package com.tsarit.billing.dto;

public class SaleItemResponseDto {

    private String saleItemId;
    private String productName;
    private Integer quantity;
    private Double unitPrice;
    private Double tax;
    private Double discount;
    private Double totalPrice;
    
    public SaleItemResponseDto(
            String saleItemId,
            String productName,
            Integer quantity,
            Double unitPrice,
            Double tax,
            Double discount,
            Double totalPrice) {
        this.saleItemId = saleItemId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.tax=tax;
        this.discount=discount;
        this.totalPrice = totalPrice;
    }

	public String getSaleItemId() {
		return saleItemId;
	}

	public void setSaleItemId(String saleItemId) {
		this.saleItemId = saleItemId;
	}

	public String getProductName() {
		return productName;
	}

	public void setProductName(String productName) {
		this.productName = productName;
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

	public Double getTax() {
		return tax;
	}

	public void setTax(Double tax) {
		this.tax = tax;
	}

	public Double getDiscount() {
		return discount;
	}

	public void setDiscount(Double discount) {
		this.discount = discount;
	}

	public Double getTotalPrice() {
		return totalPrice;
	}

	public void setTotalPrice(Double totalPrice) {
		this.totalPrice = totalPrice;
	}

}

