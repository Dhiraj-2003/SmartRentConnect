package com.smartrent.connect.smartrentconnect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "owners")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Owner extends User {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;

    private String businessName; // optional

    private String gstNumber; // optional

    @NotBlank(message = "Address is required")
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "pincode")
    private String pincode;

    @Column(name = "date_of_birth")
    private String dateOfBirth;

    // Note: profileImage is now inherited from User entity
    // @Column(name = "profile_image")
    // private String profileImage; // URL to profile image - REMOVED, using inherited field

    @Column(name = "aadhar_card_image", length = 500)
    private String aadharCardImage; // Cloudinary URL to Aadhar card image

    @Column(name = "pan_card_image", length = 500)
    private String panCardImage; // Cloudinary URL to PAN card image

    @Column(name = "is_profile_complete")
    private Boolean isProfileComplete = false;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "verification_status")
    private String verificationStatus = "PENDING"; // PENDING, VERIFIED, REJECTED
    
    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason; // Reason for rejection if status is REJECTED
    
    @Column(name = "razorpay_account_id", length = 255)
    private String razorpayAccountId;
    
    @Column(name = "is_online_payment_enabled")
    private Boolean isOnlinePaymentEnabled=false;
    
    @Column(name = "razorpay_onboarding_status", length = 50)
    private String razorpayOnboardingStatus;
}
