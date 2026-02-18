package com.tsarit.billing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;

public class InvoiceItemsDto {

	private String id;   
	private int itemNo;
	private String itemName;     
	private Integer qty;         
	private Double price;
	private Double discount;
	private Double tax;
	private Double totalLineAmount;
	
	@NotNull
	@JsonProperty("productId")
	private Long productId;
	
	public InvoiceItemsDto() {
		super();
		// TODO Auto-generated constructor stub
	}


	public InvoiceItemsDto(String id, int itemNo, String itemName, Integer qty, Double price, Double discount,
			Double tax, Double totalLineAmount, Long productId) {
		super();
		this.id = id;
		this.itemNo = itemNo;
		this.itemName = itemName;
		this.qty = qty;
		this.price = price;
		this.discount = discount;
		this.tax = tax;
		this.totalLineAmount = totalLineAmount;
		this.productId = productId;
	}


	public String getId() {
		return id;
	}

	public void setItemId(String itemId) {
		this.id = itemId;
	}

	public int getItemNo() {
		return itemNo;
	}

	public void setItemNo(int itemNo) {
		this.itemNo = itemNo;
	}
	
	public String getItemName() {
		return itemName;
	}
	public void setItemName(String itemName) {
		this.itemName = itemName;
	}
	public Integer getQty() {
		return qty;
	}
	public void setQty(Integer qty) {
		this.qty = qty;
	}
	public Double getPrice() {
		return price;
	}
	public void setPrice(Double price) {
		this.price = price;
	}
	public Double getDiscount() {
		return discount;
	}
	public void setDiscount(Double discount) {
		this.discount = discount;
	}
	public Double getTax() {
		return tax;
	}
	public void setTax(Double tax) {
		this.tax = tax;
	}
	public Double getTotalLineAmount() {
		return totalLineAmount;
	}
	public void setTotalLineAmount(Double totalLineAmount) {
		this.totalLineAmount = totalLineAmount;
	}


	public Long getProductId() {
		return productId;
	}


	public void setProductId(Long productId) {
		this.productId = productId;
	}


	public void setId(String id) {
		this.id = id;
	}
		
}

