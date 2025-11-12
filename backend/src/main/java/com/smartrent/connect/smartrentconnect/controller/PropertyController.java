package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.dto.PropertyRequest;
import com.smartrent.connect.smartrentconnect.dto.PropertyResponse;
import com.smartrent.connect.smartrentconnect.Service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class PropertyController {

    private final PropertyService propertyService;

    // =============== CREATE PROPERTY (OWNER ONLY) ===============
    @PostMapping
    @PreAuthorize("hasAuthority('OWNER')")
    public ResponseEntity<PropertyResponse> createProperty(
            @Validated @RequestBody PropertyRequest request,
            Authentication authentication) {
        PropertyResponse response = propertyService.createProperty(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =============== UPDATE PROPERTY (OWNER ONLY) ===============
    @PutMapping("/{propertyId}")
    @PreAuthorize("hasAuthority('OWNER')")
    public ResponseEntity<PropertyResponse> updateProperty(
            @PathVariable Long propertyId,
            @Validated @RequestBody PropertyRequest request,
            Authentication authentication) {
        PropertyResponse response = propertyService.updateProperty(propertyId, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    // =============== DELETE PROPERTY (OWNER ONLY) ===============
    @DeleteMapping("/{propertyId}")
    @PreAuthorize("hasAuthority('OWNER')")
    public ResponseEntity<Void> deleteProperty(
            @PathVariable Long propertyId,
            Authentication authentication) {
        propertyService.deleteProperty(propertyId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    // =============== GET PROPERTY BY ID (ALL AUTHENTICATED USERS) ===============
    @GetMapping("/{propertyId}")
    public ResponseEntity<PropertyResponse> getPropertyById(@PathVariable Long propertyId) {
        PropertyResponse response = propertyService.getPropertyById(propertyId);
        return ResponseEntity.ok(response);
    }

    // =============== GET ALL AVAILABLE PROPERTIES (ALL AUTHENTICATED USERS) ===============
    @GetMapping
    public ResponseEntity<List<PropertyResponse>> getAllAvailableProperties() {
        List<PropertyResponse> properties = propertyService.getAllAvailableProperties();
        return ResponseEntity.ok(properties);
    }

    // =============== GET PROPERTIES BY OWNER (OWNER ONLY) ===============
    @GetMapping("/my-properties")
    @PreAuthorize("hasAuthority('OWNER')")
    public ResponseEntity<List<PropertyResponse>> getMyProperties(Authentication authentication) {
        List<PropertyResponse> properties = propertyService.getPropertiesByOwner(authentication.getName());
        return ResponseEntity.ok(properties);
    }

    // =============== SEARCH PROPERTIES WITH FILTERS (ALL AUTHENTICATED USERS) ===============
    @GetMapping("/search")
    public ResponseEntity<List<PropertyResponse>> searchProperties(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double minRent,
            @RequestParam(required = false) Double maxRent,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) Integer bathrooms,
            @RequestParam(required = false) Double minArea,
            @RequestParam(required = false) Double maxArea,
            @RequestParam(required = false) String amenities,
            @RequestParam(defaultValue = "rent") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        List<PropertyResponse> properties = propertyService.searchPropertiesAdvanced(
            location, minRent, maxRent, minRating, bedrooms, bathrooms, 
            minArea, maxArea, amenities, sortBy, sortDir);
        return ResponseEntity.ok(properties);
    }
}
