package com.smartrent.connect.smartrentconnect.service;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {

    @Autowired
    private final Cloudinary cloudinary;

    @Value("${app.max.file.size:5242880}") // 5MB default
    private long maxFileSize;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private static final List<String> ALLOWED_DOCUMENT_TYPES = Arrays.asList(
            "application/pdf", "image/jpeg", "image/jpg", "image/png"
    );

    /**
     * Test connectivity to Cloudinary API
     */
    private boolean testCloudinaryConnectivity() {
        try {
            URL url = new URL("https://api.cloudinary.com/v1_1/");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);

            int responseCode = connection.getResponseCode();
            log.info("Cloudinary connectivity test - Response code: {}", responseCode);
            return responseCode == 404 || responseCode == 401; // Both indicate server is reachable
        } catch (Exception e) {
            log.error("Cloudinary connectivity test failed: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String folderPath) {
        final int maxRetries = 3;
        final long retryDelay = 2000; // 2 seconds

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Test connectivity on first attempt
                if (attempt == 1 && !testCloudinaryConnectivity()) {
                    throw new RuntimeException("Cannot connect to Cloudinary API. Please check your network connection.");
                }

                if (!isValidFileSize(file)) {
                    throw new RuntimeException("File size exceeds maximum limit of 5MB");
                }

                String publicId = generatePublicId(file.getOriginalFilename(), folderPath);

                Map<String, Object> uploadParams = new HashMap<>();
                uploadParams.put("public_id", publicId);
                uploadParams.put("folder", folderPath);
                uploadParams.put("resource_type", "auto");
                uploadParams.put("overwrite", true);

                log.info("Attempting to upload file {} to Cloudinary (attempt {}/{})",
                    file.getOriginalFilename(), attempt, maxRetries);

                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);

                String secureUrl = (String) uploadResult.get("secure_url");
                log.info("Successfully uploaded file to Cloudinary: {}", secureUrl);

                return secureUrl;

            } catch (IOException e) {
                log.error("Error uploading file to Cloudinary (attempt {}): {}", attempt, e.getMessage(), e);

                if (attempt == maxRetries) {
                    throw new RuntimeException("Failed to upload file after " + maxRetries + " attempts: " + e.getMessage());
                }

                try {
                    Thread.sleep(retryDelay * attempt); // Exponential backoff
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Upload interrupted", ie);
                }
            }
        }

        throw new RuntimeException("Failed to upload file: Max retries exceeded");
    }

    @Override
    public List<String> uploadMultipleFiles(List<MultipartFile> files, String folderPath) {
        List<String> uploadedUrls = new ArrayList<>();
        
        for (MultipartFile file : files) {
            try {
                String url = uploadFile(file, folderPath);
                uploadedUrls.add(url);
            } catch (Exception e) {
                log.error("Failed to upload file {}: {}", file.getOriginalFilename(), e.getMessage());
                // Continue with other files, but could also throw exception if strict validation needed
            }
        }
        
        return uploadedUrls;
    }

//    @Override
//    public void deleteFile(String publicId) {
//        try {
//            // Use the correct Cloudinary API method for deleting resources
//            Map<String, Object> deleteParams = new HashMap<>();
//            deleteParams.put("public_ids", publicId); // Single string, not array
//            deleteParams.put("resource_type", "auto");
//            deleteParams.put("invalidate", true); // Invalidate CDN cache
//
//            ApiResponse result = cloudinary.api().deleteResources(deleteParams);
//
//            if (result.get("deleted") != null && (Boolean) result.get("deleted")) {
//                log.info("Successfully deleted file with public ID: {}", publicId);
//            } else {
//                log.warn("Failed to delete file with public ID: {}", publicId);
//            }
//
//        } catch (Exception e) {
//            log.error("Error deleting file from Cloudinary: {}", e.getMessage(), e);
//            throw new RuntimeException("Failed to delete file: " + e.getMessage());
//        }
//    }

    @Override
    public String sanitizeTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            return "untitled_property";
        }

        // Replace spaces with underscores
        String sanitized = title.replaceAll("\\s+", "_");
        
        // Remove special characters except underscores and hyphens
        sanitized = sanitized.replaceAll("[^a-zA-Z0-9_-]", "");
        
        // Convert to lowercase
        sanitized = sanitized.toLowerCase();
        
        // Remove consecutive underscores
        sanitized = sanitized.replaceAll("_+", "_");
        
        // Remove leading/trailing underscores
        sanitized = sanitized.replaceAll("^_+|_+$", "");
        
        // Ensure it's not empty after sanitization
        if (sanitized.isEmpty()) {
            return "untitled_property";
        }

        return sanitized;
    }

    @Override
    public boolean isValidImageFile(MultipartFile file) {
        return file != null && 
               file.getContentType() != null && 
               ALLOWED_IMAGE_TYPES.contains(file.getContentType());
    }

    @Override
    public boolean isValidDocumentFile(MultipartFile file) {
        return file != null && 
               file.getContentType() != null && 
               ALLOWED_DOCUMENT_TYPES.contains(file.getContentType());
    }

    @Override
    public boolean isValidFileSize(MultipartFile file) {
        return file != null && file.getSize() <= maxFileSize;
    }

    /**
     * Generate a unique public ID for the file
     */
    private String generatePublicId(String originalFilename, String folderPath) {
        String cleanFilename = sanitizeFilename(originalFilename);
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        
        return String.format("%s/%s_%s_%s", folderPath, cleanFilename, timestamp, uuid);
    }

    /**
     * Sanitize filename for Cloudinary
     */
    private String sanitizeFilename(String filename) {
        if (filename == null) {
            return "file";
        }

        // Remove file extension
        String nameWithoutExtension = filename.contains(".") 
                ? filename.substring(0, filename.lastIndexOf(".")) 
                : filename;

        // Sanitize similar to title but keep more characters for filenames
        String sanitized = nameWithoutExtension.replaceAll("\\s+", "_");
        sanitized = sanitized.replaceAll("[^a-zA-Z0-9_-]", "");
        sanitized = sanitized.toLowerCase();

        if (sanitized.isEmpty()) {
            return "file";
        }

        return sanitized;
    }
}
