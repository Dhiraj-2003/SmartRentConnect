package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.dto.*;
import com.smartrent.connect.smartrentconnect.service.TenantPropertyService;
import com.smartrent.connect.smartrentconnect.service.TenantPropertyHistoryService;
import com.smartrent.connect.smartrentconnect.service.PaymentService;
import com.smartrent.connect.smartrentconnect.service.RazorpayService;
import com.smartrent.connect.smartrentconnect.enums.OccupancyStatus;
import com.smartrent.connect.smartrentconnect.security.CustomUserDetails;
import com.smartrent.connect.smartrentconnect.entity.TenantPropertyHistory;
import com.smartrent.connect.smartrentconnect.entity.Payment;
import com.smartrent.connect.smartrentconnect.enums.PaymentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tenant")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('TENANT')")
@CrossOrigin(
  origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, 
  allowCredentials = "true"
)
@Slf4j
public class TenantPropertyController {

    private final TenantPropertyService tenantPropertyService;
    private final TenantPropertyHistoryService tenantPropertyHistoryService;
    private final PaymentService paymentService;
    private final RazorpayService razorpayService;
    
    @Value("${razorpay.test.key}")
    private String razorpayTestKey;

    @GetMapping("/properties")
    public ResponseEntity<List<PropertyResponse>> getAllProperties() {
        List<PropertyResponse> properties = tenantPropertyService.getAllProperties();
        return ResponseEntity.ok(properties);
    }

