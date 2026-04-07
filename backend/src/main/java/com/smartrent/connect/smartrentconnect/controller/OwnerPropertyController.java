package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.service.PropertyMediaService;
import com.smartrent.connect.smartrentconnect.dto.*;
import com.smartrent.connect.smartrentconnect.service.OwnerPropertyService;
import com.smartrent.connect.smartrentconnect.entity.Property;
import com.smartrent.connect.smartrentconnect.enums.DocumentType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/owner/property")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('OWNER')")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class OwnerPropertyController {

    private final OwnerPropertyService ownerPropertyService;
    private final PropertyMediaService propertyMediaService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PropertyResponse> createProperty(
            @RequestParam("property") String propertyJson,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "documentFiles", required = false) List<MultipartFile> documentFiles,
            @RequestParam(value = "documentTypes", required = false) List<String> documentTypes,
            Authentication authentication) throws Exception {
        
        // Parse property JSON
        ObjectMapper objectMapper = new ObjectMapper();
        PropertyCreateRequest request = objectMapper.readValue(propertyJson, PropertyCreateRequest.class);
        
        // Set images
        request.setImages(images);
        
        // Create document requests
        if (documentFiles != null && documentTypes != null) {
            List<PropertyDocumentUploadRequest> documents = new ArrayList<>();
            for (int i = 0; i < Math.min(documentFiles.size(), documentTypes.size()); i++) {
                PropertyDocumentUploadRequest doc = new PropertyDocumentUploadRequest();
                doc.setFile(documentFiles.get(i));
                doc.setDocumentType(DocumentType.valueOf(documentTypes.get(i)));
                documents.add(doc);
            }
            request.setDocuments(documents);
        }
        
        PropertyResponse response = ownerPropertyService.createProperty(request, authentication.getName());
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("")
    public ResponseEntity<List<PropertyResponse>> getOwnerProperties(Authentication authentication) {
        List<PropertyResponse> properties = ownerPropertyService.getOwnerProperties(authentication.getName());
        return ResponseEntity.ok(properties);
    }

    @GetMapping("/{propertyId}/images")
    public ResponseEntity<List<PropertyImageResponse>> getPropertyImages(
            @PathVariable Long propertyId) {
        try {
            // Validate property ownership
            Property property = validatePropertyOwnership(propertyId);

            List<PropertyImageResponse> images = propertyMediaService.getPropertyImages(propertyId);
            return ResponseEntity.ok(images);

        } catch (Exception e) {
            log.error("Error fetching property images: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{propertyId}/documents")
    public ResponseEntity<List<PropertyDocumentResponse>> getPropertyDocuments(
            @PathVariable Long propertyId) {
        try {
            // Validate property ownership
            Property property = validatePropertyOwnership(propertyId);

            List<PropertyDocumentResponse> documents = propertyMediaService.getPropertyDocuments(propertyId);
            return ResponseEntity.ok(documents);

        } catch (Exception e) {
            log.error("Error fetching property documents: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @GetMapping("/{propertyId}")
    public ResponseEntity<PropertyResponse> getPropertyById(
            @PathVariable Long propertyId,
            Authentication authentication) {
        PropertyResponse response = ownerPropertyService.getPropertyById(propertyId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{propertyId}/submit")
    public ResponseEntity<Void> submitPropertyForVerification(
            @PathVariable Long propertyId,
            Authentication authentication) {
        ownerPropertyService.submitPropertyForVerification(propertyId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    // PG Room Management
    @PostMapping("/{propertyId}/rooms")
    public ResponseEntity<PGRoomResponse> addPGRoom(
            @PathVariable Long propertyId,
            @Valid @RequestBody PGRoomRequest request,
            Authentication authentication) {
        PGRoomResponse response = ownerPropertyService.addPGRoom(propertyId, request, authentication.getName());
        return ResponseEntity.status(201).body(response);
    }

    @DeleteMapping("/{propertyId}/rooms/{roomId}")
    public ResponseEntity<Void> deletePGRoom(
            @PathVariable Long propertyId,
            @PathVariable Long roomId,
            Authentication authentication) {
        ownerPropertyService.deletePGRoom(propertyId, roomId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    private Property validatePropertyOwnership(Long propertyId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userName = auth.getName();
        
        log.info("Validating ownership for property ID: {} and user: {}", propertyId, userName);
        
        Property property = ownerPropertyService.getPropertyEntityById(propertyId, userName);
        if (property == null) {
            log.error("Property not found with ID: {}", propertyId);
            throw new RuntimeException("Property not found with ID: " + propertyId);
        }

        log.info("Property found: {}, Owner email: {}, User email: {}", 
            property.getId(), property.getOwner().getEmail(), userName);
        
        if (!property.getOwner().getUsername().equals(userName)) {
            log.error("Ownership validation failed. Property owner: {}, User: {}", 
                property.getOwner().getUsername(), userName);
            throw new RuntimeException("Access denied: You don't own this property");
        }

        log.info("Ownership validation successful for property ID: {}", propertyId);
        return property;
    }
}
