package com.smartrent.connect.smartrentconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {
    private boolean success;
    private String message;
    private String filePath; // Single file path (for backward compatibility)
    private List<String> filePaths; // Multiple file paths
    private String fileType;
    private Long fileSize;
    private String originalFileName;

    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();
}