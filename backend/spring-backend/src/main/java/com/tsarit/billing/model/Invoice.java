package com.tsarit.billing.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "invoices")
public class Invoice {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "invoice_id", length = 50, nullable = false, updatable = false)
	private String invoiceId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", // column in invoices table
			nullable = false)
	private User user;

	private String invoiceDate;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "customer_id", nullable = false)
	private Customer customer;

	private String mobileNo;
	private String city;

	private double totalAmount;
	private int totalItems;

	@Column(name = "is_saled", nullable = false)
	private boolean isSaled = false;

	@Column(name = "is_deleted", nullable = false)
	private boolean isDeleted = false;

	@Column(name = "is_purchased")
	private boolean purchased = false;

	@Column(name = "is_partially_returned", nullable = false)
	private boolean partiallyReturned = false;

	@Column(name = "is_fully_returned", nullable = false)
	private boolean fullyReturned = false;

	public String getInvoiceId() {
		return invoiceId;
	}

	public void setInvoiceId(String invoiceId) {
		this.invoiceId = invoiceId;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getInvoiceDate() {
		return invoiceDate;
	}

	public void setInvoiceDate(String invoiceDate) {
		this.invoiceDate = invoiceDate;
	}

	public Customer getCustomer() {
		return customer;
	}

	public void setCustomer(Customer customer) {
		this.customer = customer;
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

	public boolean isPurchased() {
		return purchased;
	}

	public void setPurchased(boolean purchased) {
		this.purchased = purchased;
	}

	public boolean isPartiallyReturned() {
		return partiallyReturned;
	}

	public void setPartiallyReturned(boolean partiallyReturned) {
		this.partiallyReturned = partiallyReturned;
	}

	public boolean isFullyReturned() {
		return fullyReturned;
	}

	public void setFullyReturned(boolean fullyReturned) {
		this.fullyReturned = fullyReturned;
	}
}
