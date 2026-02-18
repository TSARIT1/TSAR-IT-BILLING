package com.tsarit.billing.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="sales")
public class Sale {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@Column(name = "total_amount")
	private Double totalAmount;
	
	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@Column(name = "customer_id", nullable = false)
    private Long customerId;
	 
	@Column(name = "is_paid")
	private Boolean isPaid = false;
	 
	 @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
	 private List<SaleItem> items = new ArrayList<>();

	 @PrePersist
		protected void onCreate() {
		    this.createdAt = LocalDateTime.now();
		}
	 
    // getters and setters
    
    public Double getTotalAmount(){return totalAmount;}
   
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}
	
	public void setTotalAmount(Double t){this.totalAmount=t;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public void setCreatedAt(LocalDateTime d){this.createdAt=d;}
    
    public Long getCustomerId() {
		return customerId;
	}

	public void setCustomerId(Long customerId) {
		this.customerId = customerId;
	}

	
	public Boolean getIsPaid() {
		return isPaid;
	}

	public void setIsPaid(Boolean isPaid) {
		this.isPaid = isPaid;
	}

	public java.util.List<SaleItem> getItems(){return items;}
    public void setItems(java.util.List<SaleItem> it){this.items=it;}
    
}
