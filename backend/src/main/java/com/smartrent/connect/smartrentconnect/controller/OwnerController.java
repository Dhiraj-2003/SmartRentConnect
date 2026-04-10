package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.dto.OwnerProfileResponseDTO;
import com.smartrent.connect.smartrentconnect.dto.OwnerProfileUpdateDTO;
import com.smartrent.connect.smartrentconnect.service.OwnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
@PreAuthorize("hasAuthority('OWNER')")
public class OwnerController {

    private final OwnerService ownerService;

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

    // NOTE: File upload endpoints have been moved to UnifiedFileUploadController
    // Use /api/upload/profile-image for profile images
    // Use /api/upload/owner/document for owner documents
    // Use /api/upload/property/images for property images
    // Use /api/upload/property/documents for property documents

    // =============== DASHBOARD & STATS ===============
    
    @GetMapping("/dashboard")
    public ResponseEntity<String> getDashboard() {
        // This can be expanded to return actual dashboard stats
        return ResponseEntity.ok("Owner Dashboard - Profile management and property operations");
    }
}
