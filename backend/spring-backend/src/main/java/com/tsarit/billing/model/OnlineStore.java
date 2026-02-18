package com.tsarit.billing.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "online_stores")
public class OnlineStore {

    @Id
    @Column(name = "id", nullable = false, unique = true)
    private String id;

    @Column(name = "store_name", nullable = false)
    private String storeName;

    @Column(name = "categories", length = 1000)
    private String categories; // comma-separated

    @Column(name = "status")
    private String status; // ACTIVE, INACTIVE

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "onlineStore", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OnlineStoreProduct> products = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null)
            this.status = "ACTIVE";
    }

    // Getters & Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getCategories() {
        return categories;
    }

    public void setCategories(String categories) {
        this.categories = categories;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<OnlineStoreProduct> getProducts() {
        return products;
    }

    public void setProducts(List<OnlineStoreProduct> products) {
        this.products = products;
    }
}
