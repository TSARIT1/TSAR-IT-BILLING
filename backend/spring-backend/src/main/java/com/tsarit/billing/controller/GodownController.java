package com.tsarit.billing.controller;

import com.tsarit.billing.dto.GodownRequestDto;
import com.tsarit.billing.dto.GodownResponseDto;
import com.tsarit.billing.model.Godown;
import com.tsarit.billing.model.GstDetails;
import com.tsarit.billing.model.User;
import com.tsarit.billing.model.UserBusiness;
import com.tsarit.billing.repository.GodownRepository;
import com.tsarit.billing.repository.GstDetailsRepository;
import com.tsarit.billing.repository.ProductRepository;
import com.tsarit.billing.repository.UserBusinessRepository;
import com.tsarit.billing.repository.UserRepository;
import com.tsarit.billing.service.PdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/godowns")
public class GodownController {

    private final GodownRepository godownRepo;
    
    @Autowired
    private UserBusinessRepository userBusinessRepo;
    
    @Autowired
    private UserRepository userRepo;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private PdfService pdfService;
    
    @Autowired
	private GstDetailsRepository gstDetailsRepository;

    public GodownController(GodownRepository godownRepo) {
        this.godownRepo = godownRepo;
    }

    // Create Godown
    @PostMapping("/create")
    public ResponseEntity<?> createGodown(@RequestBody GodownRequestDto dto) {

    	UserBusiness business = userBusinessRepo
                .findById(dto.getUserBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found"));
    	 
        if (godownRepo.existsById(dto.getGodownId())) {
            return ResponseEntity.badRequest().body("Godown ID already exists");
        }

        Godown godown = new Godown();
        godown.setGodownId(dto.getGodownId());
        godown.setGodownName(dto.getGodownName());
        godown.setLocation(dto.getLocation());
        godown.setManagerName(dto.getManagerName());
        godown.setContactNo(dto.getContactNo());
        godown.setUserBusiness(business);

        godownRepo.save(godown);

        return ResponseEntity.ok("Godown created successfully");
    }

    // Get All Godowns
    @GetMapping("/list/{userBusinessId}")
    public ResponseEntity<List<GodownResponseDto>> getGodownsByBusiness(
            @PathVariable String userBusinessId) {

        List<Godown> godowns =
                godownRepo.findByUserBusiness_IdOrderByCreatedDateDesc(userBusinessId);

        List<GodownResponseDto> response = godowns.stream()
                .map(g -> new GodownResponseDto(
                        g.getGodownId(),
                        g.getGodownName(),
                        g.getLocation(),
                        g.getManagerName(),
                        g.getContactNo(),
                        g.getCreatedDate(),
                        g.getUserBusiness().getId()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }


    // Get Godown By ID
    @GetMapping("/{godownId}")
    public ResponseEntity<GodownResponseDto> getGodown(@PathVariable String godownId) {
        Godown godown = godownRepo.findById(godownId)
                .orElseThrow(() -> new RuntimeException("Godown not found with ID: " + godownId));
        
        // Extract userBusinessId from the UserBusiness relationship
        String userBusinessId = null;
        if (godown.getUserBusiness() != null) {
            userBusinessId = godown.getUserBusiness().getId();  
        }
        
        // Convert entity to DTO
        GodownResponseDto response = new GodownResponseDto(
            godown.getGodownId(),
            godown.getGodownName(),
            godown.getLocation(),
            godown.getManagerName(),
            godown.getContactNo(),
            godown.getCreatedDate(),
            userBusinessId  
        );
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{godownId}")
    public ResponseEntity<?> updateGodown(
            @PathVariable String godownId,
            @RequestBody GodownRequestDto request) {
        try {
            Godown godown = godownRepo.findById(godownId)
                    .orElseThrow(() -> new RuntimeException("Godown not found"));
            
            // Update fields
            godown.setGodownName(request.getGodownName());
            godown.setLocation(request.getLocation());
            godown.setManagerName(request.getManagerName());
            godown.setContactNo(request.getContactNo());
            
            // Update UserBusiness if provided
            if (request.getUserBusinessId() != null) {
                UserBusiness userBusiness = userBusinessRepo.findById(request.getUserBusinessId())
                        .orElseThrow(() -> new RuntimeException("UserBusiness not found"));
                godown.setUserBusiness(userBusiness);
            }
            
            godownRepo.save(godown);
            return ResponseEntity.ok("Godown updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
    
    // Delete Godown
    @DeleteMapping("/delete/{godownId}")
    public ResponseEntity<?> deleteGodown(@PathVariable String godownId) {
        try {
            // Check if godown exists
            Godown godown = godownRepo.findById(godownId)
                    .orElseThrow(() -> new RuntimeException("Godown not found with ID: " + godownId));
            
            // Delete the godown
            godownRepo.delete(godown);
            
            return ResponseEntity.ok("Godown deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting godown: " + e.getMessage());
        }
    }
    
    @GetMapping("/report/pdf/{userBusinessId}")
    public ResponseEntity<byte[]> downloadGodownReport(@PathVariable String userBusinessId) {
        
       
        UserBusiness userBusiness = userBusinessRepo
                .findById(userBusinessId)
                .orElse(null);

        if (userBusiness == null) {
            return ResponseEntity.notFound().build();
        }
        
        List<Godown> godowns =
                godownRepo.findByUserBusiness_Id(userBusinessId);

        if (godowns.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = userRepo
                .findById(userBusiness.getUser().getId())
                .orElse(null);
        String businessId = userBusiness.getBusiness().getId();
        
        Optional<GstDetails> gstOpt =
                gstDetailsRepository.findByBusiness_Id(businessId);
        
        GstDetails gstDetails = gstOpt.orElse(null);
        // Pass productRepository to the PDF service
        byte[] pdfBytes = pdfService.generateGodownReport(godowns, userBusiness,user, gstOpt, productRepository);
        
        return ResponseEntity.ok()
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=godown-report-" + userBusinessId + ".pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}

