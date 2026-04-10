package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/owner/upload")
@PreAuthorize("hasAuthority('OWNER')")
public class FileUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/profile-image")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        try {
            fileStorageService.validateFile(file);
            String filePath = fileStorageService.storeFile(file, "owner", "profile-images");

            Map<String, String> response = new HashMap<>();
            response.put("filePath", filePath);
            response.put("message", "Profile image uploaded successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/document")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType) {
        try {
            // Validate document type
            if (!documentType.equals("aadhar") && !documentType.equals("pan")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid document type"));
            }

            fileStorageService.validateFile(file);
            String filePath = fileStorageService.storeFile(file, "owner", "documents");

            Map<String, String> response = new HashMap<>();
            response.put("filePath", filePath);
            response.put("message", documentType.toUpperCase() + " document uploaded successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/file")
    public ResponseEntity<?> deleteFile(@RequestParam String filePath) {
        try {
            boolean deleted = fileStorageService.deleteFile(filePath);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete file"));
        }
    }
}