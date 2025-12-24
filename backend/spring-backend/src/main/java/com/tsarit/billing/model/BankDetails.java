package com.tsarit.billing.model;
import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_details")
	public class BankDetails {
	    
	    @Id
	    @GeneratedValue(generator = "uuid")
	    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
	    @Column(name = "id", length = 255, nullable = false, updatable = false)
	    private String id;  
	    
	    @ManyToOne(fetch = FetchType.LAZY, optional = false)
	    @JoinColumn(
	        name = "customer_id",
	        nullable = false,
	        unique = true,   // one customer → one bank detail
	        foreignKey = @ForeignKey(name = "fk_bank_details_customer")
	    )
	    private Customer customer;
	    
	    @Column(name = "account_number")
	    private String accountNumber;
	    
	    @Column(name = "ifsc_code")
	    private String ifscCode;
	    
	    @Column(name = "bank_name")
	    private String bankName;
	    
	    @Column(name = "branch_name")
	    private String branchName;
	    
	    @Column(name = "created_at")
	    private LocalDateTime createdAt;
	    
	    @PrePersist
	    protected void onCreate() {
	        createdAt = LocalDateTime.now();	        
	    }	   
	    
	    // Getters and Setters
	    public String getId() { return id; }
	    public void setId(String id) { this.id = id; }
	    
	    public Customer getCustomer() {
			return customer;
		}

		public void setCustomer(Customer customer) {
			this.customer = customer;
		}

		public String getAccountNumber() { return accountNumber; }
	    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
	    
	    public String getIfscCode() { return ifscCode; }
	    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }
	    
	    public String getBankName() { return bankName; }
	    public void setBankName(String bankName) { this.bankName = bankName; }
	    
	    public String getBranchName() { return branchName; }
	    public void setBranchName(String branchName) { this.branchName = branchName; }
	    
	    public LocalDateTime getCreatedAt() { return createdAt; }
	   
}
