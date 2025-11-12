package com.smartrent.connect.smartrentconnect.controller;


import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tenant")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class TenantController {

    @GetMapping("/dashboard")
    public String tenantDashboard() {
        return "Welcome Tenant! This is your dashboard.";
    }
}

