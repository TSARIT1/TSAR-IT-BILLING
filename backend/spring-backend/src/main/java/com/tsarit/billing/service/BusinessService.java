package com.tsarit.billing.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.tsarit.billing.dto.BusinessResponseDto;
import com.tsarit.billing.model.Business;
import com.tsarit.billing.model.BusinessExtras;
import com.tsarit.billing.model.GstDetails;
import com.tsarit.billing.model.IdGenerator;
import com.tsarit.billing.model.User;
import com.tsarit.billing.model.UserBusiness;
import com.tsarit.billing.repository.BusinessRepository;
import com.tsarit.billing.repository.GstDetailsRepository;
import com.tsarit.billing.repository.UserBusinessRepository;
import com.tsarit.billing.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class BusinessService {

	@Autowired
	private UserRepository userRepo;
	 
    @Autowired
    private BusinessRepository businessRepo;

    @Autowired
    private UserBusinessRepository userBusinessRepo;

    @Autowired
    private GstDetailsRepository gstRepo;

    @Transactional
    public BusinessResponseDto createBusiness(
            String userId,
            Business business,
            Boolean isGstRegistered,
            String gstNo
    ) {

        // ------------------ VALIDATIONS ------------------
        // Validate User
    	User user = userRepo.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found with ID: " + userId)
                );

    	//business.setId(IdGenerator.businessId());
    	
        // Validate BusinessType
    	if (business.getBusinessType() == null) {
            throw new IllegalArgumentException("BusinessType must be provided");
        }

    	
        // Default boolean values
        business.setIsEnableTds(business.getIsEnableTds() != null ? business.getIsEnableTds() : false);
        business.setIsEnableTcs(business.getIsEnableTcs() != null ? business.getIsEnableTcs() : false);
        business.setIsEnableEinvoicing(business.getIsEnableEinvoicing() != null ? business.getIsEnableEinvoicing() : false);

        
      //  Business savedBusiness = businessRepo.save(business);

        /* ---------- HANDLE EXTRAS ---------- */
        if (business.getExtras() != null) {

            business.getExtras().removeIf(extra ->
                    extra.getExtraKey() == null || extra.getExtraKey().trim().isEmpty()
                 || extra.getExtraValue() == null || extra.getExtraValue().trim().isEmpty()
            );

            for (BusinessExtras extra : business.getExtras()) {
              //  extra.setId(IdGenerator.businessExtraId());   // 
            	extra.setBusiness(business);              //
            }
        }
        
        Business savedBusiness = businessRepo.save(business);
        
        System.out.println("Saved Business ID: " + savedBusiness.getId());
        if (savedBusiness.getId() == null) {
            throw new RuntimeException("Business ID was not generated!");
        }
        
        /* ---------- USER ↔ BUSINESS ---------- */
        UserBusiness ub = new UserBusiness();
      //  ub.setId(IdGenerator.userBusinessId());  
        ub.setUser(user);
        ub.setBusiness(savedBusiness);
        System.out.println("UserBusiness - User ID: " + user.getId());
        System.out.println("UserBusiness - Business ID: " + savedBusiness.getId());
        UserBusiness savedUb = userBusinessRepo.save(ub);
        System.out.println("========== BACKEND DEBUG ==========");
        System.out.println("Business ID: " + savedBusiness.getId());
        System.out.println("UserBusiness ID: " + savedUb.getId());
        /* ---------- GST DETAILS ---------- */
        boolean gstFlag = Boolean.TRUE.equals(isGstRegistered);

        if (gstFlag && (gstNo == null || gstNo.trim().isEmpty())) {
            throw new IllegalArgumentException("GST number must be provided when GST is registered");
        }

        GstDetails gst = new GstDetails();
       // gst.setId(IdGenerator.gstId());         
        gst.setBusiness(savedBusiness);
        gst.setIsGstRegistered(gstFlag);
        gst.setGstNo(gstFlag ? gstNo : null);

        gstRepo.save(gst);

        return new BusinessResponseDto(
                savedBusiness.getId(),
                savedBusiness.getBusinessName(),
                savedBusiness.getBusinessType().name(), 
                gstNo,
                savedBusiness.getAddress(),
                savedBusiness.getCity(),
                savedBusiness.getState(),
                savedBusiness.getPincode(),
                savedBusiness.getPhoneNo(),
                savedBusiness.getEmail(),
                savedBusiness.getCreatedDate(),
                savedUb.getId()
        );
    }
    
    @Transactional
    public void updateBusiness(
            String Id,
            Business updatedBusiness,
            MultipartFile logo,
            MultipartFile signature,
            Boolean isGstRegistered,
            String gstNo
    ) {

        Business business = businessRepo.findById(Id)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        /* ========== UPDATE BASIC FIELDS ========== */

        business.setBusinessName(updatedBusiness.getBusinessName());
        business.setIndustryType(updatedBusiness.getIndustryType());
        business.setPhoneNo(updatedBusiness.getPhoneNo());
        business.setEmail(updatedBusiness.getEmail());
        business.setAddress(updatedBusiness.getAddress());
        business.setCity(updatedBusiness.getCity());
        business.setState(updatedBusiness.getState());
        business.setPincode(updatedBusiness.getPincode());
        business.setPanCardNo(updatedBusiness.getPanCardNo());
        business.setIsEnableTds(
                updatedBusiness.getIsEnableTds() != null ? updatedBusiness.getIsEnableTds() : false
        );
        business.setIsEnableTcs(
                updatedBusiness.getIsEnableTcs() != null ? updatedBusiness.getIsEnableTcs() : false
        );
        business.setIsEnableEinvoicing(
                updatedBusiness.getIsEnableEinvoicing() != null ? updatedBusiness.getIsEnableEinvoicing() : false
        );
       
        business.setBusinessType(updatedBusiness.getBusinessType());

  
        /* ========== EXTRAS (IMPORTANT PART) ========== */

        business.getExtras().clear(); //

        if (updatedBusiness.getExtras() != null) {
            updatedBusiness.getExtras().forEach(ex -> {

            	if (ex.getExtraKey() == null || ex.getExtraKey().trim().isEmpty()
                        || ex.getExtraValue() == null || ex.getExtraValue().trim().isEmpty()) {
                           return; // skip invalid rows
                       }

            	BusinessExtras newExtra = new BusinessExtras();
            //    newExtra.setId(IdGenerator.businessExtraId());  
                newExtra.setExtraKey(ex.getExtraKey());
                newExtra.setExtraValue(ex.getExtraValue());
                newExtra.setBusiness(business);               

                business.getExtras().add(newExtra);
            });
        }
        /* ========== FILES ========== */

        try {
            if (logo != null && !logo.isEmpty()) {
                business.setBusinessLogo(logo.getBytes());
            }

            if (signature != null && !signature.isEmpty()) {
                business.setSignature(signature.getBytes());
            }
        } catch (Exception e) {
            throw new RuntimeException("File upload failed", e);
        }
        
        /* ---------- UPDATE GST DETAILS ---------- */
        GstDetails gst = gstRepo.findByBusiness_Id(Id)
                .orElseGet(() -> {
                    GstDetails g = new GstDetails();
               //     g.setId(IdGenerator.gstId());
                    g.setBusiness(business);
                    return g;
                });

        boolean gstFlag = Boolean.TRUE.equals(isGstRegistered);

        if (gstFlag && (gstNo == null || gstNo.trim().isEmpty())) {
            throw new IllegalArgumentException("GST number is required");
        }

        gst.setIsGstRegistered(gstFlag);
        gst.setGstNo(gstFlag ? gstNo : null);

        gstRepo.save(gst);

        /* ========== FINAL SAVE ========== */
        businessRepo.save(business);
    }

	
}

