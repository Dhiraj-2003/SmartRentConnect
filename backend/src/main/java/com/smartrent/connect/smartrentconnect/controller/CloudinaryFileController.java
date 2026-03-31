package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.Service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for serving files from Cloudinary
 * This replaces the old local file serving controller
 */
@RestController
@RequestMapping("/api/files")
@CrossOrigin(
        origins = {"http://localhost:3000", "http://127.0.0.1:3000"},
        allowCredentials = "true"
)
public class CloudinaryFileController {

    @Autowired
    private CloudinaryService cloudinaryService;

    /**
     * Test endpoint to verify Cloudinary file controller is working
     */
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Cloudinary file controller is working!");
        response.put("storageProvider", "Cloudinary");
        response.put("status", "Active");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get file validation information
     */
    @GetMapping("/validation-info")
    public ResponseEntity<?> getValidationInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("maxFileSize", "5MB");
        info.put("allowedImageTypes", java.util.Arrays.asList("image/jpeg", "image/jpg", "image/png", "image/webp"));
        info.put("allowedDocumentTypes", java.util.Arrays.asList("application/pdf", "image/jpeg", "image/jpg", "image/png"));
        info.put("storageProvider", "Cloudinary");
        info.put("note", "All files are now served directly from Cloudinary URLs");
        
        return ResponseEntity.ok(info);
    }

    /**
     * Get Cloudinary configuration for frontend
     */
    @GetMapping("/cloudinary-config")
    public ResponseEntity<?> getCloudinaryConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("cloudName", "dc9tciufe"); // This should come from environment variables in production
        config.put("apiUrl", "https://res.cloudinary.com/dc9tciufe/image/upload/");
        config.put("secureUrl", "https://res.cloudinary.com/dc9tciufe/");
        
        return ResponseEntity.ok(config);
    }
}
