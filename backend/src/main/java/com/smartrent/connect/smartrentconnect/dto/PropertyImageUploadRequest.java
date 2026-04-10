package com.smartrent.connect.smartrentconnect.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyImageUploadRequest {
    
    @NotNull(message = "Property ID is required")
    private Long propertyId;
    
    private String documentType; // Optional for images
    private Boolean isPrimary; // Optional, first image will be primary if not specified
}
