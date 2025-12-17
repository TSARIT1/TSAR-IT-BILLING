package com.tsarit.billing.model;

import org.hibernate.annotations.GenericGenerator;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Table(name = "business_extras")
public class BusinessExtras {

	@Id
	 @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "business_extras_id", length = 50, nullable=false,updatable=false)
    private String id;
	
   
	@Column(name = "extra_key", nullable = false)
	private String extraKey;

	@Column(name = "extra_value", nullable = false)
	private String extraValue;

	/* ---------- FOREIGN KEY ---------- */
	 @ManyToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "business_id", nullable = false)
	    private Business business;


    public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getExtraKey() {
        return extraKey;
    }

    public void setExtraKey(String extraKey) {
        this.extraKey = extraKey;
    }

    public String getExtraValue() {
        return extraValue;
    }

    public void setExtraValue(String extraValue) {
        this.extraValue = extraValue;
    }
    public Business getBusiness() {
        return business;
    }

    public void setBusiness(Business business) {
        this.business = business;
    }
    
}

