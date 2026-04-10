package com.smartrent.connect.smartrentconnect.dto;

import lombok.Data;

@Data
public class OwnerProfileResponseDTO {
    private Long id;
    private String username;
    private String email;
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
    // Razorpay fields
    private String razorpayAccountId;
    private Boolean isOnlinePaymentEnabled;
    private String razorpayOnboardingStatus;
}