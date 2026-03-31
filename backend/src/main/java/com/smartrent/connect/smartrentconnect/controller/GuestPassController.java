package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.dto.GuestPassRequest;
import com.smartrent.connect.smartrentconnect.dto.GuestPassResponse;
import com.smartrent.connect.smartrentconnect.Service.GuestPassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guest-passes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class GuestPassController {

    private final GuestPassService guestPassService;

    // =============== CREATE GUEST PASS (TENANT ONLY) ===============
    @PostMapping
    @PreAuthorize("hasAuthority('TENANT')")
    public ResponseEntity<GuestPassResponse> createGuestPass(
            @Validated @RequestBody GuestPassRequest request,
            Authentication authentication) {
        GuestPassResponse response = guestPassService.createGuestPass(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =============== GET GUEST PASSES BY TENANT (TENANT ONLY) ===============
    @GetMapping("/my-passes")
    @PreAuthorize("hasAuthority('TENANT')")
    public ResponseEntity<List<GuestPassResponse>> getMyGuestPasses(Authentication authentication) {
        List<GuestPassResponse> guestPasses = guestPassService.getGuestPassesByTenant(authentication.getName());
        return ResponseEntity.ok(guestPasses);
    }

    // =============== GET GUEST PASS BY PASS ID (WATCHMAN ONLY) ===============
    @GetMapping("/{passId}")
    @PreAuthorize("hasAuthority('WATCHMAN')")
    public ResponseEntity<GuestPassResponse> getGuestPassByPassId(@PathVariable String passId) {
        GuestPassResponse guestPass = guestPassService.getGuestPassByPassId(passId);
        return ResponseEntity.ok(guestPass);
    }

    // =============== VERIFY GUEST PASS (WATCHMAN ONLY) ===============
    @PostMapping("/{passId}/verify")
    @PreAuthorize("hasAuthority('WATCHMAN')")
    public ResponseEntity<GuestPassResponse> verifyGuestPass(
            @PathVariable String passId,
            Authentication authentication) {
        GuestPassResponse response = guestPassService.verifyGuestPass(passId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    // =============== RECORD EXIT (WATCHMAN ONLY) ===============
    @PostMapping("/{passId}/exit")
    @PreAuthorize("hasAuthority('WATCHMAN')")
    public ResponseEntity<GuestPassResponse> recordExit(
            @PathVariable String passId,
            Authentication authentication) {
        GuestPassResponse response = guestPassService.recordExit(passId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    // =============== CANCEL GUEST PASS (TENANT ONLY) ===============
    @DeleteMapping("/{guestPassId}")
    @PreAuthorize("hasAuthority('TENANT')")
    public ResponseEntity<Void> cancelGuestPass(
            @PathVariable Long guestPassId,
            Authentication authentication) {
        guestPassService.cancelGuestPass(guestPassId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    // =============== GET ALL ACTIVE GUEST PASSES (WATCHMAN ONLY) ===============
    @GetMapping("/active")
    @PreAuthorize("hasAuthority('WATCHMAN')")
    public ResponseEntity<List<GuestPassResponse>> getAllActiveGuestPasses() {
        List<GuestPassResponse> guestPasses = guestPassService.getAllActiveGuestPasses();
        return ResponseEntity.ok(guestPasses);
    }
}
