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
public class UserManagementResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String role;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    
    // Role-specific fields
    private String roomNumber; // For tenants
    private String businessName; // For owners
    private String gstNumber; // For owners
    private String designation; // For admins
    private String shiftTiming; // For watchmen
    private String assignedBuilding; // For watchmen
    private String address;
}
