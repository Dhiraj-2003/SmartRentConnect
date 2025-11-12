package com.smartrent.connect.smartrentconnect.dto;


import jakarta.validation.constraints.*;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class TenantRegisterRequest {

    // base user fields (role is decided by endpoint; not sent by client)
    @NotBlank(message = "Username is required")
    @Size(min = 4, max = 20, message = "Username must be 4–20 characters")
    @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "Username can contain letters, numbers, dot, underscore, hyphen")
    private String username;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*#?&^._-]).{8,}$",
            message = "Password must contain upper, lower, digit and special character"
    )
    private String password;

    // tenant-specific
    @NotBlank(message = "Full name is required")
    @Size(max = 100)
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;

    @NotBlank(message = "Room number is required")
    @Size(max = 20)
    @Pattern(regexp = "^[A-Za-z0-9\\-\\/ ]+$", message = "Room number may contain letters, numbers, space, -, /")
    private String roomNumber;

    @NotBlank(message = "Address is required")
    @Size(max = 255)
    private String address;

    @URL(message = "Profile image must be a valid URL")
    @Size(max = 500)
    private String profileImage; // optional
}
