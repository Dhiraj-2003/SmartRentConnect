package com.smartrent.connect.smartrentconnect.dto;

import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
public class RatingResponse {

    private Long id;
    private Long propertyId;
    private String propertyTitle;
    private Long tenantId;
    private String tenantName;
    private Integer rating;
    private String review;
    private LocalDateTime createdAt;
}
