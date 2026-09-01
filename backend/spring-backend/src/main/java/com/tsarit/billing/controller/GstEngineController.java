package com.tsarit.billing.controller;

import com.tsarit.billing.service.GstEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/gst-engine")
@CrossOrigin(origins = "*")
public class GstEngineController {

    @Autowired
    private GstEngineService gstEngineService;

    @GetMapping("/calculate")
    public ResponseEntity<GstEngineService.TaxCalculationResult> calculateTax(
            @RequestParam BigDecimal amount,
            @RequestParam BigDecimal rate,
            @RequestParam(required = false, defaultValue = "36") String supplierState,
            @RequestParam(required = false, defaultValue = "36") String recipientState,
            @RequestParam(required = false, defaultValue = "0") BigDecimal cess,
            @RequestParam(required = false, defaultValue = "false") boolean rcm) {
        return ResponseEntity.ok(gstEngineService.calculateTax(amount, rate, supplierState, recipientState, cess, rcm));
    }

    @GetMapping("/gstr-1")
    public ResponseEntity<Map<String, Object>> getGstr1(@RequestParam(required = false) String userId) {
        return ResponseEntity.ok(gstEngineService.generateGstr1(userId));
    }

    @GetMapping("/gstr-3b")
    public ResponseEntity<Map<String, Object>> getGstr3b(@RequestParam(required = false) String userId) {
        return ResponseEntity.ok(gstEngineService.generateGstr3b(userId));
    }
}
