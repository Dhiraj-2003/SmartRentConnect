package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.dto.*;
import com.smartrent.connect.smartrentconnect.Service.TenantPropertyService;
import com.smartrent.connect.smartrentconnect.enums.PropertyType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenant")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('TENANT')")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class TenantPropertyController {

    private final TenantPropertyService tenantPropertyService;

    @GetMapping("/properties")
    public ResponseEntity<List<PropertyResponse>> getApprovedProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) PropertyType propertyType,
            @RequestParam(required = false) Double minDeposit,
            @RequestParam(required = false) Double maxDeposit) {
        List<PropertyResponse> properties = tenantPropertyService.getApprovedProperties(
                city, propertyType, minDeposit, maxDeposit);
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

    @PostMapping("/book/flat/{propertyId}")
    public ResponseEntity<BookingResponse> bookFlat(
            @PathVariable Long propertyId,
            Authentication authentication) {
        BookingResponse response = tenantPropertyService.bookFlat(propertyId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/book/bed/{propertyId}/{roomId}/{bedId}")
    public ResponseEntity<BookingResponse> bookBed(
            @PathVariable Long propertyId,
            @PathVariable Long roomId,
            @PathVariable Long bedId,
            Authentication authentication) {
        BookingResponse response = tenantPropertyService.bookBed(propertyId, roomId, bedId, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
