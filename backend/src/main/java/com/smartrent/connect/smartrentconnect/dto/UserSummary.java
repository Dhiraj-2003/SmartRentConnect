package com.smartrent.connect.smartrentconnect.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserSummary {
    private Long id;
    private String username;
    private String email;
    private String roleName; // e.g., TENANT, OWNER, ADMIN, WATCHMAN
    private String displayName; // e.g., fullName
}
