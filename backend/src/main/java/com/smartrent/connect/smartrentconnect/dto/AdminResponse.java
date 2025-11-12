package com.smartrent.connect.smartrentconnect.dto;


import lombok.Data;

@Data
public class AdminResponse {
    private Long id;
    private String username;
    private String email;
    private String roleName;   // ADMIN
    private String designation;
}
