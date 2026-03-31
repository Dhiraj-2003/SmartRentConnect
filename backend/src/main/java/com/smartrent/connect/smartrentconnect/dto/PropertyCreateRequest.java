package com.smartrent.connect.smartrentconnect.dto;

import com.smartrent.connect.smartrentconnect.enums.PropertyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Property type is required")
    private PropertyType propertyType;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    @NotNull(message = "Deposit is required")
    @Positive(message = "Deposit must be positive")
    private Double deposit;

    private String amenities; // JSON string

    // Flat specific fields
    private String bhkType;
    private Double rentPerMonth;
    private Integer totalRooms;
    private Integer bathrooms;
    private String furnishingType;
    private String flatNumber;

    // PG specific fields
    private String genderAllowed;
    private Boolean foodIncluded;
    
    // NEW: Floor-based room configuration
    private List<FloorConfigDto> floorConfigs;
    
    // NEW: Property images and documents for single-transaction creation
    private List<MultipartFile> images;
    
    private List<PropertyDocumentUploadRequest> documents;
    
    // DEPRECATED: Individual room configuration (kept for backward compatibility)
    private List<PGRoomRequest> rooms;
}
