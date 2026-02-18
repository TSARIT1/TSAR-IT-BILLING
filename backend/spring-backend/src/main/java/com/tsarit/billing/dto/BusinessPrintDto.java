package com.tsarit.billing.dto;

public class BusinessPrintDto {
    private String businessId;
    private String businessName;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String phoneNo;
    private String email;
    private String gstNo;
    private String logo; // Base64 encoded
    private String signature; // Base64 encoded

    // Constructors
    public BusinessPrintDto() {
    }

    public BusinessPrintDto(String businessId, String businessName, String address, String city,
            String state, String pincode, String phoneNo, String email,
            String gstNo, String logo, String signature) {
        this.businessId = businessId;
        this.businessName = businessName;
        this.address = address;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.phoneNo = phoneNo;
        this.email = email;
        this.gstNo = gstNo;
        this.logo = logo;
        this.signature = signature;
    }

    // Getters and Setters
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

    public String getPhoneNo() {
        return phoneNo;
    }

    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getGstNo() {
        return gstNo;
    }

    public void setGstNo(String gstNo) {
        this.gstNo = gstNo;
    }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }
}
