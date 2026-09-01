package com.tsarit.billing.controller;

import com.tsarit.billing.service.EInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/einvoice")
@CrossOrigin(originPatterns = "*")
public class EInvoiceController {

    @Autowired
    private EInvoiceService eInvoiceService;

    @PostMapping("/generate-irn")
    public ResponseEntity<EInvoiceService.EInvoiceResponse> generateIrn(@RequestBody Map<String, String> payload) {
        String invoiceId = payload.get("invoiceId");
        return ResponseEntity.ok(eInvoiceService.generateIrn(invoiceId));
    }

    @PostMapping("/generate-ewaybill")
    public ResponseEntity<EInvoiceService.EWayBillResponse> generateEWayBill(@RequestBody Map<String, String> payload) {
        String invoiceId = payload.get("invoiceId");
        String transporterId = payload.get("transporterId");
        String transporterName = payload.get("transporterName");
        String vehicleNo = payload.get("vehicleNo");
        String distanceKm = payload.get("distanceKm");
        return ResponseEntity.ok(eInvoiceService.generateEWayBill(invoiceId, transporterId, transporterName, vehicleNo, distanceKm));
    }

    @PostMapping("/cancel-irn")
    public ResponseEntity<Map<String, Object>> cancelIrn(@RequestBody Map<String, String> payload) {
        String invoiceId = payload.get("invoiceId");
        String irn = payload.get("irn");
        String reason = payload.get("reason");
        return ResponseEntity.ok(eInvoiceService.cancelIrn(invoiceId, irn, reason));
    }
}
