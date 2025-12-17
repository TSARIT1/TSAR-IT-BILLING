//package com.tsarit.billing.controller;
//
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.tsarit.billing.model.BusinessType;
//import com.tsarit.billing.model.UserBusiness;
//import com.tsarit.billing.repository.UserBusinessRepository;
//
//@RestController
//@RequestMapping("/api/user-business")
//@CrossOrigin(origins = "*")
//public class UserBusinessController {
//
//    @Autowired
//    private UserBusinessRepository userBusinessRepo;
//
//    /* ================= GET ALL BUSINESSES OF USER ================= */
//
//    @GetMapping("/user/{userId}")
//    public ResponseEntity<?> getBusinessesByUser(@PathVariable Long userId) {
//        return ResponseEntity.ok(
//                userBusinessRepo.findByUserId(userId)
//        );
//    }
//
//    /* ================= SWITCH PRIMARY BUSINESS ================= */
//
////    @PutMapping("/switch-primary")
////    public ResponseEntity<?> switchPrimaryBusiness(
////            @RequestParam Long userId,
////            @RequestParam Long businessId
////    ) {
////
////        List<UserBusiness> list = userBusinessRepo.findByUserId(userId);
////
////        for (UserBusiness ub : list) {
////            if (ub.getBusinessId().equals(businessId)) {
////                ub.setBusinessType(BusinessType.PRIMARY);
////            } else {
////                ub.setBusinessType(BusinessType.SECONDARY);
////            }
////        }
////
////        userBusinessRepo.saveAll(list);
////
////        return ResponseEntity.ok("Primary business switched successfully");
////    }
//
//    /* ================= DELETE SECONDARY BUSINESS ================= */
//
//    @DeleteMapping("/delete/{id}")
//    public ResponseEntity<?> deleteSecondaryBusiness(@PathVariable Long id) {
//        userBusinessRepo.deleteById(id);
//        return ResponseEntity.ok("Secondary business removed");
//    }
//}
//
