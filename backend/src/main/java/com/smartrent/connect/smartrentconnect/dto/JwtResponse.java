package com.smartrent.connect.smartrentconnect.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private long expiresIn;     // milliseconds
    private UserSummary user;   // basic user info
}
