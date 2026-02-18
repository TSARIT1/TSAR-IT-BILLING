package com.tsarit.billing.repository;

import com.tsarit.billing.model.OnlineStoreProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OnlineStoreProductRepository extends JpaRepository<OnlineStoreProduct, String> {
    List<OnlineStoreProduct> findByOnlineStore_Id(String storeId);
}
