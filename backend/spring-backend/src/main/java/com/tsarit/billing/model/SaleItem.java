package com.tsarit.billing.model;

import jakarta.persistence.*;

@Entity
@Table(name="sale_items")
public class SaleItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Product product;

    private Integer quantity;
    private Double price;

    // getters and setters
    public Long getId(){return id;}
    public void setId(Long id){this.id=id;}
    public Product getProduct(){return product;}
    public void setProduct(Product p){this.product=p;}
    public Integer getQuantity(){return quantity;}
    public void setQuantity(Integer q){this.quantity=q;}
    public Double getPrice(){return price;}
    public void setPrice(Double p){this.price=p;}
}
