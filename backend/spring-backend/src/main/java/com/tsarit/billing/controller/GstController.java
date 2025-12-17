//package com.tsarit.billing.controller;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.tsarit.billing.model.GstDetails;
//import com.tsarit.billing.repository.GstDetailsRepository;
//
//@RestController
//@RequestMapping("/api/gst")
//@CrossOrigin(origins = "*")
//public class GstController {
//
//    @Autowired
//    private GstDetailsRepository gstRepo;
//
//    /* ================= GET GST DETAILS ================= */
//
//    @GetMapping("/{businessId}")
//    public ResponseEntity<?> getGstDetails(@PathVariable Long businessId) {
//
//        GstDetails gst = gstRepo.findByBusiness_BusinessId(businessId)
//                .orElseThrow(() -> new RuntimeException("GST details not found"));
//
//        return ResponseEntity.ok(gst);
//    }
//
//    /* ================= UPDATE GST DETAILS ================= */
//
//    @PutMapping("/update/{businessId}")
//    public ResponseEntity<?> updateGstDetails(
//            @PathVariable Long businessId,
//            @RequestBody GstDetails request
//    ) {
//
//        GstDetails gst = gstRepo.findByBusiness_BusinessId(businessId)
//                .orElseThrow(() -> new RuntimeException("GST details not found"));
//
//        // Normalize GST logic
//        if ("YES".equalsIgnoreCase(request.getIsGstRegistered())) {
//            gst.setIsGstRegistered("YES");
//            gst.setGstNo(request.getGstNo());
//        } else {
//            gst.setIsGstRegistered("NO");
//            gst.setGstNo("NOT FOUND");
//        }
//
//        gstRepo.save(gst);
//        return ResponseEntity.ok("GST details updated successfully");
//    }
//}
//
