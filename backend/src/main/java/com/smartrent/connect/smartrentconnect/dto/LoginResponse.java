package com.smartrent.connect.smartrentconnect.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String token;       // JWT token
    private String username;    // username of the user
    private String email;       // email of the user
    private String roleName;    // TENANT / OWNER / ADMIN / WATCHMAN
}

