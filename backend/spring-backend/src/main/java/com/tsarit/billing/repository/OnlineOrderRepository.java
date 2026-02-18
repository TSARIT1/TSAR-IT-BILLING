package com.tsarit.billing.repository;

import com.tsarit.billing.model.OnlineOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OnlineOrderRepository extends JpaRepository<OnlineOrder, String> {
    List<OnlineOrder> findAllByOrderByOrderDateDesc();
}
