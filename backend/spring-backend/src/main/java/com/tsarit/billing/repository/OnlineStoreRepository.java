package com.tsarit.billing.repository;

import com.tsarit.billing.model.OnlineStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OnlineStoreRepository extends JpaRepository<OnlineStore, String> {
    List<OnlineStore> findAllByOrderByCreatedAtDesc();
}
