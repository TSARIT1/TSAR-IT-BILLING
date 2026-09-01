package com.tsarit.billing.repository;

import com.tsarit.billing.model.WarehouseTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarehouseTransferRepository extends JpaRepository<WarehouseTransfer, String> {
    List<WarehouseTransfer> findAllByOrderByCreatedAtDesc();
    List<WarehouseTransfer> findByFromGodownIdOrToGodownIdOrderByCreatedAtDesc(String fromGodownId, String toGodownId);
}
