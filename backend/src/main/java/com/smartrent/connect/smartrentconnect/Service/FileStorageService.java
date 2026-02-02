package com.smartrent.connect.smartrentconnect.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class FileStorageService {

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;
    
    @Value("${server.port:8080}")
    private String serverPort;

    // Initialize upload directory on startup
    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("Created upload directory: " + uploadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            System.err.println("Could not create upload directory: " + e.getMessage());
        }
    }

    public String storeFile(MultipartFile file, String userType, String documentType) throws IOException {
        // Generate unique filename
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + fileExtension;

        // Create user-specific directory
        Path userDir = Paths.get(uploadDir, userType);
        if (!Files.exists(userDir)) {
            Files.createDirectories(userDir);
        }

        // Create document-type subdirectory
        Path documentDir = userDir.resolve(documentType);
        if (!Files.exists(documentDir)) {
            Files.createDirectories(documentDir);
        }

        // Store file
        Path targetLocation = documentDir.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        
        String relativePath = String.format("/uploads/%s/%s/%s", userType, documentType, fileName);
        System.out.println("File stored successfully: " + relativePath + " (absolute: " + targetLocation.toAbsolutePath() + ")");

        // Return relative path for URL construction
        return relativePath;
    }
    
    /**
     * Store property images in the specific directory structure:
     * uploads/owner/{owner_name}/property/{property_name}/images/
     */
    public List<String> storePropertyImages(List<MultipartFile> files, String ownerUsername, String propertyTitle) throws IOException {
        List<String> imageUrls = new ArrayList<>();
        
        if (files == null || files.isEmpty()) {
            return imageUrls;
        }
        
        // Sanitize owner name and property title for directory structure
        String sanitizedOwnerName = sanitizeForDirectory(ownerUsername);
        String sanitizedPropertyTitle = sanitizeForDirectory(propertyTitle);
        
        // Create directory structure: uploads/owner/{owner_name}/property/{property_name}/images/
        Path propertyImagesDir = Paths.get(uploadDir, "owner", sanitizedOwnerName, "property", sanitizedPropertyTitle, "images");
        if (!Files.exists(propertyImagesDir)) {
            Files.createDirectories(propertyImagesDir);
            System.out.println("Created property images directory: " + propertyImagesDir.toAbsolutePath());
        }
        
        for (MultipartFile file : files) {
            validateImageFile(file);
            
            // Generate filename with timestamp and format
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            // Generate timestamp filename: timestamp_image.format
            long timestamp = System.currentTimeMillis();
            String fileName = timestamp + "_image" + fileExtension;
            
            // Store file
            Path targetLocation = propertyImagesDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Generate URL path
            String relativePath = String.format("/uploads/owner/%s/property/%s/images/%s", 
                sanitizedOwnerName, sanitizedPropertyTitle, fileName);
            
            // Generate full URL
            String fullUrl = String.format("http://localhost:%s%s", serverPort, relativePath);
            
            imageUrls.add(fullUrl);
            System.out.println("Property image stored: " + fullUrl + " (absolute: " + targetLocation.toAbsolutePath() + ")");
        }
        
        return imageUrls;
    }
    
    /**
     * Convert a list of image URLs to JSON string for database storage
     */
    public String convertImageUrlsToJson(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return "[]";
        }
        
        // Convert to JSON array format
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < imageUrls.size(); i++) {
            if (i > 0) json.append(",");
            json.append("\"").append(imageUrls.get(i).replace("\"", "\\\"")).append("\"");
        }
        json.append("]");
        
        return json.toString();
    }
    
    /**
     * Sanitize string for use in directory names
     */
    private String sanitizeForDirectory(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "unnamed";
        }
        
        // Remove special characters, replace spaces with underscores, convert to lowercase
        String sanitized = input.replaceAll("[^a-zA-Z0-9\\s-_]", "");
        sanitized = sanitized.replaceAll("\\s+", "_");
        sanitized = sanitized.toLowerCase();
        
        // Limit length to prevent long directory names
        if (sanitized.length() > 50) {
            sanitized = sanitized.substring(0, 50);
        }
        
        return sanitized.isEmpty() ? "unnamed" : sanitized;
    }

    public boolean deleteFile(String filePath) {
        try {
            // Remove leading slash if present for filesystem path
            String fsPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
            Path path = Paths.get(fsPath);
            return Files.deleteIfExists(path);
        } catch (IOException e) {
            return false;
        }
    }
    
    /**
     * Delete entire property directory including all images
     */
    public boolean deletePropertyImages(String ownerUsername, String propertyTitle) {
        try {
            String sanitizedOwnerName = sanitizeForDirectory(ownerUsername);
            String sanitizedPropertyTitle = sanitizeForDirectory(propertyTitle);
            
            Path propertyDir = Paths.get(uploadDir, "owner", sanitizedOwnerName, "property", sanitizedPropertyTitle);
            
            if (Files.exists(propertyDir)) {
                Files.walk(propertyDir)
                    .sorted((a, b) -> -a.compareTo(b)) // Delete files first, then directories
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException e) {
                            System.err.println("Failed to delete: " + path);
                        }
                    });
                System.out.println("Deleted property directory: " + propertyDir.toAbsolutePath());
                return true;
            }
        } catch (IOException e) {
            System.err.println("Failed to delete property images: " + e.getMessage());
        }
        return false;
    }

    public void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Check file size (10MB max)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("File size exceeds 10MB limit");
        }

        // Check file type
        String contentType = file.getContentType();
        if (contentType != null &&
                !contentType.startsWith("image/") &&
                !contentType.equals("application/pdf")) {
            throw new RuntimeException("Only images and PDF files are allowed");
        }
    }
    
    /**
     * Validate image files specifically
     */
    public void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Image file is empty");
        }

        // Check file size (5MB max for images)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("Image size exceeds 5MB limit");
        }

        // Check file type - only images allowed
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }
        
        // Check file extension
        String originalFileName = file.getOriginalFilename();
        if (originalFileName != null) {
            String lowerCaseFileName = originalFileName.toLowerCase();
            if (!lowerCaseFileName.endsWith(".jpg") && 
                !lowerCaseFileName.endsWith(".jpeg") && 
                !lowerCaseFileName.endsWith(".png") && 
                !lowerCaseFileName.endsWith(".gif") && 
                !lowerCaseFileName.endsWith(".webp")) {
                throw new RuntimeException("Only JPG, JPEG, PNG, GIF, and WebP images are allowed");
            }
        }
    }
}