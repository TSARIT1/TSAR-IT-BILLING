package com.tsarit.billing.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name="sales")
public class Sale {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double totalAmount;
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    private Customer customer;

    @OneToMany(cascade = CascadeType.ALL)
    private java.util.List<SaleItem> items;

    // getters and setters
    public Long getId(){return id;}
    public void setId(Long id){this.id=id;}
    public Double getTotalAmount(){return totalAmount;}
    public void setTotalAmount(Double t){this.totalAmount=t;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public void setCreatedAt(LocalDateTime d){this.createdAt=d;}
    public Customer getCustomer(){return customer;}
    public void setCustomer(Customer c){this.customer=c;}
    public java.util.List<SaleItem> getItems(){return items;}
    public void setItems(java.util.List<SaleItem> it){this.items=it;}
}
