package com.tsarit.billing.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import org.hibernate.annotations.GenericGenerator;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name="users")
public class User {
	
	 @Id
	 @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id", length = 50,nullable=false,updatable=false)
    private String id;
	
	@Column(name="business_name")
    @JsonAlias({"business_name", "companyName", "company"})
	private String businessName;
	
	@Column(name="user_name")
    @JsonAlias({"name", "userName", "username", "owner_name", "ownerName"})
    private String ownerName;

    @Column(unique = true, nullable = true)
    private String email;

    // nullable at DB level — registration accepts email-only accounts; the login
    // flow falls back to email when mobile is absent.
    @Column(unique = true, nullable = true)
    @JsonAlias({"phone", "phoneNo", "mobile", "mobileNumber", "mobile_no"})
    private String mobileNo;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(name = "referred_by", nullable = true)
    @JsonAlias({"referred_by", "referralCode", "referral", "referredByCode"})
    private String referredBy;

    /** Transient — copied onto the provisioned Business at registration, not stored on users. */
    @Transient
    private String industryType;

    public String getIndustryType() { return industryType; }
    public void setIndustryType(String industryType) { this.industryType = industryType; }

	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getOwnerName() {
		return ownerName;
	}

	public void setOwnerName(String ownerName) {
		this.ownerName = ownerName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getMobileNo() {
		return mobileNo;
	}

	public void setMobileNo(String mobileNo) {
		this.mobileNo = mobileNo;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getBusinessName() {
		return businessName;
	}

	public void setBusinessName(String businessName) {
		this.businessName = businessName;
	}

	public String getReferredBy() {
		return referredBy;
	}

	public void setReferredBy(String referredBy) {
		this.referredBy = referredBy;
	}
    
}
