package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.service.BookingService;
import com.smartrent.connect.smartrentconnect.service.PaymentService;
import com.smartrent.connect.smartrentconnect.entity.*;
import com.smartrent.connect.smartrentconnect.enums.BookingStatus;
import com.smartrent.connect.smartrentconnect.enums.OccupancyStatus;
import com.smartrent.connect.smartrentconnect.repository.BookingRepository;
import com.smartrent.connect.smartrentconnect.repository.FlatDetailsRepository;
import com.smartrent.connect.smartrentconnect.repository.OwnerRepository;
import com.smartrent.connect.smartrentconnect.repository.PGBedRepository;
import com.smartrent.connect.smartrentconnect.repository.PGRoomRepository;
import com.smartrent.connect.smartrentconnect.repository.PaymentRepository;
import com.smartrent.connect.smartrentconnect.repository.PropertyRepository;
import com.smartrent.connect.smartrentconnect.service.TenantPropertyHistoryService;
import com.smartrent.connect.smartrentconnect.enums.PaymentStatus;
import com.smartrent.connect.smartrentconnect.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/owner/tenants")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class OwnerTenantController {

    private final TenantPropertyHistoryService tenantPropertyHistoryService;
    private final OwnerRepository ownerRepository;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final PaymentService paymentService;
    private final PGBedRepository pgBedRepository;
    private final FlatDetailsRepository flatDetailsRepository;
    private final PropertyRepository propertyRepository;
    private final PGRoomRepository pgRoomRepository;

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testAuth(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        try {
            if (customUserDetails == null) {
                return ResponseEntity.ok(Map.of("authenticated", false, "message", "No authentication"));
            }
            
            User user = customUserDetails.getUser();
            return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "username", user.getUsername(),
                "role", user.getRole(),
                "userId", user.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/pending-cash-payments")
    public ResponseEntity<?> getPendingCashPayments(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        try {
            if (customUserDetails == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            User user = customUserDetails.getUser();
            Owner owner = ownerRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Owner not found"));
            
            log.info("Fetching pending cash payments for owner: {}", owner.getFullName());
            
            // Get all pending cash payments for this owner's properties
            List<TenantDTO> pendingCashTenants = new ArrayList<>();
            
            // Find all bookings for this owner's properties
            List<Booking> ownerBookings = bookingRepository.findPendingBookingsByOwner(owner.getId());
            
            for (Booking booking : ownerBookings) {
                // Check if there's a pending cash payment for this booking
                Optional<Payment> pendingPayment = paymentRepository.findByBookingId(booking.getId())
                    .stream()
                    .filter(p -> p.getPaymentMethod().name().equals("CASH") && 
                                 p.getPaymentStatus().name().equals("PENDING"))
                    .findFirst();
                
                if (pendingPayment.isPresent()) {
                    Payment payment = pendingPayment.get();
                    // Convert booking + payment to TenantDTO
                    TenantDTO tenantDTO = convertBookingAndPaymentToDTO(booking, payment);
                    pendingCashTenants.add(tenantDTO);
                }
            }
            
            log.info("Found {} pending cash payments for owner", pendingCashTenants.size());
            return ResponseEntity.ok(pendingCashTenants);
            
        } catch (Exception e) {
            log.error("Error fetching pending cash payments", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch pending cash payments"));
        }
    }

    @GetMapping
    public ResponseEntity<List<TenantDTO>> getOwnerTenants(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        try {
            // Debug authentication
            if (customUserDetails == null) {
                log.error("CustomUserDetails is null - authentication failed");
                return ResponseEntity.status(401).build();
            }
            
            User currentUser = customUserDetails.getUser();
            log.info("Fetching tenants for owner: {}, Role: {}", currentUser.getUsername(), currentUser.getRole());
            
            // Find the owner
            Owner owner = ownerRepository.findByUsername(currentUser.getUsername())
                    .orElseThrow(() -> new RuntimeException("Owner not found: " + currentUser.getUsername()));
            
            List<TenantDTO> allTenants = new ArrayList<>();
            
            // Get existing tenant histories (active, released, etc.)
            List<TenantPropertyHistory> histories = tenantPropertyHistoryService.getTenantHistoriesByOwnerId(owner.getId());
            List<TenantDTO> historyTenants = histories.stream()
                    .map(this::convertToTenantDTO)
                    .collect(Collectors.toList());
            allTenants.addAll(historyTenants);
            
            // Get upcoming tenants from confirmed bookings
            List<Booking> confirmedBookings = bookingRepository.findByPropertyOwner(owner.getId())
                .stream()
                .filter(booking -> booking.getStatus().name().equals("CONFIRMED"))
                .filter(booking -> booking.getMoveInDate().toLocalDate().isAfter(java.time.LocalDate.now()))
                .collect(Collectors.toList());
            
            for (Booking booking : confirmedBookings) {
                // Convert confirmed booking to TenantDTO with UPCOMING status
                TenantDTO upcomingTenant = convertBookingToUpcomingTenantDTO(booking);
                allTenants.add(upcomingTenant);
            }
            
            log.info("Found {} total tenants for owner: {} ({} from histories, {} from upcoming bookings)", 
                allTenants.size(), currentUser.getUsername(), historyTenants.size(), confirmedBookings.size());
            return ResponseEntity.ok(allTenants);
        } catch (Exception e) {
            log.error("Error fetching tenants for owner", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{tenantId}/confirm-cash-payment")
    public ResponseEntity<?> confirmCashPayment(@PathVariable String tenantId) {
        try {
            // Check if this is a pending cash payment (ID starts with "pending-")
            if (tenantId.startsWith("pending-")) {
                // Extract booking ID from pending-{bookingId}
                Long bookingId = Long.parseLong(tenantId.substring(8));
                
                // Get the booking
                Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
                
                // Get the pending payment
                Optional<Payment> pendingPayment = paymentRepository.findByBookingId(bookingId)
                    .stream()
                    .filter(p -> p.getPaymentMethod().name().equals("CASH") && 
                                 p.getPaymentStatus().name().equals("PENDING"))
                    .findFirst();
                
                if (pendingPayment.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "No pending cash payment found"));
                }
                
                Payment payment = pendingPayment.get();
                
                // Update payment status to SUCCESS
                payment.setPaymentStatus(PaymentStatus.SUCCESS);
                payment.setTransactionDate(java.time.LocalDateTime.now());
                paymentRepository.save(payment);

                // Create TenantPropertyHistory from booking
                TenantPropertyHistory history = tenantPropertyHistoryService.createFromBooking(booking);
                
                // Update occupancy status
                history.setStatus(OccupancyStatus.ACTIVE);
                if(history.getLastPaidDate()==null){
                    history.setNextRentDueDate(history.getBookingDate().plusMonths(1));
                }else{
                    history.setNextRentDueDate(java.time.LocalDate.now().plusMonths(1));
                }
                history.setLastPaidDate(java.time.LocalDate.now());
                tenantPropertyHistoryService.saveTenantHistory(history);
                
                // Update booking status if needed
                booking.setStatus(BookingStatus.CONFIRMED);
                bookingRepository.save(booking);
                
                log.info("Cash payment confirmed for booking ID: {}, created TenantPropertyHistory: {}", bookingId, history.getId());
                return ResponseEntity.ok().body(Map.of("message", "Cash payment confirmed successfully"));
                
            } else {
                // Handle existing TenantPropertyHistory confirmation (original logic)
                Long historyId = Long.parseLong(tenantId);
                TenantPropertyHistory history = tenantPropertyHistoryService.getTenantHistoryById(historyId);
                if (history == null) {
                    return ResponseEntity.notFound().build();
                }

                // Update status to ACTIVE after cash payment confirmation
                history.setStatus(OccupancyStatus.ACTIVE);
                history.setLastPaidDate(LocalDate.now());
                
                // Calculate next rent due date
                LocalDate nextDue = LocalDate.now().plusMonths(1);
                history.setNextRentDueDate(nextDue);
                
                tenantPropertyHistoryService.saveTenantHistory(history);
                
                log.info("Cash payment confirmed for tenant ID: {}", historyId);
                return ResponseEntity.ok().body(Map.of("message", "Cash payment confirmed successfully"));
            }
            
        } catch (Exception e) {
            log.error("Error confirming cash payment for tenant ID: {}", tenantId, e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to confirm cash payment"));
        }
    }

    @PostMapping("/{tenantId}/reject-cash-payment")
    public ResponseEntity<?> rejectCashPayment(@PathVariable String tenantId) {
        try {
            // Check if this is a pending cash payment (ID starts with "pending-")
            if (tenantId.startsWith("pending-")) {
                // Extract booking ID from pending-{bookingId}
                Long bookingId = Long.parseLong(tenantId.substring(8));
                
                // Get the booking
                Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
                
                // Get the pending payment
                Optional<Payment> pendingPayment = paymentRepository.findByBookingId(bookingId)
                    .stream()
                    .filter(p -> p.getPaymentMethod().name().equals("CASH") && 
                                 p.getPaymentStatus().name().equals("PENDING"))
                    .findFirst();
                
                if (pendingPayment.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "No pending cash payment found"));
                }
                
                Payment payment = pendingPayment.get();
                
                // Update payment status to CANCELLED
                payment.setPaymentStatus(PaymentStatus.CANCELLED);
                paymentRepository.save(payment);
                
                // Mark property as available again
                if (booking.getFlatDetails() != null) {
                    // For flat bookings, mark flat as available
                    booking.getFlatDetails().setIsOccupied(false);
                    flatDetailsRepository.save(booking.getFlatDetails());
                    log.info("Marked flat {} as available due to rejected cash payment", booking.getFlatDetails().getId());
                } else if (booking.getPgBedId() != null) {
                    // For PG bookings, mark bed as available
                    Optional<com.smartrent.connect.smartrentconnect.entity.PGBed> pgBed = pgBedRepository.findById(booking.getPgBedId());
                    if (pgBed.isPresent()) {
                        pgBed.get().setIsOccupied(false);
                        pgBedRepository.save(pgBed.get());
                        log.info("Marked PG bed {} as available due to rejected cash payment", booking.getPgBedId());
                    }
                }
                
                // Update booking status to CANCELLED
                booking.setStatus(com.smartrent.connect.smartrentconnect.enums.BookingStatus.CANCELLED);
                bookingRepository.save(booking);
                
                // NOTE: Do NOT add cancelled booking to TenantPropertyHistory as requested
                
                log.info("Cash payment rejected for booking ID: {}, payment marked as CANCELLED, property marked as available", bookingId);
                return ResponseEntity.ok().body(Map.of("message", "Cash payment rejected successfully"));
                
            } else {
                // Handle existing TenantPropertyHistory rejection (original logic)
                Long historyId = Long.parseLong(tenantId);
                TenantPropertyHistory history = tenantPropertyHistoryService.getTenantHistoryById(historyId);
                if (history == null) {
                    return ResponseEntity.notFound().build();
                }

                // Mark as cancelled
                history.setStatus(OccupancyStatus.CANCELLED);
                history.setReleaseDate(LocalDate.now());
                history.setReleaseReason("Cash payment rejected by owner");
                history.setIsActive(false);
                
                tenantPropertyHistoryService.saveTenantHistory(history);
                
                log.info("Cash payment rejected for tenant ID: {}", historyId);
                return ResponseEntity.ok().body(Map.of("message", "Cash payment rejected"));
            }
            
        } catch (Exception e) {
            log.error("Error rejecting cash payment for tenant ID: {}", tenantId, e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to reject cash payment"));
        }
    }

    @PostMapping("/{tenantId}/mark-vacated")
    public ResponseEntity<?> markTenantVacated(@PathVariable Long tenantId) {
        try {
            TenantPropertyHistory history = tenantPropertyHistoryService.getTenantHistoryById(tenantId);
            if (history == null) {
                return ResponseEntity.notFound().build();
            }

            // Mark tenant as vacated
            history.setStatus(OccupancyStatus.RELEASED);
            history.setReleaseDate(LocalDate.now());
            history.setReleaseReason("Tenant vacated");
            history.setIsActive(false);
            
            // Update property availability (you'll need to implement this in respective services)
            if (history.getFlatDetails() != null) {
                // Mark flat as available
                history.getFlatDetails().setIsOccupied(false);
                flatDetailsRepository.save(history.getFlatDetails());
                log.info("Marking flat {} as available", history.getFlatDetails().getId());

            } else if (history.getPgBed() != null) {
                // Mark PG bed as available
                history.getPgBed().setIsOccupied(false);
                pgBedRepository.save(history.getPgBed());
                log.info("Marking PG bed {} as available", history.getPgBed().getId());
            }
            
            tenantPropertyHistoryService.saveTenantHistory(history);
            
            log.info("Tenant {} marked as vacated", tenantId);
            return ResponseEntity.ok().body(Map.of("message", "Tenant marked as vacated successfully"));
        } catch (Exception e) {
            log.error("Error marking tenant as vacated for tenant ID: {}", tenantId, e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to mark tenant as vacated"));
        }
    }

    // Helper method to convert Booking + Payment to TenantDTO for pending cash confirmations
    private TenantDTO convertBookingAndPaymentToDTO(Booking booking, Payment payment) {
        String roomNumber = null;
        String unit = null;
        
        // Get room and bed/flat number
        if (booking.getFlatDetails() != null) {
            unit = booking.getFlatDetails().getFlatNumber();
        } else if (booking.getPgBedId() != null) {
            // Fetch PG bed to get bed and room numbers
            PGBed pgBed = pgBedRepository.findById(booking.getPgBedId()).orElse(null);
            if (pgBed != null && pgBed.getPgRoom() != null) {
                unit = pgBed.getBedNumber();
                roomNumber = pgBed.getPgRoom().getRoomNumber();
            }
        }

        return TenantDTO.builder()
                .id("pending-" + booking.getId().toString()) // Special ID for pending payments
                .tenantId(booking.getTenant().getId().toString())
                .fullName(booking.getTenant().getUsername())
                .email(booking.getTenant().getEmail())
                .phoneNumber(((Tenant) booking.getTenant()).getPhoneNumber())
                .profileImage(booking.getTenant().getProfileImage())
                .propertyName(propertyRepository.getReferenceById(booking.getPropertyId()).getTitle())
                .propertyType(booking.getFlatDetails() != null ? "FLAT" : "PG")
                .flatNumber(booking.getFlatDetails() != null ? booking.getFlatDetails().getFlatNumber() : null)
                .bedNumber(booking.getPgBedId() != null ? unit : null)
                .roomNumber(roomNumber)
                .bookingDate(booking.getBookingDate().toLocalDate().toString())
                .occupancyStartDate(booking.getMoveInDate().toLocalDate().toString())
                .depositAmount(propertyRepository.findById(booking.getPropertyId()).get().getDeposit())
                .monthlyRent(booking.getFlatDetails() != null ? 
                    booking.getFlatDetails().getRentPerMonth() : pgRoomRepository.findByPropertyId(booking.getPropertyId()).getFirst().getPricePerBed())
                .lastPaidDate(null)
                .nextRentDueDate(null)
                .paymentMode("CASH")
                .status("PENDING_CASH")
                .releaseDate(null)
                .releaseReason(null)
                .paymentMethod(payment.getPaymentMethod().name())
                .paymentStatus(payment.getPaymentStatus().name())
                .bookingId(booking.getId())
                .bookingStatus(booking.getStatus().name())
                .bookingBookingDate(booking.getBookingDate().toString())
                .bookingMoveInDate(booking.getMoveInDate().toString())
                .build();
    }
    private TenantDTO convertToTenantDTO(TenantPropertyHistory history) {
        String roomNumber = null;
        // Get room number for PG bookings
        if (history.getPgBed() != null && history.getPgBed().getPgRoom() != null) {
            roomNumber = history.getPgBed().getPgRoom().getRoomNumber();
        }
        
        return TenantDTO.builder()
                .id(history.getId().toString())
                .tenantId(history.getTenant().getId().toString())
                .fullName(history.getTenant().getFullName())
                .email(history.getTenant().getEmail())
                .phoneNumber(history.getTenant().getPhoneNumber())
                .profileImage(history.getTenant().getProfileImage())
                .propertyName(history.getProperty().getTitle())
                .propertyType(history.getBookingType().name())
                .flatNumber(history.getFlatDetails() != null ? history.getFlatDetails().getFlatNumber() : null)
                .bedNumber(history.getPgBed() != null ? history.getPgBed().getBedNumber() : null)
                .roomNumber(roomNumber)
                .bookingDate(history.getBookingDate().toString())
                .occupancyStartDate(history.getOccupancyStartDate().toString())
                .status(history.getStatus().name())
                .depositAmount(history.getDepositAmount())
                .monthlyRent(history.getMonthlyRent())
                .lastPaidDate(history.getLastPaidDate() != null ? history.getLastPaidDate().toString() : null)
                .nextRentDueDate(history.getNextRentDueDate() != null ? history.getNextRentDueDate().toString() : null)
                .paymentMode(history.getPaymentModePreference() != null ? history.getPaymentModePreference().name() : "ONLINE")
                .releaseDate(history.getReleaseDate() != null ? history.getReleaseDate().toString() : null)
                .releaseReason(history.getReleaseReason())
                .build();
    }

    // Helper method to convert Booking to TenantDTO for upcoming move-ins
    private TenantDTO convertBookingToUpcomingTenantDTO(Booking booking) {
        String roomNumber = null;
        String unit = null;
        
        // Get room and bed/flat number
        if (booking.getFlatDetails() != null) {
            unit = booking.getFlatDetails().getFlatNumber();
        } else if (booking.getPgBedId() != null) {
            // Fetch PG bed to get bed and room numbers
            PGBed pgBed = pgBedRepository.findById(booking.getPgBedId()).orElse(null);
            if (pgBed != null && pgBed.getPgRoom() != null) {
                unit = pgBed.getBedNumber();
                roomNumber = pgBed.getPgRoom().getRoomNumber();
            }
        }

        return TenantDTO.builder()
                .id("upcoming-" + booking.getId().toString()) // Special ID for upcoming tenants
                .tenantId(booking.getTenant().getId().toString())
                .fullName(booking.getTenant().getUsername())
                .email(booking.getTenant().getEmail())
                .phoneNumber(((Tenant) booking.getTenant()).getPhoneNumber())
                .profileImage(booking.getTenant().getProfileImage())
                .propertyName(propertyRepository.getReferenceById(booking.getPropertyId()).getTitle())
                .propertyType(booking.getFlatDetails() != null ? "FLAT" : "PG")
                .flatNumber(booking.getFlatDetails() != null ? booking.getFlatDetails().getFlatNumber() : null)
                .bedNumber(booking.getPgBedId() != null ? unit : null)
                .roomNumber(roomNumber)
                .bookingDate(booking.getBookingDate().toLocalDate().toString())
                .occupancyStartDate(booking.getMoveInDate().toLocalDate().toString())
                .status("UPCOMING")
                .depositAmount(propertyRepository.findById(booking.getPropertyId()).get().getDeposit())
                .monthlyRent(booking.getFlatDetails() != null ? 
                    booking.getFlatDetails().getRentPerMonth() : pgRoomRepository.findByPropertyId(booking.getPropertyId()).getFirst().getPricePerBed())
                .lastPaidDate(null)
                .nextRentDueDate(null)
                .paymentMode("ONLINE") // Default for upcoming tenants
                .releaseDate(null)
                .releaseReason(null)
                .build();
    }

    // DTO for frontend
    @lombok.Builder
    @lombok.Data
    public static class TenantDTO {
        private String id;
        private String tenantId;
        private String fullName;
        private String email;
        private String phoneNumber;
        private String profileImage;
        private String propertyName;
        private String propertyType;
        private String flatNumber;
        private String bedNumber;
        private String roomNumber;
        private String bookingDate;
        private String occupancyStartDate;
        private String status;
        private Double depositAmount;
        private Double monthlyRent;
        private String lastPaidDate;
        private String nextRentDueDate;
        private String paymentMode;
        private String releaseDate;
        private String releaseReason;
        
        // Payment information for pending cash confirmations
        private String paymentMethod;
        private String paymentStatus;
        
        // Booking information for pending cash confirmations
        private Long bookingId;
        private String bookingStatus;
        private String bookingBookingDate;
        private String bookingMoveInDate;
    }
}
