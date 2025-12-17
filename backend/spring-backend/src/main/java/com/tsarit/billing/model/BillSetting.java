package com.tsarit.billing.model;

import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bill_settings")
public class BillSetting {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    // Basic Info
	    @Column(nullable = false)
	    private String shopName;

	    @Column(nullable = false)
	    private String address;

	    private String phone;
	    private String email;
	    private String gstin;

	    // Files (stored as file paths or URLs)
	    private String companyLogo;       // Path to uploaded logo
	    private String signatureImage;    // Path to uploaded signature

	    // UPI & Bank Details
	    private String upiId;
	    private String bankName;
	    private String accountNumber;
	    private String ifscCode;
	    private String branch;

	    // Bill Options
	    private boolean showCustomerDetails;
	    private boolean autoPrintBills;
	    private boolean showSignatureOnBill;

	    // Terms & Conditions
	    @ElementCollection
	    @CollectionTable(name = "bill_terms")
	    @Column(name = "term")
	    private List<String> terms;

	    // ===== Getters & Setters =====
	    public Long getId() { return id; }
	    public void setId(Long id) { this.id = id; }

	    public String getShopName() { return shopName; }
	    public void setShopName(String shopName) { this.shopName = shopName; }

	    public String getAddress() { return address; }
	    public void setAddress(String address) { this.address = address; }

	    public String getPhone() { return phone; }
	    public void setPhone(String phone) { this.phone = phone; }

	    public String getEmail() { return email; }
	    public void setEmail(String email) { this.email = email; }

	    public String getGstin() { return gstin; }
	    public void setGstin(String gstin) { this.gstin = gstin; }

	    public String getCompanyLogo() { return companyLogo; }
	    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

	    public String getSignatureImage() { return signatureImage; }
	    public void setSignatureImage(String signatureImage) { this.signatureImage = signatureImage; }

	    public String getUpiId() { return upiId; }
	    public void setUpiId(String upiId) { this.upiId = upiId; }

	    public String getBankName() { return bankName; }
	    public void setBankName(String bankName) { this.bankName = bankName; }

	    public String getAccountNumber() { return accountNumber; }
	    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

	    public String getIfscCode() { return ifscCode; }
	    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }

	    public String getBranch() { return branch; }
	    public void setBranch(String branch) { this.branch = branch; }

	    public boolean isShowCustomerDetails() { return showCustomerDetails; }
	    public void setShowCustomerDetails(boolean showCustomerDetails) { this.showCustomerDetails = showCustomerDetails; }

	    public boolean isAutoPrintBills() { return autoPrintBills; }
	    public void setAutoPrintBills(boolean autoPrintBills) { this.autoPrintBills = autoPrintBills; }

	    public boolean isShowSignatureOnBill() { return showSignatureOnBill; }
	    public void setShowSignatureOnBill(boolean showSignatureOnBill) { this.showSignatureOnBill = showSignatureOnBill; }

	    public List<String> getTerms() { return terms; }
	    public void setTerms(List<String> terms) { this.terms = terms; }
}
