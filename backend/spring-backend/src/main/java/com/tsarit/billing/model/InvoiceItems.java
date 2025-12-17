package com.tsarit.billing.model;

import jakarta.persistence.*;

@Entity
@Table(name = "invoice_items")
public class InvoiceItems {
	
	 @Id
	 @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "item_id", length = 50,nullable=false,updatable=false)
	private String id;

    @Column(name = "item_no")
    private int itemNo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "invoice_id",
        nullable = false
    )
    private Invoice invoice;
    
    private String itemName;

    private int qty;
    private double price;
    private double discount;
    private double tax;
    private double totalLineAmount;


	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public Invoice getInvoice() {
		return invoice;
	}

	public void setInvoice(Invoice invoice) {
		this.invoice = invoice;
	}

	public int getItemNo() {
		return itemNo;
	}

	public void setItemNo(int itemNo) {
		this.itemNo = itemNo;
	}

	public String getItemName() {
		return itemName;
	}

	public void setItemName(String itemName) {
		this.itemName = itemName;
	}

	public int getQty() {
		return qty;
	}

	public void setQty(int qty) {
		this.qty = qty;
	}

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	public double getDiscount() {
		return discount;
	}

	public void setDiscount(double discount) {
		this.discount = discount;
	}

	public double getTax() {
		return tax;
	}

	public void setTax(double tax) {
		this.tax = tax;
	}

	public double getTotalLineAmount() {
		return totalLineAmount;
	}

	public void setTotalLineAmount(double totalLineAmount) {
		this.totalLineAmount = totalLineAmount;
	}

}

