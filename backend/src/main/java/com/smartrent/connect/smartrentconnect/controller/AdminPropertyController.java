package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.dto.PropertyResponse;
import com.smartrent.connect.smartrentconnect.dto.PropertyImageResponse;
import com.smartrent.connect.smartrentconnect.dto.PropertyDocumentResponse;
import com.smartrent.connect.smartrentconnect.service.AdminPropertyService;
import com.smartrent.connect.smartrentconnect.enums.PropertyStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/properties")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class AdminPropertyController {

    @Autowired
    private final AdminPropertyService adminPropertyService;

    @GetMapping("/pending")
    public ResponseEntity<List<PropertyResponse>> getPendingProperties() {
        List<PropertyResponse> properties = adminPropertyService.getPendingProperties();
        return ResponseEntity.ok(properties);
    }

    @GetMapping
    public ResponseEntity<List<PropertyResponse>> getAllProperties() {
        List<PropertyResponse> properties = adminPropertyService.getAllProperties();
        return ResponseEntity.ok(properties);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PropertyResponse>> getPropertiesByStatus(@PathVariable PropertyStatus status) {
        List<PropertyResponse> properties = adminPropertyService.getPropertiesByStatus(status);
        return ResponseEntity.ok(properties);
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<PropertyResponse> getPropertyById(@PathVariable Long propertyId) {
        PropertyResponse response = adminPropertyService.getPropertyById(propertyId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{propertyId}/approve")
    public ResponseEntity<PropertyResponse> approveProperty(@PathVariable Long propertyId) {
        PropertyResponse response = adminPropertyService.approveProperty(propertyId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{propertyId}/reject")
    public ResponseEntity<PropertyResponse> rejectProperty(
            @PathVariable Long propertyId,
            @RequestBody(required = false) String rejectionReason) {
        log.info("=== ADMIN PROPERTY REJECTION REQUEST ===");
        log.info("Property ID: {}", propertyId);
        log.info("Rejection reason: {}", rejectionReason);
        log.info("Request body length: {}", rejectionReason != null ? rejectionReason.length() : 0);
        
        PropertyResponse response = adminPropertyService.rejectProperty(propertyId, rejectionReason);
        
        log.info("Property rejected successfully. Response status: {}", response.getStatus());
        log.info("Rejection reason in response: {}", response.getRejectionReason());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{propertyId}/images")
    public ResponseEntity<List<PropertyImageResponse>> getPropertyImages(@PathVariable Long propertyId) {
        List<PropertyImageResponse> images = adminPropertyService.getPropertyImages(propertyId);
        return ResponseEntity.ok(images);
    }

    @GetMapping("/{propertyId}/documents")
    public ResponseEntity<List<PropertyDocumentResponse>> getPropertyDocuments(@PathVariable Long propertyId) {
        List<PropertyDocumentResponse> documents = adminPropertyService.getPropertyDocuments(propertyId);
        return ResponseEntity.ok(documents);
    }
}
