package com.tsarit.billing.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.*;

@Entity
@Table(name = "business")
public class Business {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "business_id", length = 50, nullable=false,updatable=false)
    private String id;

    private String businessName;
    
    private String industryType;

    private String phoneNo;
    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String city;
    private String state;
    private String pincode;

    private String panCardNo;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "business_type")
    private BusinessType businessType;

    @Column(nullable = false)
    private Boolean isEnableTds = false;

    @Column(nullable = false)
    private Boolean isEnableTcs = false;

    @Column(nullable = false)
    private Boolean isEnableEinvoicing = false;
    
    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    private List<BusinessExtras> businessExtras;
    

    @Lob
    @Column(name = "business_logo", columnDefinition = "LONGBLOB")
    private byte[] businessLogo;

    @Lob
    @Column(name = "signature", columnDefinition = "LONGBLOB")
    private byte[] signature;

    @CreationTimestamp
    private LocalDateTime createdDate;


	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getBusinessName() {
		return businessName;
	}

	public void setBusinessName(String businessName) {
		this.businessName = businessName;
	}

	public String getIndustryType() {
		return industryType;
	}

	public void setIndustryType(String industryType) {
		this.industryType = industryType;
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

	public String getPanCardNo() {
		return panCardNo;
	}

	public void setPanCardNo(String panCardNo) {
		this.panCardNo = panCardNo;
	}

	public Boolean getIsEnableTds() {
		return isEnableTds;
	}

	public void setIsEnableTds(Boolean isEnableTds) {
		this.isEnableTds = isEnableTds;
	}

	public Boolean getIsEnableTcs() {
		return isEnableTcs;
	}

	public void setIsEnableTcs(Boolean isEnableTcs) {
		this.isEnableTcs = isEnableTcs;
	}
	

	public List<BusinessExtras> getExtras() {
	    return businessExtras;
	}

	public void setExtras(List<BusinessExtras> businessExtras) {
	    this.businessExtras = businessExtras;
	}

	public byte[] getBusinessLogo() {
		return businessLogo;
	}

	public void setBusinessLogo(byte[] businessLogo) {
		this.businessLogo = businessLogo;
	}

	public byte[] getSignature() {
		return signature;
	}

	public void setSignature(byte[] signature) {
		this.signature = signature;
	}

	public LocalDateTime getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(LocalDateTime createdDate) {
		this.createdDate = createdDate;
	}

	public Boolean getIsEnableEinvoicing() {
		return isEnableEinvoicing;
	}

	public void setIsEnableEinvoicing(Boolean isEnableEinvoicing) {
		this.isEnableEinvoicing = isEnableEinvoicing;
	}
	public BusinessType getBusinessType() {
	    return businessType;
	}

	public void setBusinessType(BusinessType businessType) {
	    this.businessType = businessType;
	}
    
}

