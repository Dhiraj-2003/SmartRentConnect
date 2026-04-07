package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.dto.PaymentVerificationRequest;
import com.smartrent.connect.smartrentconnect.entity.Booking;
import com.smartrent.connect.smartrentconnect.enums.BookingStatus;
import com.smartrent.connect.smartrentconnect.entity.Payment;
import com.smartrent.connect.smartrentconnect.enums.PaymentStatus;
import com.smartrent.connect.smartrentconnect.repository.BookingRepository;
import com.smartrent.connect.smartrentconnect.repository.OwnerRepository;
import com.smartrent.connect.smartrentconnect.service.BookingService;
import com.smartrent.connect.smartrentconnect.service.PaymentService;
import com.smartrent.connect.smartrentconnect.service.RazorpayService;
import com.smartrent.connect.smartrentconnect.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tenant/payment")
public class TenantPaymentController {
    
    @Value("${razorpay.test.key}")
    private String razorpayTestKey;
    
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private OwnerRepository ownerRepository;
    
    @Autowired
    private RazorpayService razorpayService;
    
    @Autowired
    private BookingService bookingService;
    
    @PostMapping("/online/{bookingId}")
    public ResponseEntity<?> initiateOnlinePayment(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                           @PathVariable Long bookingId) {
        try {
            // Verify the authenticated user is a tenant
            if (!"TENANT".equals(customUserDetails.getUser().getRole().toString())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only tenants can make payments"
                ));
            }
            
            // Get booking
            Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Verify booking belongs to authenticated tenant
            if (!booking.getTenant().getId().equals(customUserDetails.getUser().getId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Booking does not belong to authenticated tenant"
                ));
            }
            
            // Verify booking is pending
            if (!BookingStatus.PENDING.equals(booking.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Booking is not in pending status"
                ));
            }
            
            // Create Razorpay order with 5-minute expiry
            Map<String, Object> razorpayOrder = razorpayService.createTransferOrder(
                booking.getDepositAmount()
            );
            
            // Create payment record
            Payment payment = paymentService.createOnlinePayment(
                bookingId,
                booking.getDepositAmount(),
                (String) razorpayOrder.get("order_id")
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Online payment initiated successfully",
                "razorpayOrderId", razorpayOrder.get("order_id"),
                "amount", razorpayOrder.get("amount"),
                "currency", razorpayOrder.get("currency"),
                "key", razorpayTestKey, // Use the field directly
                "paymentId", payment.getId()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to initiate online payment: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/failure")
    public ResponseEntity<?> handlePaymentFailure(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                          @RequestBody Map<String, String> request) {
        try {
            
            String razorpayOrderId = request.get("razorpayOrderId");
            String bookingId = request.get("bookingId");
            String failureReason = request.get("failureReason");
            
            if (razorpayOrderId == null || bookingId == null) {
                System.out.println("Missing required parameters");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Missing required parameters"
                ));
            }
            
            // Get payment by razorpay order ID
            Payment payment = paymentService.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> {
                    System.out.println("Payment not found for order ID: " + razorpayOrderId);
                    return new RuntimeException("Payment not found");
                });

            
            // Verify payment belongs to authenticated tenant
            if (!payment.getBooking().getTenant().getId().equals(customUserDetails.getUser().getId())) {
                System.out.println("Payment tenant mismatch: " + payment.getBooking().getTenant().getId() + " vs " + customUserDetails.getUser().getId());
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Payment does not belong to authenticated tenant"
                ));
            }
            
            // Update payment status to FAILED
            payment.setPaymentStatus(PaymentStatus.FAILED);
            if (failureReason != null) {
                payment.setFailureReason(failureReason);
                System.out.println("Set failure reason: " + failureReason);
            }
            paymentService.createPayment(payment);
            
            // Keep booking as PENDING - user can retry payment
            Optional<Booking> booking = bookingRepository.findById(payment.getBooking().getId());
            booking.get().setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking.get());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment failure recorded. You can retry payment."
            ));
            
        } catch (Exception e) {
            System.err.println("Failed to handle payment failure: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to record payment failure: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/status/{bookingId}")
    public ResponseEntity<?> getPaymentStatus(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                            @PathVariable Long bookingId) {
        try {
            System.out.println("=== GET PAYMENT STATUS DEBUG ===");
            System.out.println("Booking ID: " + bookingId);
            System.out.println("User: " + customUserDetails.getUser().getId());
            
            // Get booking
            Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Verify booking belongs to authenticated tenant
            if (!booking.getTenant().getId().equals(customUserDetails.getUser().getId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Booking does not belong to authenticated tenant"
                ));
            }
            
            // Get payment for this booking
            List<Payment> payments = paymentService.getPaymentsByBookingId(bookingId);
            
            if (payments.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "status", "NONE",
                    "message", "No payment found for this booking"
                ));
            }
            
            // Get the most recent payment
            Payment payment = payments.get(payments.size() - 1);
            System.out.println("Found payment: " + payment.getId());
            System.out.println("Payment status: " + payment.getPaymentStatus());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "status", payment.getPaymentStatus().toString(),
                "paymentMethod", payment.getPaymentMethod().toString(),
                "failureReason", payment.getFailureReason(),
                "message", "Payment status retrieved successfully"
            ));
            
        } catch (Exception e) {
            System.err.println("Failed to get payment status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to get payment status: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                      @RequestBody PaymentVerificationRequest request) {
        try {
            System.out.println("=== PAYMENT VERIFICATION DEBUG ===");
            System.out.println("Request: " + request);
            System.out.println("User: " + customUserDetails.getUser().getId());
            
            // Verify payment signature
            boolean isValidSignature = razorpayService.verifyPaymentSignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
            );
            
            System.out.println("Signature valid: " + isValidSignature);
            
            if (!isValidSignature) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid payment signature"
                ));
            }
            
            // Get payment by razorpay order ID
            Payment payment = paymentService.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> {
                    System.out.println("Payment not found for order ID: " + request.getRazorpayOrderId());
                    return new RuntimeException("Payment not found");
                });
            
            System.out.println("Found payment: " + payment.getId());
            
            // Verify payment belongs to authenticated tenant
            if (!payment.getBooking().getTenant().getId().equals(customUserDetails.getUser().getId())) {
                System.out.println("Payment tenant mismatch: " + payment.getBooking().getTenant().getId() + " vs " + customUserDetails.getUser().getId());
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Payment does not belong to authenticated tenant"
                ));
            }
            
            // Update payment status
            payment.setPaymentStatus(PaymentStatus.SUCCESS);
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            paymentService.createPayment(payment);
            
            // Confirm booking
            bookingService.confirmBooking(payment.getBooking().getId());
            
            System.out.println("Payment verified and booking confirmed successfully");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment verified and booking confirmed successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to verify payment: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/cash/{bookingId}")
    public ResponseEntity<?> initiateCashPayment(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                          @PathVariable Long bookingId) {
        try {
            // Verify the authenticated user is a tenant
            if (!"TENANT".equals(customUserDetails.getUser().getRole().toString())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only tenants can make payments"
                ));
            }
            
            // Get booking
            Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Verify booking belongs to authenticated tenant
            if (!booking.getTenant().getId().equals(customUserDetails.getUser().getId())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Booking does not belong to authenticated tenant"
                ));
            }
            
            // Create cash payment record
            Payment payment = paymentService.createCashPayment(
                bookingId,
                booking.getDepositAmount()
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cash payment initiated successfully",
                "paymentId", payment.getId(),
                "amount", payment.getAmount()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to initiate cash payment: " + e.getMessage()
            ));
        }
    }
}
