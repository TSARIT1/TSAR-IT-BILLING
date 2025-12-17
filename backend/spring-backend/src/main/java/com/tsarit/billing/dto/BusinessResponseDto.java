package com.tsarit.billing.dto;

import java.time.LocalDateTime;

public class BusinessResponseDto {

    private String businessId;
    private String businessName;
    private String businessType;
    private String gstNo;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String contactNo;
    private String email;
    private LocalDateTime createdDate;

    private String userBusinessId;

    // ---------- Constructors ----------

    public BusinessResponseDto() {
    }

    public BusinessResponseDto(String businessId, String businessName, String businessType,
            String gstNo, String address, String city, String state,
            String pincode, String contactNo, String email,
            LocalDateTime createdDate, String userBusinessId) {
this.businessId = businessId;
this.businessName = businessName;
this.businessType = businessType;
this.gstNo = gstNo;
this.address = address;
this.city = city;
this.state = state;
this.pincode = pincode;
this.contactNo = contactNo;
this.email = email;
this.createdDate = createdDate;
this.userBusinessId = userBusinessId;
}

    // ---------- Getters & Setters ----------

    public String getBusinessId() {
        return businessId;
    }

    public void setBusinessId(String businessId) {
        this.businessId = businessId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessType() {
        return businessType;
    }

    public void setBusinessType(String businessType) {
        this.businessType = businessType;
    }

    public String getGstNo() {
        return gstNo;
    }

    public void setGstNo(String gstNo) {
        this.gstNo = gstNo;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getContactNo() {
        return contactNo;
    }

    public void setContactNo(String contactNo) {
        this.contactNo = contactNo;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public String getUserBusinessId() {
        return userBusinessId;
    }

    public void setUserBusinessId(String userBusinessId) {
        this.userBusinessId = userBusinessId;
    }
}
