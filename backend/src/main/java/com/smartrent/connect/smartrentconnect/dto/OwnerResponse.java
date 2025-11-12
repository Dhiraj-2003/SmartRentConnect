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
public class OwnerResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String fullName;
    private String phoneNumber;
    private String businessName;
    private String gstNumber;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String dateOfBirth;
    private String profileImage;
    private String aadharCardImage;
    private String panCardImage;
    private Boolean isProfileComplete;
    private Boolean isVerified;
    private String verificationStatus;
    private String rejectionReason;
    
    // Additional fields for admin management
    private LocalDateTime joinDate;
    private Integer totalProperties;
    private Integer activeRentals;
    private Double totalRevenue;
    private LocalDateTime lastLogin;
    private String status; // ACTIVE, INACTIVE, SUSPENDED
}
