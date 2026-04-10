package com.smartrent.connect.smartrentconnect.dto;

import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {

    private Long id;
    private Integer rating;
    private String comment;
    private Long propertyId;
    private String propertyTitle;
    private Long tenantId;
    private String tenantName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
