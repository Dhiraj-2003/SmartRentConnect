package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.dto.GuestPassResponse;
import com.smartrent.connect.smartrentconnect.service.GuestPassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/watchman")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
@PreAuthorize("hasAuthority('WATCHMAN')")
public class WatchmanController {

    private final GuestPassService guestPassService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> watchmanDashboard() {
        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("message", "Welcome Watchman! This is your dashboard.");
        dashboardData.put("activeGuestPasses", guestPassService.getAllActiveGuestPasses().size());
        
        return ResponseEntity.ok(dashboardData);
    }

    // =============== SCAN QR CODE (VERIFY GUEST PASS) ===============
    @PostMapping("/scan/{passId}")
    public ResponseEntity<GuestPassResponse> scanQRCode(
            @PathVariable String passId,
            Authentication authentication) {
        GuestPassResponse response = guestPassService.verifyGuestPass(passId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    // =============== GET ALL ACTIVE GUEST PASSES ===============
    @GetMapping("/active-passes")
    public ResponseEntity<List<GuestPassResponse>> getActiveGuestPasses() {
        List<GuestPassResponse> guestPasses = guestPassService.getAllActiveGuestPasses();
        return ResponseEntity.ok(guestPasses);
    }

    // =============== RECORD EXIT ===============
    @PostMapping("/exit/{passId}")
    public ResponseEntity<GuestPassResponse> recordExit(
            @PathVariable String passId,
            Authentication authentication) {
        GuestPassResponse response = guestPassService.recordExit(passId, authentication.getName());
        return ResponseEntity.ok(response);
    }
}

