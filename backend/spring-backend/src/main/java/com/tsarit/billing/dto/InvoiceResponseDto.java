package com.tsarit.billing.dto;

public class InvoiceResponseDto {

    private String invoiceId;
    private String invoiceDate;
    private String customerName;
    private String mobileNo;
    private String city;
    private double totalAmount;
    private int totalItems;

    // constructor
    public InvoiceResponseDto(
        String invoiceId,
        String invoiceDate,
        String customerName,
        String mobileNo,
        String city,
        double totalAmount,
        int totalItems
    ) {
        this.invoiceId = invoiceId;
        this.invoiceDate = invoiceDate;
        this.customerName = customerName;
        this.mobileNo = mobileNo;
        this.city = city;
        this.totalAmount = totalAmount;
        this.totalItems = totalItems;
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
    
    
}
