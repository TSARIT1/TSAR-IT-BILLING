package com.tsarit.billing.dto;

import com.tsarit.billing.model.Business;
import com.tsarit.billing.model.User;

import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

public class BusinessRequestDto {

    // ID of the user creating this business → FK to users.id
    private User user;                 
    
    // Business entity details
    private Business business;           
    
    // GST registration status
    private Boolean isGstRegistered;     
    
    // GST number if registered
    private String gstNo;                

    public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
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
