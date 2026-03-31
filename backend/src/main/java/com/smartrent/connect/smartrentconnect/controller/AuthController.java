package com.smartrent.connect.smartrentconnect.controller;


import com.smartrent.connect.smartrentconnect.Service.AuthService;
import com.smartrent.connect.smartrentconnect.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class AuthController {

    private final AuthService authService;

    // =============== REGISTER TENANT ===============
    @PostMapping("/register/tenant")
    public ResponseEntity<String> registerTenant(@Validated @RequestBody TenantRegisterRequest request) {
        return ResponseEntity.ok(authService.registerTenant(request));
    }

    // =============== REGISTER OWNER ===============
    @PostMapping("/register/owner")
    public ResponseEntity<String> registerOwner(@Validated @RequestBody OwnerRegisterRequest request) {
        return ResponseEntity.ok(authService.registerOwner(request));
    }

    // =============== REGISTER ADMIN ===============
    @PostMapping("/register/admin")
    public ResponseEntity<String> registerAdmin(@Validated @RequestBody AdminRegisterRequest request) {
        return ResponseEntity.ok(authService.registerAdmin(request));
    }

    // =============== REGISTER WATCHMAN ===============
    @PostMapping("/register/watchman")
    public ResponseEntity<String> registerWatchman(@Validated @RequestBody WatchmanRegisterRequest request) {
        return ResponseEntity.ok(authService.registerWatchman(request));
    }

    // =============== LOGIN ===============
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Validated @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}

