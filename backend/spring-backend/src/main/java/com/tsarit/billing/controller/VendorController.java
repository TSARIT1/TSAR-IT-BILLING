//package com.tsarit.billing.controller;
//
//import org.springframework.web.bind.annotation.*;
//import org.springframework.beans.factory.annotation.Autowired;
//import com.tsarit.billing.model.Vendor;
//import com.tsarit.billing.repository.VendorRepository;
//
//import java.util.List;
//import java.util.Optional;
//
//@RestController
//@RequestMapping("/api")
//public class VendorController {
//    @Autowired
//    private VendorRepository repo;
//
//    @GetMapping("/vendors/")
//    public List<Vendor> list(){ return repo.findAll(); }
//
//    @PostMapping("/vendors/")
//    public Vendor create(@RequestBody Vendor v){ return repo.save(v); }
//
//    @PutMapping("/vendors/{id}")
//    public Vendor update(@PathVariable Long id, @RequestBody Vendor v){
//        Optional<Vendor> op = repo.findById(id);
//        if (op.isEmpty()) return null;
//        Vendor ex = op.get();
//        ex.setName(v.getName()); ex.setEmail(v.getEmail()); ex.setPhone(v.getPhone()); ex.setAddress(v.getAddress());
//        return repo.save(ex);
//    }
//
//    @DeleteMapping("/vendors/{id}")
//    public void delete(@PathVariable Long id){ repo.deleteById(id); }
//}

package com.tsarit.billing.controller;

import com.tsarit.billing.model.Vendor;
import com.tsarit.billing.model.Vendor.Status;
import com.tsarit.billing.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    @Autowired
    private VendorRepository vendorRepository;

    // ===== Create a new Vendor =====
    @PostMapping
    public ResponseEntity<Vendor> createVendor(@RequestBody Vendor vendor) {
        Vendor savedVendor = vendorRepository.save(vendor);
        return ResponseEntity.ok(savedVendor);
    }

    // ===== Get all Vendors =====
    @GetMapping
    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    // ===== Get Vendor by ID =====
    @GetMapping("/{id}")
    public ResponseEntity<Vendor> getVendorById(@PathVariable String id) {
        Optional<Vendor> vendorOpt = vendorRepository.findById(id);
        return vendorOpt.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }

    // ===== Update Vendor by ID =====
    @PutMapping("/{id}")
    public ResponseEntity<Vendor> updateVendor(@PathVariable String id, @RequestBody Vendor vendorDetails) {
        Optional<Vendor> vendorOpt = vendorRepository.findById(id);
        if (!vendorOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Vendor vendor = vendorOpt.get();
        vendor.setName(vendorDetails.getName());
        vendor.setContactPerson(vendorDetails.getContactPerson());
        vendor.setPhone(vendorDetails.getPhone());
        vendor.setEmail(vendorDetails.getEmail());
        vendor.setStreetAddress(vendorDetails.getStreetAddress());
        vendor.setCity(vendorDetails.getCity());
        vendor.setState(vendorDetails.getState());
        vendor.setZipCode(vendorDetails.getZipCode());
        vendor.setCountry(vendorDetails.getCountry());
        vendor.setVendorType(vendorDetails.getVendorType());
        vendor.setTaxId(vendorDetails.getTaxId());
        vendor.setAccountNumber(vendorDetails.getAccountNumber());
        vendor.setIfscCode(vendorDetails.getIfscCode());
        vendor.setNotes(vendorDetails.getNotes());
        vendor.setStatus(vendorDetails.getStatus());

        Vendor updatedVendor = vendorRepository.save(vendor);
        return ResponseEntity.ok(updatedVendor);
    }

    // ===== Delete Vendor by ID =====
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendor(@PathVariable String id) {
        if (!vendorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        vendorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ===== Update Vendor Status =====
    @PatchMapping("/{id}/status")
    public ResponseEntity<Vendor> updateVendorStatus(@PathVariable String id, @RequestParam Status status) {
        Optional<Vendor> vendorOpt = vendorRepository.findById(id);
        if (!vendorOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Vendor vendor = vendorOpt.get();
        vendor.setStatus(status);
        Vendor updatedVendor = vendorRepository.save(vendor);
        return ResponseEntity.ok(updatedVendor);
    }
}
