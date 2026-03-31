package com.smartrent.connect.smartrentconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingPaymentDTO {
    private Long id;
    private Long propertyId;
    private String propertyTitle;
    private String propertyAddress;
    private String propertyCity;
    private String propertyState;
    private String propertyPincode;
    private String propertyType;
    private String ownerName;
    private String propertyDescription;
    private String amenities;
    private Double averageRating;
    private Long totalRatings;
    private Double depositAmount;
    private LocalDateTime bookingDate;
    private LocalDateTime moveInDate;
    private String status;
    
    // Flat specific details
    private String flatNumber;
    private String bhkType;
    private Integer totalRooms;
    private Integer bathrooms;
    private String furnishingType;
    private Double rentPerMonth;
    
    // PG specific details
    private Long pgBedId;
    private String roomNumber;
    private String sharingType;
    private String genderAllowed;
    private Boolean foodIncluded;
    private Double pricePerBed;
    private String bedNumber;
}
