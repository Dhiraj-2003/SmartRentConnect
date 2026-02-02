package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.dto.OwnerProfileResponseDTO;
import com.smartrent.connect.smartrentconnect.dto.OwnerProfileUpdateDTO;
import com.smartrent.connect.smartrentconnect.dto.PropertyRequest;
import com.smartrent.connect.smartrentconnect.dto.PropertyResponse;
import com.smartrent.connect.smartrentconnect.Service.OwnerService;
import com.smartrent.connect.smartrentconnect.Service.PropertyService;
import com.smartrent.connect.smartrentconnect.Service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
@PreAuthorize("hasAuthority('OWNER')")
public class OwnerController {

    private final OwnerService ownerService;
    private final PropertyService propertyService;
    private final FileStorageService fileStorageService;

    // =============== PROFILE MANAGEMENT ===============
    
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            OwnerProfileResponseDTO profile = ownerService.getProfile();
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to load profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Validated @RequestBody OwnerProfileUpdateDTO profileDTO) {
        try {
            OwnerProfileResponseDTO updatedProfile = ownerService.updateProfile(profileDTO);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to update profile: " + e.getMessage()));
        }
    }

    @PostMapping("/profile/with-urls")
    public ResponseEntity<?> updateProfileWithUrls(
            @RequestParam("fullName") String fullName,
            @RequestParam("phone") String phone,
            @RequestParam("address") String address,
            @RequestParam("city") String city,
            @RequestParam("state") String state,
            @RequestParam("pincode") String pincode,
            @RequestParam("dateOfBirth") String dateOfBirth,
            @RequestParam(value = "profileImageUrl", required = false) String profileImageUrl,
            @RequestParam(value = "aadharCardUrl", required = false) String aadharCardUrl,
            @RequestParam(value = "panCardUrl", required = false) String panCardUrl) {
        
        try {
            OwnerProfileUpdateDTO profileDTO = new OwnerProfileUpdateDTO();
            profileDTO.setFullName(fullName);
            profileDTO.setPhone(phone);
            profileDTO.setAddress(address);
            profileDTO.setCity(city);
            profileDTO.setState(state);
            profileDTO.setPincode(pincode);
            profileDTO.setDateOfBirth(dateOfBirth);
            profileDTO.setProfileImageUrl(profileImageUrl);
            profileDTO.setAadharCardUrl(aadharCardUrl);
            profileDTO.setPanCardUrl(panCardUrl);

            OwnerProfileResponseDTO updatedProfile = ownerService.updateProfile(profileDTO);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to update profile with URLs: " + e.getMessage()));
        }
    }

    // =============== DASHBOARD & STATS ===============
    
    @GetMapping("/dashboard")
    public ResponseEntity<String> getDashboard() {
        // This can be expanded to return actual dashboard stats
        return ResponseEntity.ok("Owner Dashboard - Profile management and property operations");
    }

    // =============== PROPERTY MANAGEMENT ===============
    
    @GetMapping("/properties")
    public ResponseEntity<List<PropertyResponse>> getMyProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication) {
        try {
            List<PropertyResponse> properties = propertyService.getPropertiesByOwner(authentication.getName());
            return ResponseEntity.ok(properties);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/properties")
    public ResponseEntity<PropertyResponse> createProperty(
            @Validated @RequestBody PropertyRequest request,
            Authentication authentication) {
        try {
            PropertyResponse response = propertyService.createProperty(request, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/properties/with-images")
public ResponseEntity<?> createPropertyWithImages(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("propertyType") String propertyType,
            @RequestParam("location") String location,
            @RequestParam("city") String city,
            @RequestParam("state") String state,
            @RequestParam("pincode") String pincode,
            @RequestParam("rent") String rent,
            @RequestParam(value = "bedrooms", required = false) String bedrooms,
            @RequestParam("bathrooms") String bathrooms,
            @RequestParam(value = "area", required = false) String area,
            @RequestParam("amenities") String amenities,
            @RequestParam(value = "sharingTypes", required = false) String sharingTypes,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            Authentication authentication) {
        try {
            // Get current owner username
            String ownerUsername = authentication.getName();
            
            // Store property images and get URLs
            List<String> imageUrls = new ArrayList<>();
            if (images != null && !images.isEmpty()) {
                imageUrls = fileStorageService.storePropertyImages(images, ownerUsername, title);
            }
            
            // Build PropertyRequest from FormData parameters
            PropertyRequest.PropertyRequestBuilder builder = PropertyRequest.builder()
                    .title(title)
                    .description(description)
                    .propertyType(propertyType)
                    .location(location)
                    .city(city)
                    .state(state)
                    .pincode(pincode)
                    .rent(Double.parseDouble(rent))
                    .bathrooms(Integer.parseInt(bathrooms))
                    .amenities(amenities)
                    .images(fileStorageService.convertImageUrlsToJson(imageUrls))
                    .available(false);
            
            // Add optional fields
            if (bedrooms != null && !bedrooms.isEmpty()) {
                builder.bedrooms(Integer.parseInt(bedrooms));
            }
            if (area != null && !area.isEmpty()) {
                builder.area(Double.parseDouble(area));
            }
            if (sharingTypes != null && !sharingTypes.isEmpty()) {
                builder.sharingTypes(sharingTypes);
            }
            
            PropertyRequest request = builder.build();
            PropertyResponse response = propertyService.createProperty(request, ownerUsername);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                        "property", response,
                        "message", "Property created successfully with " + imageUrls.size() + " images",
                        "imageUrls", imageUrls
                    ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to create property: " + e.getMessage()));
        }
    }

    @GetMapping("/properties/{propertyId}")
    public ResponseEntity<PropertyResponse> getProperty(
            @PathVariable Long propertyId,
            Authentication authentication) {
        try {
            PropertyResponse response = propertyService.getPropertyById(propertyId);
            // Verify ownership
            if (!response.getOwnerId().equals(ownerService.getCurrentOwner().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/properties/{propertyId}")
    public ResponseEntity<PropertyResponse> updateProperty(
            @PathVariable Long propertyId,
            @Validated @RequestBody PropertyRequest request,
            Authentication authentication) {
        try {
            PropertyResponse response = propertyService.updateProperty(propertyId, request, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/properties/{propertyId}")
    public ResponseEntity<Void> deleteProperty(
            @PathVariable Long propertyId,
            Authentication authentication) {
        try {
            // Get property details before deletion to clean up images
            PropertyResponse property = propertyService.getPropertyById(propertyId);
            
            // Verify ownership before deletion
            if (!property.getOwnerId().equals(ownerService.getCurrentOwner().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Delete property images from filesystem
            String ownerUsername = authentication.getName();
            boolean imagesDeleted = fileStorageService.deletePropertyImages(ownerUsername, property.getTitle());
            
            // Delete property from database
            propertyService.deleteProperty(propertyId, authentication.getName());
            
            if (imagesDeleted) {
                System.out.println("Property images deleted successfully for: " + property.getTitle());
            }
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/properties/{propertyId}/reviews")
    public ResponseEntity<List<PropertyResponse>> getPropertyReviews(
            @PathVariable Long propertyId,
            Authentication authentication) {
        try {
            // Verify ownership first
            PropertyResponse property = propertyService.getPropertyById(propertyId);
            if (!property.getOwnerId().equals(ownerService.getCurrentOwner().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            // This would need to be implemented in PropertyService
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
