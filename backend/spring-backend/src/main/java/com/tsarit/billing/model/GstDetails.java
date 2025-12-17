package com.tsarit.billing.model;

import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "gst_details")
public class GstDetails {

	    @Id
	    @GeneratedValue(strategy = GenerationType.UUID)
	    @Column(name = "gstDetails_id", length = 50, nullable = false, updatable = false)
	    private String id;

	    @ManyToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "business_id", nullable = false)
	    private Business business;
    
    @Column(name = "is_gst_registered")
    private Boolean isGstRegistered; 

    @Column(name = "gst_no")
    private String gstNo;


	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public Business getBusiness() {
		return business;
	}

	public void setBusiness(Business business) {
		this.business = business;
	}

	public Boolean getIsGstRegistered() {
		return isGstRegistered;
	}

	public void setIsGstRegistered(Boolean isGstRegistered) {
		this.isGstRegistered = isGstRegistered;
	}

	public String getGstNo() {
		return gstNo;
	}

	public void setGstNo(String gstNo) {
		this.gstNo = gstNo;
	}
    
}

