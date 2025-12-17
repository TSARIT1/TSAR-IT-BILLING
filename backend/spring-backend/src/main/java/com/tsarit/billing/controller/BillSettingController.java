package com.tsarit.billing.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tsarit.billing.model.BillSetting;
import com.tsarit.billing.repository.BillSettingRepository;

@RestController
@RequestMapping("/api/bill-settings")
public class BillSettingController {

    @Autowired
    private BillSettingRepository billSettingRepository;

    // ===== Create a new Bill Setting =====
    @PostMapping
    public ResponseEntity<BillSetting> createBillSetting(@RequestBody BillSetting billSetting) {
        BillSetting savedSetting = billSettingRepository.save(billSetting);
        return ResponseEntity.ok(savedSetting);
    }

    // ===== Get all Bill Settings =====
    @GetMapping
    public List<BillSetting> getAllBillSettings() {
        return billSettingRepository.findAll();
    }

    // ===== Get Bill Setting by ID =====
    @GetMapping("/{id}")
    public ResponseEntity<BillSetting> getBillSettingById(@PathVariable String id) {
        Optional<BillSetting> optional = billSettingRepository.findById(id);
        return optional.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    // ===== Update Bill Setting by ID =====
    @PutMapping("/{id}")
    public ResponseEntity<BillSetting> updateBillSetting(@PathVariable String id, @RequestBody BillSetting billSettingDetails) {
        Optional<BillSetting> optional = billSettingRepository.findById(id);
        if (!optional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        BillSetting billSetting = optional.get();
        billSetting.setShopName(billSettingDetails.getShopName());
        billSetting.setAddress(billSettingDetails.getAddress());
        billSetting.setPhone(billSettingDetails.getPhone());
        billSetting.setEmail(billSettingDetails.getEmail());
        billSetting.setGstin(billSettingDetails.getGstin());
        billSetting.setCompanyLogo(billSettingDetails.getCompanyLogo());
        billSetting.setSignatureImage(billSettingDetails.getSignatureImage());
        billSetting.setUpiId(billSettingDetails.getUpiId());
        billSetting.setBankName(billSettingDetails.getBankName());
        billSetting.setAccountNumber(billSettingDetails.getAccountNumber());
        billSetting.setIfscCode(billSettingDetails.getIfscCode());
        billSetting.setBranch(billSettingDetails.getBranch());
        billSetting.setShowCustomerDetails(billSettingDetails.isShowCustomerDetails());
        billSetting.setAutoPrintBills(billSettingDetails.isAutoPrintBills());
        billSetting.setShowSignatureOnBill(billSettingDetails.isShowSignatureOnBill());
        billSetting.setTerms(billSettingDetails.getTerms());

        BillSetting updatedSetting = billSettingRepository.save(billSetting);
        return ResponseEntity.ok(updatedSetting);
    }

    // ===== Delete Bill Setting by ID =====
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBillSetting(@PathVariable String id) {
        if (!billSettingRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        billSettingRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
