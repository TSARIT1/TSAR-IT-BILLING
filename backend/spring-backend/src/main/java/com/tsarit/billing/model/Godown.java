package com.tsarit.billing.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "godowns")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Godown {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "godown_id", length = 255,nullable=false,updatable=false)
    private String godownId;

    @Column(name = "godown_name", length = 255, nullable = false)
    private String godownName;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "manager_name", length = 255)
    private String managerName;

    @Column(name = "contact_no", length = 20)
    private String contactNo;

    @Column(name = "created_date")
    private LocalDateTime createdDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userBusiness_id", nullable = false)
    @JsonIgnore 
    private UserBusiness userBusiness;

    // Auto set created date
    @PrePersist
    public void onCreate() {
        this.createdDate = LocalDateTime.now();
    }

    // Constructors
    public Godown() {}

    // Getters & Setters
    public String getGodownId() {
        return godownId;
    }

    public void setGodownId(String godownId) {
        this.godownId = godownId;
    }

    public String getGodownName() {
        return godownName;
    }

    public void setGodownName(String godownName) {
        this.godownName = godownName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getManagerName() {
        return managerName;
    }

    public void setManagerName(String managerName) {
        this.managerName = managerName;
    }

    public String getContactNo() {
        return contactNo;
    }

    public void setContactNo(String contactNo) {
        this.contactNo = contactNo;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

	public UserBusiness getUserBusiness() {
		return userBusiness;
	}

	public void setUserBusiness(UserBusiness userBusiness) {
		this.userBusiness = userBusiness;
	}

	
}

