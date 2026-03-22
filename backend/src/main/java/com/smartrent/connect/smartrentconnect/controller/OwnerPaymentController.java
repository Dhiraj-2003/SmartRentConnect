package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.dto.RazorpayOnboardingRequest;
import com.smartrent.connect.smartrentconnect.entity.Owner;
import com.smartrent.connect.smartrentconnect.entity.User;
import com.smartrent.connect.smartrentconnect.repository.OwnerRepository;
import com.smartrent.connect.smartrentconnect.Service.OwnerPaymentService;
import com.smartrent.connect.smartrentconnect.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/owner/razorpay")
public class OwnerPaymentController {
    
    @Autowired
    private OwnerPaymentService ownerPaymentService;
    
    @Autowired
    private OwnerRepository ownerRepository;
    
    @PostMapping("/onboard")
    public ResponseEntity<?> onboardOwner(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                   @RequestBody RazorpayOnboardingRequest request) {
        try {
            // Debug logging
            System.out.println("=== PAYMENT ONBOARDING DEBUG ===");
            System.out.println("CustomUserDetails: " + customUserDetails);
            
            User user = null;
            
            // Try to get User from CustomUserDetails
            if (customUserDetails != null) {
                user = customUserDetails.getUser();
                System.out.println("User from CustomUserDetails: " + user);
            }
            
            // Fallback to SecurityContext
            if (user == null) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                System.out.println("Authentication from context: " + authentication);
                
                if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
                    CustomUserDetails contextUserDetails = (CustomUserDetails) authentication.getPrincipal();
                    user = contextUserDetails.getUser();
                    System.out.println("User from SecurityContext: " + user);
                }
            }
            
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Authentication required: No authenticated user found"
                ));
            }
            
            // Verify authenticated user is an owner
            if (!"OWNER".equals(user.getRole().toString())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only owners can onboard for payments. Current role: " + user.getRole()
                ));
            }
            
            System.out.println("User ID: " + user.getId());
            System.out.println("User Role: " + user.getRole());
            System.out.println("Account Holder: " + request.getAccountHolderName());
            
            Map<String, Object> result = ownerPaymentService.onboardOwnerForPayments(
                user.getId(),
                request.getAccountHolderName(),
                request.getAccountNumber(),
                request.getIfsc()
            );
            
            System.out.println("Onboarding result: " + result);
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            System.out.println("Exception in onboarding: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to onboard owner: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/status")
    public ResponseEntity<?> getPaymentStatus(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        try {
            // Debug logging
            System.out.println("=== PAYMENT STATUS DEBUG ===");
            System.out.println("CustomUserDetails: " + customUserDetails);
            
            User user = null;
            
            // Try to get User from CustomUserDetails
            if (customUserDetails != null) {
                user = customUserDetails.getUser();
                System.out.println("User from CustomUserDetails: " + user);
            }
            
            // Fallback to SecurityContext
            if (user == null) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                System.out.println("Authentication from context: " + authentication);
                
                if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
                    CustomUserDetails contextUserDetails = (CustomUserDetails) authentication.getPrincipal();
                    user = contextUserDetails.getUser();
                    System.out.println("User from SecurityContext: " + user);
                }
            }
            
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Authentication required: No authenticated user found"
                ));
            }
            
            Owner owner = ownerRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("Owner not found"));
            
            boolean isPaymentEnabled = ownerPaymentService.isOwnerPaymentEnabled(user.getId());
            
            return ResponseEntity.ok(Map.of(
                "isPaymentEnabled", isPaymentEnabled,
                "razorpayAccountId", owner.getRazorpayAccountId(),
                "onboardingStatus", owner.getRazorpayOnboardingStatus()
            ));
            
        } catch (Exception e) {
            System.out.println("Exception in getPaymentStatus: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to get payment status: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuthentication(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        System.out.println("=== TEST AUTH DEBUG ===");
        System.out.println("@AuthenticationPrincipal CustomUserDetails: " + customUserDetails);
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("SecurityContext Authentication: " + authentication);
        System.out.println("Principal: " + authentication.getPrincipal());
        System.out.println("Authorities: " + authentication.getAuthorities());
        
        User user = null;
        if (customUserDetails != null) {
            user = customUserDetails.getUser();
        }
        
        return ResponseEntity.ok(Map.of(
            "message", "Authentication test",
            "authenticatedUser", user != null ? user.getUsername() : "null",
            "contextAuth", authentication != null ? authentication.getName() : "null",
            "isAuthenticated", authentication != null && authentication.isAuthenticated(),
            "userId", user != null ? user.getId() : "null",
            "userRole", user != null ? user.getRole() : "null"
        ));
    }
}