    @GetMapping("/properties/{propertyId}")
    public ResponseEntity<PropertyResponse> getPropertyById(@PathVariable Long propertyId) {
        PropertyResponse response = tenantPropertyService.getPropertyById(propertyId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pg/{propertyId}/availability")
    public ResponseEntity<PGAvailabilityResponse> getPGAvailability(@PathVariable Long propertyId) {
        PGAvailabilityResponse response = tenantPropertyService.getPGAvailability(propertyId);
        return ResponseEntity.ok(response);
    }

    // New endpoints for tenant's current active properties
    @GetMapping("/properties/current")
    public ResponseEntity<List<TenantCurrentPropertyDTO>> getCurrentActiveProperties(Authentication authentication) {
        try {
            String username = authentication.getName();
            List<TenantCurrentPropertyDTO> properties = tenantPropertyService.getCurrentActiveProperties(username);
            return ResponseEntity.ok(properties);
        } catch (Exception e) {
            log.error("Error fetching current active properties for tenant: {}", authentication.getName(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/properties/all-history")
    public ResponseEntity<List<TenantCurrentPropertyDTO>> getAllPropertyHistory(Authentication authentication) {
        try {
            String username = authentication.getName();
            List<TenantCurrentPropertyDTO> properties = tenantPropertyService.getAllPropertyHistory(username);
            return ResponseEntity.ok(properties);
        } catch (Exception e) {
            log.error("Error fetching all property history for tenant: {}", authentication.getName(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/dashboard/data")
    public ResponseEntity<TenantDashboardDataDTO> getDashboardData(Authentication authentication) {
        try {
            String username = authentication.getName();
            TenantDashboardDataDTO dashboardData = tenantPropertyService.getDashboardData(username);
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            log.error("Error fetching dashboard data for tenant: {}", authentication.getName(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    //Rent Payment Handling :::::
    @GetMapping("/rent-payments/pending")
    public ResponseEntity<?> getPendingRentPayments(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        try {
            Long tenantId = customUserDetails.getUser().getId();
            List<TenantPropertyHistoryService.PendingRentPaymentDTO> pendingPayments = 
                    tenantPropertyHistoryService.getPendingRentPaymentsForTenant(tenantId);
            return ResponseEntity.ok(pendingPayments);
        } catch (Exception e) {
            log.error("Error fetching pending rent payments for tenant: {}", customUserDetails.getUsername(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/rent-payments/online/{historyId}")
    public ResponseEntity<?> initiateOnlineRentPayment(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                        @PathVariable Long historyId) {
        try {
            // Verify the authenticated user is a tenant
            if (!"TENANT".equals(customUserDetails.getUser().getRole().toString())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only tenants can make payments"
                ));
            }
            
            // Get TenantPropertyHistory
            TenantPropertyHistory history = tenantPropertyHistoryService.getTenantHistoryById(historyId);
            if (history == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "TenantPropertyHistory not found"
                ));
            }
            
            // Verify history belongs to authenticated tenant
            if (!history.getTenant().getId().equals(customUserDetails.getUser().getId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Property history does not belong to authenticated tenant"
                ));
            }
            
            // Calculate total amount including late fee
            LocalDate today = LocalDate.now();
            LocalDate nextDueDate = history.getNextRentDueDate();
            long daysUntilDue = java.time.temporal.ChronoUnit.DAYS.between(today, nextDueDate);
            
            double lateFee = 0;
            if (daysUntilDue < 0) {
                lateFee = Math.min(Math.abs(daysUntilDue) * 0.10 * history.getMonthlyRent(), 
                                  0.30 * history.getMonthlyRent());
            }
            double totalAmount = history.getMonthlyRent() + lateFee;
            
            // Create Razorpay order
            Map<String, Object> razorpayOrder = razorpayService.createTransferOrder(totalAmount);
            
            // Create payment record
            Payment payment = paymentService.createOnlineRentPayment(
                historyId,
                totalAmount,
                (String) razorpayOrder.get("order_id")
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Online rent payment initiated successfully",
                "razorpayOrderId", razorpayOrder.get("order_id"),
                "amount", razorpayOrder.get("amount"),
                "currency", razorpayOrder.get("currency"),
                "key", razorpayTestKey,
                "paymentId", payment.getId()
            ));
            
        } catch (Exception e) {
            log.error("Failed to initiate online rent payment: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to initiate online rent payment: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/rent-payments/cash/{historyId}")
    public ResponseEntity<?> initiateCashRentPayment(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                      @PathVariable Long historyId) {
        try {
            // Verify the authenticated user is a tenant
            if (!"TENANT".equals(customUserDetails.getUser().getRole().toString())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only tenants can make payments"
                ));
            }
            
            // Get TenantPropertyHistory
            TenantPropertyHistory history = tenantPropertyHistoryService.getTenantHistoryById(historyId);
            if (history == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "TenantPropertyHistory not found"
                ));
            }
            
            // Verify history belongs to authenticated tenant
            if (!history.getTenant().getId().equals(customUserDetails.getUser().getId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Property history does not belong to authenticated tenant"
                ));
            }
            
            // Calculate total amount including late fee
            LocalDate today = LocalDate.now();
            LocalDate nextDueDate = history.getNextRentDueDate();
            long daysUntilDue = java.time.temporal.ChronoUnit.DAYS.between(today, nextDueDate);
            
            double lateFee = 0;
            if (daysUntilDue < 0) {
                lateFee = Math.min(Math.abs(daysUntilDue) * 0.10 * history.getMonthlyRent(), 
                                  0.30 * history.getMonthlyRent());
            }
            double totalAmount = history.getMonthlyRent() + lateFee;
            
            // Create cash payment record
            Payment payment = paymentService.createCashRentPayment(historyId, totalAmount);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cash rent payment initiated successfully",
                "paymentId", payment.getId(),
                "amount", payment.getAmount()
            ));
            
        } catch (Exception e) {
            log.error("Failed to initiate cash rent payment: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to initiate cash rent payment: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/rent-payments/verify")
    public ResponseEntity<?> verifyRentPayment(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                              @RequestBody Map<String, String> request) {
        try {
            log.info("=== RENT PAYMENT VERIFICATION DEBUG ===");
            log.info("Request: {}", request);
            log.info("User: {}", customUserDetails.getUser().getId());
            
            String razorpayOrderId = request.get("razorpayOrderId");
            String razorpayPaymentId = request.get("razorpayPaymentId");
            String razorpaySignature = request.get("razorpaySignature");
            
            // Verify payment signature
            boolean isValidSignature = razorpayService.verifyPaymentSignature(
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature
            );
            
            log.info("Signature valid: {}", isValidSignature);
            
            if (!isValidSignature) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid payment signature"
                ));
            }
            
            // Get payment by razorpay order ID
            Payment payment = paymentService.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> {
                    log.info("Payment not found for order ID: {}", razorpayOrderId);
                    return new RuntimeException("Payment not found");
                });
            
            log.info("Found payment: {}", payment.getId());
            
            // Verify payment belongs to authenticated tenant
            if (!payment.getTenantPropertyHistory().getTenant().getId().equals(customUserDetails.getUser().getId())) {
                log.info("Payment tenant mismatch: {} vs {}", 
                    payment.getTenantPropertyHistory().getTenant().getId(), 
                    customUserDetails.getUser().getId());
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Payment does not belong to authenticated tenant"
                ));
            }
            
            // Update payment status
            payment.setPaymentStatus(PaymentStatus.SUCCESS);
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(razorpaySignature);
            paymentService.createPayment(payment);
            
            // Confirm rent payment
            paymentService.confirmRentPayment(payment.getId());
            
            log.info("Rent payment verified and TenantPropertyHistory updated successfully");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Rent payment verified successfully"
            ));
            
        } catch (Exception e) {
            log.error("Failed to verify rent payment: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to verify rent payment: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/rent-payments/failure")
    public ResponseEntity<?> handleRentPaymentFailure(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                     @RequestBody Map<String, String> request) {
        try {
            String razorpayOrderId = request.get("razorpayOrderId");
            String failureReason = request.get("failureReason");
            
            if (razorpayOrderId == null) {
                log.error("Missing required parameters");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Missing required parameters"
                ));
            }
            
            // Get payment by razorpay order ID
            Payment payment = paymentService.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> {
                    log.error("Payment not found for order ID: {}", razorpayOrderId);
                    return new RuntimeException("Payment not found");
                });
            
            // Verify payment belongs to authenticated tenant
            if (!payment.getTenantPropertyHistory().getTenant().getId().equals(customUserDetails.getUser().getId())) {
                log.error("Payment tenant mismatch: {} vs {}", 
                    payment.getTenantPropertyHistory().getTenant().getId(), 
                    customUserDetails.getUser().getId());
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Payment does not belong to authenticated tenant"
                ));
            }
            
