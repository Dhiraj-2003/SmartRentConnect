package com.smartrent.connect.smartrentconnect.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AdminRegisterRequest {

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

    // admin-specific (optional)
    @Size(max = 100)
    private String designation;
}
