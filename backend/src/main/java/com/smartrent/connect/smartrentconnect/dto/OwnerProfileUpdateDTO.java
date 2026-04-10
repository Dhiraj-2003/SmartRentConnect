package com.smartrent.connect.smartrentconnect.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class OwnerProfileUpdateDTO {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    @NotBlank(message = "Date of birth is required")
    private String dateOfBirth;

    private String profileImageUrl;
    private String aadharCardUrl;
    private String panCardUrl;
}
