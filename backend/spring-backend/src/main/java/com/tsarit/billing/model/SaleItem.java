package com.tsarit.billing.model;

import jakarta.persistence.*;

@Entity
@Table(name="sale_items")
public class SaleItem {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "price", nullable = false)
    private Double price;
    
    @Column(name = "sale_item_id", nullable = false, length = 50)
    private String saleItemId;

    // getters & setters

    public Long getId() {
        return id;
    }

    public Sale getSale() {
        return sale;
    }

    public void setSale(Sale sale) {
        this.sale = sale;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

	public String getSaleItemId() {
		return saleItemId;
	}

	public void setSaleItemId(String saleItemId) {
		this.saleItemId = saleItemId;
	}

	public void setId(Long id) {
		this.id = id;
	}
    
    
}
