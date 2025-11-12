package com.smartrent.connect.smartrentconnect.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

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

        // Return relative path for URL construction
        return String.format("/uploads/%s/%s/%s", userType, documentType, fileName);
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
}