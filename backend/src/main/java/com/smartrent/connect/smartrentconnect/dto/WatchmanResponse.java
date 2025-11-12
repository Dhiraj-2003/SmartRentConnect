package com.smartrent.connect.smartrentconnect.dto;


import lombok.Data;

@Data
public class WatchmanResponse {
    private Long id;
    private String username;
    private String email;
    private String roleName;     // WATCHMAN
    private String fullName;
    private String phoneNumber;
    private String shiftTiming;
    private String assignedBuilding;
}

