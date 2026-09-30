//package com.tsarit.billing.model;
//
//import jakarta.persistence.*;
//
//@Entity
//@Table(name="customers")
//public class Customer {
//    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//    private String name;
//    private String phone;
//    private String email;
//    private String address;
//
//    // getters and setters
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
@Table(name = "customers")
public class Customer {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(length = 255)
    private String name;
    
    @Column(length = 255)
    private String phone;
    
    @Column(length = 255)
    private String email;
    
    @Column(name = "business_id", nullable = false)
    private String businessId; 
    
    @Column(name = "customer_type", length = 255)
    private String customerType;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status;
    
    @Column(name = "street_address", length = 255)
    private String streetAddress;
    
    @Column(length = 255)
    private String city;
    
    @Column(length = 255)
    private String state;
    
    @Column(length = 255)
    private String country;
    
    @Column(name = "zip_code", length = 255)
    private String zipCode;
    
    @Column(name = "tax_id", length = 255)
    private String taxId;
    
    @Column(length = 2000)
    private String notes;
    
    public enum Status {
        ACTIVE, INACTIVE
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

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

    public String getCustomerType() { return customerType; }
    public void setCustomerType(String customerType) { this.customerType = customerType; }

    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
	public String getBusinessId() {
		return businessId;
	}
	public void setBusinessId(String businessId) {
		this.businessId = businessId;
	}
    
    
    
}

