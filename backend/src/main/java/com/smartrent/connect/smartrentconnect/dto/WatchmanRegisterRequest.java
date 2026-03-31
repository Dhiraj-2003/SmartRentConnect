package com.smartrent.connect.smartrentconnect.dto;


import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class WatchmanRegisterRequest {

    // base user
    @NotBlank
    @Size(min = 4, max = 20)
    @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "Username can contain letters, numbers, dot, underscore, hyphen")
    private String username;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 8)
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*#?&^._-]).{8,}$",
            message = "Password must contain upper, lower, digit and special character"
    )
    private String password;

    // watchman-specific
    @NotBlank
    @Size(max = 100)
    private String fullName;

    @NotBlank
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;

    @NotBlank
    @Pattern(regexp = "^(Day|Night)$", message = "Shift timing must be 'Day' or 'Night'")
    private String shiftTiming;

    @NotBlank
    @Size(max = 120)
    private String assignedBuilding;


}
