package com.smartrent.connect.smartrentconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyImageResponse {
    private Long id;
    private Long propertyId;
    private String imageUrl;
    private Boolean isPrimary;
    private Integer displayOrder;
    private LocalDateTime uploadedAt;
}
