package com.smartrent.connect.smartrentconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FloorConfigDto {
    
    @NotNull(message = "Floor number is required")
    @Min(value = 0, message = "Floor number cannot be negative")
    private Integer floorNumber;
    
    @NotBlank(message = "Starting room number is required")
    private String startingRoomNumber;
    
    @NotNull(message = "Total rooms is required")
    @Min(value = 1, message = "At least 1 room is required")
    @Max(value = 50, message = "Maximum 50 rooms allowed per floor")
    private Integer totalRooms;
    
    @NotNull(message = "Sharing type is required")
    private String sharingType; // SINGLE, DOUBLE, TRIPLE
    
    @NotNull(message = "Number of bathrooms is required")
    @Min(value = 0, message = "Bathrooms cannot be negative")
    @Max(value = 10, message = "Maximum 10 bathrooms allowed")
    private Integer bathrooms;
    
    @NotNull(message = "Price per bed is required")
    @Min(value = 0, message = "Price per bed cannot be negative")
    private Double pricePerBed;
}
