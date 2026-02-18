package com.tsarit.billing.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SaleResponseDto {
    
    private Long id;
    private Double totalAmount;
    private LocalDateTime createdAt;
    
    // Customer details
    private Long customerId;
    private String customerName;
    private String customerMobile;
    private String customerCity;
    
    // Sale items count
    private Integer totalItems;
    
    // Constructors
    public SaleResponseDto() {
    }
    
    public SaleResponseDto(Long id, Double totalAmount, LocalDateTime createdAt, 
                          Long customerId, String customerName, String customerMobile, 
                          String customerCity, Integer totalItems) {
        this.id = id;
        this.totalAmount = totalAmount;
        this.createdAt = createdAt;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerMobile = customerMobile;
        this.customerCity = customerCity;
        this.totalItems = totalItems;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Double getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
    
    public String getCustomerMobile() {
        return customerMobile;
    }
    
    public void setCustomerMobile(String customerMobile) {
        this.customerMobile = customerMobile;
    }
    
    public String getCustomerCity() {
        return customerCity;
    }
    
    public void setCustomerCity(String customerCity) {
        this.customerCity = customerCity;
    }
    
    public Integer getTotalItems() {
        return totalItems;
    }
    
    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }
}
