package com.smartrent.connect.smartrentconnect.dto;


import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class OwnerRegisterRequest {

    @NotBlank
    private String username;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String fullName;

    @Pattern(regexp = "^[0-9]{10}$")
    private String phoneNumber;

    private String businessName; // optional
    private String gstNumber;    // optional

    @NotBlank
    private String address;

    private String profileImage;

    // getters and setters
}
