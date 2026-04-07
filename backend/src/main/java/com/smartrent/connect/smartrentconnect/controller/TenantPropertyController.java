package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.dto.*;
import com.smartrent.connect.smartrentconnect.service.TenantPropertyService;
import com.smartrent.connect.smartrentconnect.enums.OccupancyStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        private int pendingPayments;
        private int openComplaints;
        private int guestPasses;
        private List<TenantCurrentPropertyDTO> recentProperties;
    }
}
