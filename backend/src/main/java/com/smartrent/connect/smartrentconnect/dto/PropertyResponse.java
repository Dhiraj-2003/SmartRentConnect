package com.smartrent.connect.smartrentconnect.dto;

import com.smartrent.connect.smartrentconnect.enums.PropertyType;
import com.smartrent.connect.smartrentconnect.enums.PropertyStatus;
import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PropertyResponse {

    private Long id;
    private String title;
    private PropertyType propertyType;
    private String description;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private Double deposit;
    private String amenities;
    private PropertyStatus status;
    private String rejectionReason;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Rating information (calculated dynamically)
    private Double averageRating;
    private Long totalRatings;
    
    // Flat specific details
    private FlatDetailsResponse flatDetails;
    
    // PG specific details
    private PGDetailsResponse pgDetails;
    
    // Images
    private List<String> images;
}
