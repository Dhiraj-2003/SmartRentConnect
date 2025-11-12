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

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Rent is required")
    @Positive(message = "Rent must be positive")
    private Double rent;

    private String amenities; // JSON string

    private String images; // JSON string

    private Integer bedrooms;

    private Integer bathrooms;

    private Double area;

    private Boolean available = true;
}
