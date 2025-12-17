package com.tsarit.billing.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name="users")
public class User {
	
	 @Id
	 @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id", length = 50,nullable=false,updatable=false)
    private String id;
	
	@Column(name="businessName")
	private String businessName;
	
	@Column(name="userName")
    private String ownerName;

    @Column(unique = true, nullable = true)
    private String email;

    @Column(unique = true, nullable = false)
    private String mobileNo;

    private String password;

    @Column(nullable = true)
    private String referredBy;

	
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
