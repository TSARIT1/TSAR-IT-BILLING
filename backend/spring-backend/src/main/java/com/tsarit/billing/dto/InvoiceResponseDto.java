package com.tsarit.billing.dto;

public class InvoiceResponseDto {

	private String invoiceId;
	private String invoiceDate;
	private Long customerId;
	private String customerName;
	private String mobileNo;
	private String city;
	private double totalAmount;
	private int totalItems;
	private int totalQuantity;
	private boolean isSaled;
	private boolean isDeleted;
	private Boolean isPurchased;
	private boolean isPartiallyReturned;
	private boolean isFullyReturned;

	// constructor
	public InvoiceResponseDto(
			String invoiceId,
			String invoiceDate,
			Long customerId,
			String customerName,
			String mobileNo,
			String city,
			double totalAmount,
			int totalItems,
			int totalQuantity,
			boolean isSaled,
			boolean isDeleted,
			boolean isPurchased,
			boolean isPartiallyReturned,
			boolean isFullyReturned) {
		this.invoiceId = invoiceId;
		this.invoiceDate = invoiceDate;
		this.customerId = customerId;
		this.customerName = customerName;
		this.mobileNo = mobileNo;
		this.city = city;
		this.totalAmount = totalAmount;
		this.totalItems = totalItems;
		this.totalQuantity = totalQuantity;
		this.isSaled = isSaled;
		this.isDeleted = isDeleted;
		this.isPurchased = isPurchased;
		this.isPartiallyReturned = isPartiallyReturned;
		this.isFullyReturned = isFullyReturned;
	}

	public String getInvoiceId() {
		return invoiceId;
	}

	public void setInvoiceId(String invoiceId) {
		this.invoiceId = invoiceId;
	}

	public String getInvoiceDate() {
		return invoiceDate;
	}

	public void setInvoiceDate(String invoiceDate) {
		this.invoiceDate = invoiceDate;
	}

	public Long getCustomerId() {
		return customerId;
	}

	public void setCustomerId(Long customerId) {
		this.customerId = customerId;
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

	public double getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(double totalAmount) {
		this.totalAmount = totalAmount;
	}

	public int getTotalItems() {
		return totalItems;
	}

	public void setTotalItems(int totalItems) {
		this.totalItems = totalItems;
	}

	public int getTotalQuantity() {
		return totalQuantity;
	}

	public void setTotalQuantity(int totalQuantity) {
		this.totalQuantity = totalQuantity;
	}

	public boolean isSaled() {
		return isSaled;
	}

	public void setSaled(boolean isSaled) {
		this.isSaled = isSaled;
	}

	public boolean isDeleted() {
		return isDeleted;
	}

	public void setDeleted(boolean isDeleted) {
		this.isDeleted = isDeleted;
	}

	public Boolean getIsPurchased() {
		return isPurchased;
	}

	public void setIsPurchased(Boolean isPurchased) {
		this.isPurchased = isPurchased;
	}

	public boolean isPartiallyReturned() {
		return isPartiallyReturned;
	}

	public void setPartiallyReturned(boolean isPartiallyReturned) {
		this.isPartiallyReturned = isPartiallyReturned;
	}

	public boolean isFullyReturned() {
		return isFullyReturned;
	}

	public void setFullyReturned(boolean isFullyReturned) {
		this.isFullyReturned = isFullyReturned;
	}

}
