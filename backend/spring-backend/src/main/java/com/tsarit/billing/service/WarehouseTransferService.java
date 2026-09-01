package com.tsarit.billing.service;

import com.tsarit.billing.model.Product;
import com.tsarit.billing.model.WarehouseTransfer;
import com.tsarit.billing.repository.ProductRepository;
import com.tsarit.billing.repository.WarehouseTransferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class WarehouseTransferService {

    @Autowired
    private WarehouseTransferRepository warehouseTransferRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AuditService auditService;

    @Transactional
    public WarehouseTransfer createStockTransfer(String fromGodownId, String fromGodownName,
                                                 String toGodownId, String toGodownName,
                                                 Long productId, String productName, Integer quantity,
                                                 String vehicleNumber, String notes) {
        String challanNo = "DC-TRF-" + System.currentTimeMillis();

        WarehouseTransfer transfer = new WarehouseTransfer(
            challanNo, fromGodownId, fromGodownName, toGodownId, toGodownName,
            LocalDate.now(), productId, productName, quantity, vehicleNumber, notes
        );

        // Adjust stock if product exists
        if (productId != null) {
            Product prod = productRepository.findById(productId).orElse(null);
            if (prod != null && prod.getTotalStock() != null && prod.getTotalStock() >= quantity) {
                prod.setTotalStock(prod.getTotalStock() - quantity);
                productRepository.save(prod);
            }
        }

        WarehouseTransfer saved = warehouseTransferRepository.save(transfer);
        auditService.logEvent("GODOWN_TRANSFER", "CREATE_TRANSFER", saved.getId(), null,
                "Transferred " + quantity + " units of " + productName + " from " + fromGodownName + " to " + toGodownName, challanNo);
        return saved;
    }

    public List<WarehouseTransfer> getAllTransfers() {
        return warehouseTransferRepository.findAllByOrderByCreatedAtDesc();
    }
}
