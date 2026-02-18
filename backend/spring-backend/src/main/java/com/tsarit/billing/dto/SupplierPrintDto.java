package com.tsarit.billing.dto;

public class SupplierPrintDto {
    private Long customerId;
    private String name;
    private String mobileNo;
    private String city;
    private String address;

    // Constructors
    public SupplierPrintDto() {
    }

    public SupplierPrintDto(Long customerId, String name, String mobileNo, String city, String address) {
        this.customerId = customerId;
        this.name = name;
        this.mobileNo = mobileNo;
        this.city = city;
        this.address = address;
    }

    // Getters and Setters
    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
