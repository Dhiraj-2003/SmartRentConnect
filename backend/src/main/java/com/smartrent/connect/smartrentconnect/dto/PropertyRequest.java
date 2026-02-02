package com.smartrent.connect.smartrentconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    private String city;
    private String state;
    private String pincode;

    @NotNull(message = "Rent is required")
    @Positive(message = "Rent must be positive")
    private Double rent;

    private String amenities; // JSON string

    private String images; // JSON string

    private Integer bedrooms;

    private Integer bathrooms;

    private Double area;

    @Builder.Default
    private Boolean available = false;
    
    // Additional fields from frontend
    private String propertyType; // flat or pg
    private String sharingTypes; // JSON string for PG properties
}
