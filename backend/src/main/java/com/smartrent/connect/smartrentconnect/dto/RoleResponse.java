package com.smartrent.connect.smartrentconnect.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RoleResponse {
    private Long id;

    @NotBlank
    @Size(max = 30)
    private String name; // TENANT / OWNER / ADMIN / WATCHMAN
}
