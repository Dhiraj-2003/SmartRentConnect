package com.smartrent.connect.smartrentconnect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "watchmen")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Watchman extends User {

    @NotBlank(message = "Full name is required")
    @Size(max = 100)
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;

    @NotBlank(message = "Shift timing is required")
    @Pattern(regexp = "^(Day|Night)$", message = "Shift timing must be 'Day' or 'Night'")
    private String shiftTiming; // "Day" or "Night"

    @NotBlank(message = "Assigned building is required")
    @Size(max = 120)
    private String assignedBuilding;
    
    // Note: profileImage is inherited from User entity
    // Additional watchman-specific fields can be added here if needed
}
