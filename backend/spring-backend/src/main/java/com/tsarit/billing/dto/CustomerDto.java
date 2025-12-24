package com.tsarit.billing.dto;

public class CustomerDto {
    private Long id;
    private String businessId;
    private String name;
    private String phone;
    private String email;
    private String customerType;
    private String status;
    private String streetAddress;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private String taxId;
    private String notes;
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getBusinessId() { return businessId; }
    public void setBusinessId(String businessId) { this.businessId = businessId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getCustomerType() { return customerType; }
    public void setCustomerType(String customerType) { this.customerType = customerType; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getStreetAddress() { return streetAddress; }
    public void setStreetAddress(String streetAddress) { this.streetAddress = streetAddress; }
    
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    
    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }
    
    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    // Bank Details (nested)
    private BankDetailsDTO bankDetails;

    public BankDetailsDTO getBankDetails() { return bankDetails; }
    public void setBankDetails(BankDetailsDTO bankDetails) { this.bankDetails = bankDetails; }
    
    public static class BankDetailsDTO {
        private String accountNumber;
        private String ifscCode;
        private String bankName;
        private String branchName;
        
        // Getters and Setters
        public String getAccountNumber() { return accountNumber; }
        public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
        
        public String getIfscCode() { return ifscCode; }
        public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }
        
        public String getBankName() { return bankName; }
        public void setBankName(String bankName) { this.bankName = bankName; }
        
        public String getBranchName() { return branchName; }
        public void setBranchName(String branchName) { this.branchName = branchName; }
    }
}

