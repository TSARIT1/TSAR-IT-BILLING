package com.tsarit.billing.controller;

import com.tsarit.billing.model.WarehouseTransfer;
import com.tsarit.billing.service.WarehouseTransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/warehouse-transfers")
@CrossOrigin(originPatterns = "*")
public class WarehouseTransferController {

    @Autowired
    private WarehouseTransferService warehouseTransferService;

    @PostMapping("/create")
    public ResponseEntity<WarehouseTransfer> createTransfer(@RequestBody Map<String, Object> payload) {
        String fromGodownId = (String) payload.get("fromGodownId");
        String fromGodownName = (String) payload.get("fromGodownName");
        String toGodownId = (String) payload.get("toGodownId");
        String toGodownName = (String) payload.get("toGodownName");
        Long productId = payload.get("productId") != null ? Long.valueOf(payload.get("productId").toString()) : null;
        String productName = (String) payload.get("productName");
        Integer quantity = payload.get("quantity") != null ? Integer.valueOf(payload.get("quantity").toString()) : 1;
        String vehicleNumber = (String) payload.get("vehicleNumber");
        String notes = (String) payload.get("notes");

        return ResponseEntity.ok(warehouseTransferService.createStockTransfer(
            fromGodownId, fromGodownName, toGodownId, toGodownName,
            productId, productName, quantity, vehicleNumber, notes
        ));
    }

    @GetMapping("/list")
    public ResponseEntity<List<WarehouseTransfer>> getAllTransfers() {
        return ResponseEntity.ok(warehouseTransferService.getAllTransfers());
    }
}
