package com.tsarit.billing.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SalesListDto {

	private LocalDateTime date;
	private Double amount;
	private Long customerId;
	private String customerName;
	private String phone;
	private Long saleId;
	
	private List<String> saleItemIds;
	private Boolean isPaid;
	private Integer totalItems;

	public SalesListDto(LocalDateTime date, Double amount, Long customerId, String customerName, String phone,
			Long saleId, List<String> saleItemIds, Boolean isPaid, Integer totalItems) {
		super();
		this.date = date;
		this.amount = amount;
		this.customerId = customerId;
		this.customerName = customerName;
		this.phone = phone;
		this.saleId = saleId;
		this.saleItemIds = saleItemIds;
		this.isPaid = isPaid;
		this.totalItems = totalItems;
	}

	public LocalDateTime getDate() {
		return date;
	}

	public void setDate(LocalDateTime date) {
		this.date = date;
	}

	public Double getAmount() {
		return amount;
	}

	public void setAmount(Double amount) {
		this.amount = amount;
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

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public Long getSaleId() {
		return saleId;
	}

	public void setSaleId(Long saleId) {
		this.saleId = saleId;
	}

	public List<String> getSaleItemIds() {
		return saleItemIds;
	}

	public void setSaleItemIds(List<String> saleItemIds) {
		this.saleItemIds = saleItemIds;
	}

	public Boolean getIsPaid() {
		return isPaid;
	}

	public void setIsPaid(Boolean isPaid) {
		this.isPaid = isPaid;
	}

	public Integer getTotalItems() {
		return totalItems;
	}

	public void setTotalItems(Integer totalItems) {
		this.totalItems = totalItems;
	}

}
