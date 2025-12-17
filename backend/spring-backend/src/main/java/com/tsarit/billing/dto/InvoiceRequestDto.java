package com.tsarit.billing.dto;

import java.util.List;

import lombok.Data;

public class InvoiceRequestDto {
	
    private String userId;          
    private String customerName;
    private String mobileNo;
    private String city;
    private String invoiceDate;

    private int totalItems;
    private double totalAmount;

    private List<InvoiceItemsDto> items;

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getCustomerName() {
		return customerName;
	}

	public void setCustomerName(String customerName) {
		this.customerName = customerName;
	}

	public String getMobileNo() {
		return mobileNo;
	}

	public void setMobileNo(String mobileNo) {
		this.mobileNo = mobileNo;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getInvoiceDate() {
		return invoiceDate;
	}

	public void setInvoiceDate(String invoiceDate) {
		this.invoiceDate = invoiceDate;
	}

	public int getTotalItems() {
		return totalItems;
	}

	public void setTotalItems(int totalItems) {
		this.totalItems = totalItems;
	}

	public double getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(double totalAmount) {
		this.totalAmount = totalAmount;
	}

	public List<InvoiceItemsDto> getItems() {
		return items;
	}

	public void setItems(List<InvoiceItemsDto> items) {
		this.items = items;
	}  
}


