package com.tsarit.billing.controller;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tsarit.billing.dto.BusinessRequestDto;
import com.tsarit.billing.dto.BusinessResponseDto;
import com.tsarit.billing.model.Business;
import com.tsarit.billing.model.GstDetails;
import com.tsarit.billing.repository.BusinessRepository;
import com.tsarit.billing.service.BusinessService;

@RestController
@RequestMapping("/api/business")
@CrossOrigin(origins = "*")
public class BusinessController {

    @Autowired
    private BusinessRepository businessRepo;

    @Autowired
    private BusinessService businessService;

    /* ================= CREATE BUSINESS ================= */

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createBusiness(
    		@RequestPart("business") Business business,
            @RequestParam("userId") String userId,
            @RequestParam("isGstRegistered") Boolean isGstRegistered,
            @RequestParam(value = "gstNo", required = false) String gstNo,
            @RequestPart(value = "businessLogo", required = false) MultipartFile logo,
            @RequestPart(value = "signature", required = false) MultipartFile signature
    ) throws Exception {
    	if (logo != null && !logo.isEmpty()) {
            business.setBusinessLogo(logo.getBytes());
        }

        if (signature != null && !signature.isEmpty()) {
            business.setSignature(signature.getBytes());
        }

        BusinessResponseDto response =
                businessService.createBusiness(
                        userId,
                        business,
                        isGstRegistered,
                        gstNo
                );
        
        return ResponseEntity.ok(response);
        
    }

    /* ================= GET BUSINESS DETAILS ================= */

    @GetMapping("/{businessId}")
    public ResponseEntity<?> getBusiness(@PathVariable String businessId) {

        Business business = businessRepo.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        Map<String, Object> response = new HashMap<>();

        response.put("businessId", business.getId());
        response.put("businessName", business.getBusinessName());
        response.put("industryType", business.getIndustryType());
        response.put("phoneNo", business.getPhoneNo());
        response.put("email", business.getEmail());
        response.put("address", business.getAddress());
        response.put("city", business.getCity());
        response.put("state", business.getState());
        response.put("pincode", business.getPincode());
        response.put("panCardNo", business.getPanCardNo());
        response.put("isEnableTds", business.getIsEnableTds());
        response.put("isEnableTcs", business.getIsEnableTcs());
        response.put("isEnableEinvoicing", business.getIsEnableEinvoicing());
        response.put("extras", business.getExtras());

        if (business.getBusinessLogo() != null) {
            response.put("logo",
                    Base64.getEncoder().encodeToString(business.getBusinessLogo()));
        }

        if (business.getSignature() != null) {
            response.put("signature",
                    Base64.getEncoder().encodeToString(business.getSignature()));
        }

        return ResponseEntity.ok(response);
    }

    /* ================= UPDATE BUSINESS ================= */

    @PutMapping(value = "/update/{businessId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateBusiness(
            @PathVariable String businessId,
            @RequestPart("business") Business updatedBusiness,
            @RequestPart(required = false) MultipartFile logo,
            @RequestPart(required = false) MultipartFile signature,
            @RequestParam("isGstRegistered") Boolean isGstRegistered,
            @RequestParam(value = "gstNo", required = false) String gstNo
    ) throws Exception {

            businessService.updateBusiness(
                    businessId,
                    updatedBusiness,
                    logo,
                    signature,
                    isGstRegistered,
                    gstNo
                   
            );

        return ResponseEntity.ok("Business updated successfully");
    }
}