package com.tsarit.billing.repository;

import com.tsarit.billing.model.OnlineOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OnlineOrderItemRepository extends JpaRepository<OnlineOrderItem, String> {
    List<OnlineOrderItem> findByOnlineOrder_Id(String orderId);
}