            // Update payment status to FAILED
            payment.setPaymentStatus(PaymentStatus.FAILED);
            if (failureReason != null) {
                payment.setFailureReason(failureReason);
                log.info("Set failure reason: {}", failureReason);
            }
            paymentService.createPayment(payment);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Rent payment failure recorded. You can retry payment."
            ));
            
        } catch (Exception e) {
            log.error("Failed to handle rent payment failure: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to record rent payment failure: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/rent-payments/status/{historyId}")
    public ResponseEntity<?> getRentPaymentStatus(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                 @PathVariable Long historyId) {
        try {
            log.info("=== GET RENT PAYMENT STATUS DEBUG ===");
            log.info("History ID: {}", historyId);
            log.info("User: {}", customUserDetails.getUser().getId());
            
            // Get TenantPropertyHistory
            TenantPropertyHistory history = tenantPropertyHistoryService.getTenantHistoryById(historyId);
            if (history == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "TenantPropertyHistory not found"
                ));
            }
            
            // Verify history belongs to authenticated tenant
            if (!history.getTenant().getId().equals(customUserDetails.getUser().getId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Property history does not belong to authenticated tenant"
                ));
            }
            
            // Get payments for this history
            List<Payment> payments = paymentService.getPaymentsByTenantPropertyHistoryId(historyId);
            
            if (payments.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "status", "NONE",
                    "message", "No payment found for this rent"
                ));
            }
            
            // Get the most recent payment
            Payment payment = payments.get(payments.size() - 1);
            log.info("Found payment: {}", payment.getId());
            log.info("Payment status: {}", payment.getPaymentStatus());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "status", payment.getPaymentStatus().toString(),
                "paymentMethod", payment.getPaymentMethod().toString(),
                "failureReason", payment.getFailureReason(),
                "message", "Rent payment status retrieved successfully"
            ));
            
        } catch (Exception e) {
            log.error("Failed to get rent payment status: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to get rent payment status: " + e.getMessage()
            ));
        }
    }

    // DTOs for new endpoints
    @lombok.Data
    @lombok.Builder
    public static class TenantCurrentPropertyDTO {
        private Long historyId;
        private Long propertyId;
        private String propertyName;
        private String propertyType;
        private String flatNumber;
        private String bedNumber;
        private String roomNumber;
        private String address;
        private String city;
        private String state;
        private String postalCode;
        private Double monthlyRent;
        private Double depositAmount;
        private String occupancyStartDate;
        private String nextRentDueDate;
        private String lastPaidDate;
        private OccupancyStatus status;
        private String propertyImage;
        private String ownerName;
        private String ownerEmail;
        private String ownerPhone;
        private Long flatDetailsId;  // ✅ Added flat details ID
        private Long pgBedId;         // ✅ Added PG bed ID
    }

    @lombok.Data
    @lombok.Builder
    public static class TenantDashboardDataDTO {
        private List<TenantCurrentPropertyDTO> currentProperties;
        private int totalProperties;
        private int activeProperties;
        private double totalMonthlyRent;
        private double totalDepositPaid;
        private double pendingPayments;
        private int openComplaints;
        private int guestPasses;
        private List<TenantCurrentPropertyDTO> recentProperties;
    }
}
