package com.smartrent.connect.smartrentconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadResponse {
    
    private boolean success;
    private String message;
    private List<String> uploadedUrls;
    private int totalFiles;
    private int successfulUploads;
    private int failedUploads;
}
