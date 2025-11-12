package com.smartrent.connect.smartrentconnect.dto;

import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
public class PropertyResponse {

    private Long id;
    private String title;
    private String description;
    private String location;
    private Double rent;
    private String amenities;
    private String images;
    private Integer bedrooms;
    private Integer bathrooms;
    private Double area;
    private Boolean available;
    private Double rating;
    private Integer reviewCount;
    private Long ownerId;
    private String ownerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
