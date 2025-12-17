//package com.tsarit.billing.model;
//
//import jakarta.persistence.*;
//
//@Entity
//@Table(name="vendors")
//public class Vendor {
//    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//    private String name;
//    private String phone;
//    private String email;
//    private String address;
//
//    // getters and setters...
//    public Long getId(){return id;}
//    public void setId(Long id){this.id=id;}
//    public String getName(){return name;}
//    public void setName(String name){this.name=name;}
//    public String getPhone(){return phone;}
//    public void setPhone(String phone){this.phone=phone;}
//    public String getEmail(){return email;}
//    public void setEmail(String email){this.email=email;}
//    public String getAddress(){return address;}
//    public void setAddress(String address){this.address=address;}
//}


package com.tsarit.billing.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vendors")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Basic Info
    private String name;             // Vendor Name
    private String contactPerson;    // Contact Person
    private String phone;            // Phone Number
    private String email;            // Email Address

    // Address Fields
    private String streetAddress;
    private String city;
    private String state;
    private String zipCode;
    private String country;

    // Vendor Type
    private String vendorType;       // Example: Supplier, Distributor, etc.

    // Tax Info
    private String taxId;            // Tax ID / GSTIN

    // Banking Info
    private String accountNumber;    // Bank Account Number
    private String ifscCode;         // IFSC Code

    // Notes
    @Column(length = 2000)
    private String notes;

    // Status
    @Enumerated(EnumType.STRING)
    private Status status;

    // Enum for status
    public enum Status {
        ACTIVE, INACTIVE
    }

    // ===== Getters & Setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getStreetAddress() { return streetAddress; }
    public void setStreetAddress(String streetAddress) { this.streetAddress = streetAddress; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getVendorType() { return vendorType; }
    public void setVendorType(String vendorType) { this.vendorType = vendorType; }

    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}

