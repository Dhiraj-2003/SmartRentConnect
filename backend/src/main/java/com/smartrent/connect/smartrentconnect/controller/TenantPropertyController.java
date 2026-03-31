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
@CrossOrigin(
  origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, 
  allowCredentials = "true"
)
public class TenantPropertyController {

    private final TenantPropertyService tenantPropertyService;

    @GetMapping("/dashboard")
    public ResponseEntity<String> getTenantDashboard(Authentication authentication) {
        String username = authentication.getName();
        String dashboardMessage = tenantPropertyService.getTenantDashboard(username);
        return ResponseEntity.ok(dashboardMessage);
    }

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

}
