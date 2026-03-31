package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.Service.CloudinaryService;
import com.smartrent.connect.smartrentconnect.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(
        origins = {"http://localhost:3000", "http://127.0.0.1:3000"},
        allowCredentials = "true"
)
public class UnifiedFileUploadController {

    @Autowired
    private CloudinaryService cloudinaryService;

    /**
     * Upload profile image for any user type
     */
    @PostMapping("/profile-image")
    @PreAuthorize("hasAnyAuthority('TENANT', 'OWNER', 'ADMIN', 'WATCHMAN')")
    public ResponseEntity<?> uploadProfileImage(@AuthenticationPrincipal CustomUserDetails userDetails,
                                               @RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (!cloudinaryService.isValidImageFile(file)) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Invalid image file. Only JPG, PNG, and WebP files are allowed")
                );
            }

            if (!cloudinaryService.isValidFileSize(file)) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "File size exceeds 5MB limit")
                );
            }

            // Create folder path based on user role and ID
            String userType = userDetails.getUser().getRole().name().toLowerCase();
            String folderPath = String.format("smartrentconnect/%s/%d/profile-images", userType, userDetails.getUser().getId());

            // Upload to Cloudinary
            String imageUrl = cloudinaryService.uploadFile(file, folderPath);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imageUrl", imageUrl);
            response.put("message", "Profile image uploaded successfully to Cloudinary");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Failed to upload profile image: " + e.getMessage())
            );
        }
    }

    /**
     * Upload document for owner verification
     */
    @PostMapping("/owner/document")
    @PreAuthorize("hasAuthority('OWNER')")
    public ResponseEntity<?> uploadOwnerDocument(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                @RequestParam("file") MultipartFile file,
                                                @RequestParam("documentType") String documentType) {
        try {
            // Validate document type
            if (!documentType.equals("aadhar") && !documentType.equals("pan")) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Invalid document type. Only 'aadhar' and 'pan' are allowed")
                );
            }

            // Validate file
            if (!cloudinaryService.isValidDocumentFile(file)) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Invalid document file. Only PDF, JPG, and PNG files are allowed")
                );
            }

            if (!cloudinaryService.isValidFileSize(file)) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "File size exceeds 5MB limit")
                );
            }

            // Create folder path for owner documents
            String folderPath = String.format("smartrentconnect/owner/%d/documents/%s", 
                userDetails.getUser().getId(), documentType);

            // Upload to Cloudinary
            String documentUrl = cloudinaryService.uploadFile(file, folderPath);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("documentUrl", documentUrl);
            response.put("documentType", documentType);
            response.put("message", documentType.toUpperCase() + " document uploaded successfully to Cloudinary");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Failed to upload document: " + e.getMessage())
            );
        }
    }

    /**
     * Upload property images
     */
    @PostMapping("/property/images")
    @PreAuthorize("hasAuthority('OWNER')")
    public ResponseEntity<?> uploadPropertyImages(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                 @RequestParam("files") List<MultipartFile> files,
                                                 @RequestParam("propertyId") Long propertyId) {
        try {
            if (files.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "No files provided")
                );
            }

            // Validate all files
            for (MultipartFile file : files) {
                if (!cloudinaryService.isValidImageFile(file)) {
                    return ResponseEntity.badRequest().body(
                        Map.of("error", "Invalid image file: " + file.getOriginalFilename() + 
                              ". Only JPG, PNG, and WebP files are allowed")
                    );
                }

                if (!cloudinaryService.isValidFileSize(file)) {
                    return ResponseEntity.badRequest().body(
                        Map.of("error", "File size exceeds 5MB limit: " + file.getOriginalFilename())
                    );
                }
            }

            // Create folder path for property images
            String folderPath = String.format("smartrentconnect/owner/%d/property/%d/images", 
                userDetails.getUser().getId(), propertyId);

            // Upload multiple files to Cloudinary
            List<String> imageUrls = cloudinaryService.uploadMultipleFiles(files, folderPath);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imageUrls", imageUrls);
            response.put("count", imageUrls.size());
            response.put("message", imageUrls.size() + " property images uploaded successfully to Cloudinary");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Failed to upload property images: " + e.getMessage())
            );
        }
    }

    /**
     * Upload property documents
     */
    @PostMapping("/property/documents")
    @PreAuthorize("hasAuthority('OWNER')")
    public ResponseEntity<?> uploadPropertyDocuments(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                   @RequestParam("files") List<MultipartFile> files,
                                                   @RequestParam("propertyId") Long propertyId) {
        try {
            if (files.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "No files provided")
                );
            }

            // Validate all files
            for (MultipartFile file : files) {
                if (!cloudinaryService.isValidDocumentFile(file)) {
                    return ResponseEntity.badRequest().body(
                        Map.of("error", "Invalid document file: " + file.getOriginalFilename() + 
                              ". Only PDF, JPG, and PNG files are allowed")
                    );
                }

                if (!cloudinaryService.isValidFileSize(file)) {
                    return ResponseEntity.badRequest().body(
                        Map.of("error", "File size exceeds 5MB limit: " + file.getOriginalFilename())
                    );
                }
            }

            // Create folder path for property documents
            String folderPath = String.format("smartrentconnect/owner/%d/property/%d/documents", 
                userDetails.getUser().getId(), propertyId);

            // Upload multiple files to Cloudinary
            List<String> documentUrls = cloudinaryService.uploadMultipleFiles(files, folderPath);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("documentUrls", documentUrls);
            response.put("count", documentUrls.size());
            response.put("message", documentUrls.size() + " property documents uploaded successfully to Cloudinary");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Failed to upload property documents: " + e.getMessage())
            );
        }
    }

    /**
     * Upload tenant documents (if needed)
     */
    @PostMapping("/tenant/document")
    @PreAuthorize("hasAuthority('TENANT')")
    public ResponseEntity<?> uploadTenantDocument(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                @RequestParam("file") MultipartFile file,
                                                @RequestParam("documentType") String documentType) {
        try {
            // Validate file
            if (!cloudinaryService.isValidDocumentFile(file)) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Invalid document file. Only PDF, JPG, and PNG files are allowed")
                );
            }

            if (!cloudinaryService.isValidFileSize(file)) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "File size exceeds 5MB limit")
                );
            }

            // Create folder path for tenant documents
            String folderPath = String.format("smartrentconnect/tenant/%d/documents/%s", 
                userDetails.getUser().getId(), documentType);

            // Upload to Cloudinary
            String documentUrl = cloudinaryService.uploadFile(file, folderPath);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("documentUrl", documentUrl);
            response.put("documentType", documentType);
            response.put("message", "Tenant document uploaded successfully to Cloudinary");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Failed to upload document: " + e.getMessage())
            );
        }
    }

    /**
     * Get file validation information
     */
    @GetMapping("/validation-info")
    public ResponseEntity<?> getValidationInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("maxFileSize", "5MB");
        info.put("allowedImageTypes", List.of("image/jpeg", "image/jpg", "image/png", "image/webp"));
        info.put("allowedDocumentTypes", List.of("application/pdf", "image/jpeg", "image/jpg", "image/png"));
        info.put("storageProvider", "Cloudinary");
        
        return ResponseEntity.ok(info);
    }
}
