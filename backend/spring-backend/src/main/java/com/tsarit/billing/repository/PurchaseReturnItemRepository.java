package com.tsarit.billing.repository;

import com.tsarit.billing.model.PurchaseReturnItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseReturnItemRepository extends JpaRepository<PurchaseReturnItem, String> {

    // Find all non-deleted items for a specific purchase return
    List<PurchaseReturnItem> findByPurchaseReturn_IdAndIsDeletedFalse(String purchaseReturnId);

    List<PurchaseReturnItem> findByPurchaseReturnId(String returnId);
}
