package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.entity.*;
import com.smartrent.connect.smartrentconnect.dto.BookingPaymentDTO;
import com.smartrent.connect.smartrentconnect.repository.FlatDetailsRepository;
import com.smartrent.connect.smartrentconnect.repository.PGBedRepository;
import com.smartrent.connect.smartrentconnect.service.BookingService;
import com.smartrent.connect.smartrentconnect.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/tenant/book")
@PreAuthorize("hasAuthority('TENANT')")
@CrossOrigin(
        origins = {"http://localhost:3000", "http://127.0.0.1:3000"},
        allowCredentials = "true"
)
public class TenantBookingController {
    
    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private FlatDetailsRepository flatDetailsRepository;
    
    @Autowired
    private PGBedRepository pgBedRepository;
    
    @PostMapping("/flat/{flatDetailsId}")
    public ResponseEntity<?> bookFlat(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                  @PathVariable Long flatDetailsId,
                                  @RequestParam String moveInDate) {
        try {
            // Convert string to LocalDateTime (start of day)
            LocalDateTime moveInDateTime = LocalDateTime.parse(moveInDate + "T00:00:00");

            User user = null;
            if (customUserDetails != null) {
                user = customUserDetails.getUser();
                System.out.println("User from CustomUserDetails: " + user);
            }
            // Verify the authenticated user is a tenant
            if (!"TENANT".equals(user.getRole().toString())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only tenants can book properties"
                ));
            }
            
            // Get flat details
            FlatDetails flatDetails = flatDetailsRepository.findById(flatDetailsId)
                .orElseThrow(() -> new RuntimeException("Flat details not found"));
            
            // Validate property is approved
            if (!"APPROVED".equals(flatDetails.getProperty().getStatus().toString())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Property is not approved for booking"
                ));
            }
            
            // Create booking
            Booking booking = bookingService.createFlatBooking(user, flatDetails, moveInDateTime);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Flat booking created successfully",
                "bookingId", booking.getId(),
                "depositAmount", booking.getDepositAmount(),
                "moveInDate", booking.getMoveInDate()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to book flat: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/bed/{bedId}")
    public ResponseEntity<?> bookPgBed(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                     @PathVariable Long bedId,
                                     @RequestParam String moveInDate) {
        try {
            // Convert string to LocalDateTime (start of day)
            LocalDateTime moveInDateTime = LocalDateTime.parse(moveInDate + "T00:00:00");
            User user = null;
            if (customUserDetails != null) {
                user = customUserDetails.getUser();
                System.out.println("User from CustomUserDetails: " + user);
            }
            // Verify the authenticated user is a tenant
            if (!"TENANT".equals(user.getRole().toString())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only tenants can book properties"
                ));
            }

            // Get PG bed
            PGBed pgBed = pgBedRepository.findById(bedId)
                .orElseThrow(() -> new RuntimeException("PG bed not found"));
            
            // Validate bed is available
            if (pgBed.getIsOccupied()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "PG bed is already occupied"
                ));
            }
            
            // Validate property is approved
            if (!"APPROVED".equals(pgBed.getPgRoom().getPgDetails().getProperty().getStatus().toString())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Property is not approved for booking"
                ));
            }
            
            // Create booking
            Booking booking = bookingService.createPgBedBooking(user, pgBed, moveInDateTime);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "PG bed booking created successfully",
                "bookingId", booking.getId(),
                "depositAmount", booking.getDepositAmount(),
                "moveInDate", booking.getMoveInDate()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to book PG bed: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/my-bookings")
    public ResponseEntity<?> getMyBookings(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        try {
            User user = null;
            if (customUserDetails != null) {
                user = customUserDetails.getUser();
                System.out.println("User from CustomUserDetails: " + user);
            }
            
            var bookings = bookingService.getTenantBookings(user.getId());
            
            // Convert to DTOs to avoid circular references
            var bookingDTOs = bookings.stream()
                .map(bookingService::createTenantBookingsDTO)
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "bookings", bookingDTOs
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to get bookings: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<?> getBookingDetails(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                             @PathVariable Long bookingId) {
        try {
            User user = null;
            if (customUserDetails != null) {
                user = customUserDetails.getUser();
                System.out.println("User from CustomUserDetails: " + user);
            }
            
            // Verify the authenticated user is a tenant
            if (!"TENANT".equals(user.getRole().toString())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only tenants can view booking details"
                ));
            }
            
            // Get booking and convert to DTO
            Booking booking = bookingService.getBookingByIdAndTenant(bookingId, user.getId());
            BookingPaymentDTO bookingDTO = bookingService.createBookingPaymentDTO(booking);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "booking", bookingDTO
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @PostMapping("/cancel/{bookingId}")
    @PreAuthorize("hasAuthority('TENANT')")
    public ResponseEntity<?> cancelBooking(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                          @PathVariable Long bookingId) {
        try {
            User user = null;
            if (customUserDetails != null) {
                user = customUserDetails.getUser();
                System.out.println("User from CustomUserDetails: " + user);
                System.out.println("User role: " + user.getRole());
            } else {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "User not authenticated"
                ));
            }
            
            // Verify the authenticated user is a tenant
            if (!"TENANT".equals(user.getRole().toString())) {
                System.out.println("User role check failed: " + user.getRole().toString());
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Only tenants can cancel bookings"
                ));
            }
            
            // Cancel booking using booking service
            bookingService.cancelBooking(bookingId, user.getId());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Booking cancelled successfully"
            ));
            
        } catch (Exception e) {
            System.err.println("Cancel booking error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
