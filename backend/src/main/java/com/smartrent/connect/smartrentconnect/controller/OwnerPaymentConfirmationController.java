package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.entity.Booking;
import com.smartrent.connect.smartrentconnect.entity.Payment;
import com.smartrent.connect.smartrentconnect.entity.Property;
import com.smartrent.connect.smartrentconnect.enums.PaymentStatus;
import com.smartrent.connect.smartrentconnect.entity.User;
import com.smartrent.connect.smartrentconnect.repository.PaymentRepository;
import com.smartrent.connect.smartrentconnect.service.BookingService;
import com.smartrent.connect.smartrentconnect.service.PaymentService;
import com.smartrent.connect.smartrentconnect.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/owner/payment")
public class OwnerPaymentConfirmationController {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PropertyRepository propertyRepository;
    
    @PutMapping("/{paymentId}/confirm")
    public ResponseEntity<?> confirmCashPayment(@AuthenticationPrincipal User authenticatedUser,
                                          @PathVariable Long paymentId) {
        try {
            // Verify the authenticated user is an owner
            if (!"OWNER".equals(authenticatedUser.getRole().toString())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only owners can confirm payments"
                ));
            }
            
            // Get payment
            Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));


            Booking booking = payment.getBooking();
            
            // Verify payment is pending
            if (!PaymentStatus.PENDING.equals(payment.getPaymentStatus())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Payment is not in pending status"
                ));
            }
            
            // Confirm payment
            paymentService.confirmPayment(paymentId);
            
            // Confirm booking
            bookingService.confirmBooking(booking.getId());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cash payment confirmed and booking confirmed successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to confirm payment: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/my-payments")
    public ResponseEntity<?> getMyPayments(@AuthenticationPrincipal User authenticatedUser) {
        try {
            List<Property> properties = propertyRepository.findByOwnerId(authenticatedUser.getId());
            // Get all payments for bookings of owner's properties
            List<Payment> payments = paymentRepository.findAll().stream()
                .filter(payment -> payment.getBooking().getPropertyId().equals(properties))
                .toList();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "payments", payments
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to get payments: " + e.getMessage()
            ));
        }
    }
}
