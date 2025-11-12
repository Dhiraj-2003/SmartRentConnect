package com.smartrent.connect.smartrentconnect.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class FileController {

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("File controller is working!");
    }

    @GetMapping("/debug/list")
    public ResponseEntity<String> listFiles() {
        try {
            Path uploadsDir = Paths.get("uploads");
            System.out.println("Uploads directory: " + uploadsDir.toAbsolutePath());
            System.out.println("Directory exists: " + Files.exists(uploadsDir));
            
            if (Files.exists(uploadsDir)) {
                StringBuilder sb = new StringBuilder();
                sb.append("Files in uploads directory:\n");
                Files.walk(uploadsDir)
                     .forEach(path -> sb.append(path.toString()).append("\n"));
                return ResponseEntity.ok(sb.toString());
            } else {
                return ResponseEntity.ok("Uploads directory does not exist at: " + uploadsDir.toAbsolutePath());
            }
        } catch (Exception e) {
            return ResponseEntity.ok("Error listing files: " + e.getMessage());
        }
    }

    @GetMapping("/{userType}/{documentType}/{filename:.+}")
    public ResponseEntity<Resource> serveFileByPath(
            @PathVariable String userType,
            @PathVariable String documentType, 
            @PathVariable String filename) {
        try {
            System.out.println("Serving file: " + userType + "/" + documentType + "/" + filename);
            
            Path path = Paths.get("uploads", userType, documentType, filename).normalize();
            System.out.println("Absolute file path: " + path.toAbsolutePath());
            System.out.println("File exists: " + Files.exists(path));
            System.out.println("File readable: " + Files.isReadable(path));
            
            Resource resource = new UrlResource(path.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                // Determine content type
                String contentType = "application/octet-stream";
                String filenameLower = filename.toLowerCase();
                
                if (filenameLower.endsWith(".jpg") || filenameLower.endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (filenameLower.endsWith(".png")) {
                    contentType = "image/png";
                } else if (filenameLower.endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (filenameLower.endsWith(".webp")) {
                    contentType = "image/webp";
                } else if (filenameLower.endsWith(".pdf")) {
                    contentType = "application/pdf";
                }
                
                System.out.println("Serving file: " + filename + " with content type: " + contentType);
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                        .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                        .header(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, OPTIONS")
                        .header(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "*")
                        .body(resource);
            } else {
                System.err.println("File not found or not readable: " + path);
                return ResponseEntity.notFound()
                        .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                        .build();
            }
        } catch (Exception e) {
            System.err.println("Error serving file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .build();
        }
    }

    @GetMapping("/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        try {
            // Extract the file path from the request URI
            String requestPath = request.getRequestURI();
            System.out.println("Full request URI: " + requestPath);
            
            String filePath = requestPath.substring("/uploads/".length());
            System.out.println("Extracted file path: " + filePath);
            
            Path path = Paths.get("uploads").resolve(filePath).normalize();
            System.out.println("Absolute file path: " + path.toAbsolutePath());
            System.out.println("File exists: " + Files.exists(path));
            System.out.println("File readable: " + Files.isReadable(path));
            
            Resource resource = new UrlResource(path.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                // Determine content type
                String contentType = "application/octet-stream";
                String filename = path.getFileName().toString().toLowerCase();
                
                if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (filename.endsWith(".png")) {
                    contentType = "image/png";
                } else if (filename.endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (filename.endsWith(".webp")) {
                    contentType = "image/webp";
                } else if (filename.endsWith(".pdf")) {
                    contentType = "application/pdf";
                }
                
                System.out.println("Serving file: " + filename + " with content type: " + contentType);
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                        .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                        .header(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, OPTIONS")
                        .header(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "*")
                        .body(resource);
            } else {
                System.err.println("File not found or not readable: " + path);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error serving file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .build();
        }
    }
}
