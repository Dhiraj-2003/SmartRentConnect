package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.Service.AdminService;
import com.smartrent.connect.smartrentconnect.dto.*;
import com.smartrent.connect.smartrentconnect.entity.GuestPass;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // =============== DASHBOARD STATS ===============
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // =============== USER MANAGEMENT ===============
    @GetMapping("/users")
    public ResponseEntity<Page<UserManagementResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<Page<UserManagementResponse>> getUsersByRole(
            @PathVariable String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminService.getUsersByRole(role, pageable));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserManagementResponse> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserById(userId));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    // =============== PROPERTY MANAGEMENT ===============
    @GetMapping("/properties")
    public ResponseEntity<Page<PropertyResponse>> getAllProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return ResponseEntity.ok(adminService.getAllProperties(pageable));
    }

    @DeleteMapping("/properties/{propertyId}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long propertyId) {
        adminService.deleteProperty(propertyId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/properties/{propertyId}/approve")
    public ResponseEntity<Void> approveProperty(@PathVariable Long propertyId) {
        adminService.approveProperty(propertyId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/properties/{propertyId}/reject")
    public ResponseEntity<Void> rejectProperty(
            @PathVariable Long propertyId,
            @RequestParam(required = false) String reason) {
        adminService.rejectProperty(propertyId, reason);
        return ResponseEntity.ok().build();
    }

    // =============== REVENUE REPORTS ===============
    @GetMapping("/revenue-report")
    public ResponseEntity<RevenueReportResponse> getRevenueReport() {
        return ResponseEntity.ok(adminService.getRevenueReport());
    }

    // =============== GUEST PASS MANAGEMENT ===============
    @GetMapping("/guest-passes")
    public ResponseEntity<Page<GuestPassResponse>> getAllGuestPasses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        if (status != null && !status.isEmpty()) {
            GuestPass.GuestPassStatus guestPassStatus = GuestPass.GuestPassStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(adminService.getGuestPassesByStatus(guestPassStatus, pageable));
        }
        
        return ResponseEntity.ok(adminService.getAllGuestPasses(pageable));
    }

    // =============== OWNER VERIFICATION MANAGEMENT ===============
    
    @GetMapping("/owners")
    public ResponseEntity<Page<OwnerResponse>> getAllOwners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return ResponseEntity.ok(adminService.getAllOwners(pageable));
    }
    
    @GetMapping("/owners/pending-verification")
    public ResponseEntity<java.util.List<OwnerResponse>> getPendingOwnerVerifications() {
        return ResponseEntity.ok(adminService.getPendingOwnerVerifications());
    }
    
    @GetMapping("/owners/{ownerId}")
    public ResponseEntity<OwnerResponse> getOwnerDetails(@PathVariable Long ownerId) {
        return ResponseEntity.ok(adminService.getOwnerDetails(ownerId));
    }
    
    @PutMapping("/owners/{ownerId}/verify")
    public ResponseEntity<OwnerResponse> verifyOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(adminService.verifyOwner(ownerId));
    }
    
    @PutMapping("/owners/{ownerId}/reject")
    public ResponseEntity<OwnerResponse> rejectOwnerVerification(
            @PathVariable Long ownerId,
            @RequestParam(required = true) String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required");
        }
        return ResponseEntity.ok(adminService.rejectOwnerVerification(ownerId, reason.trim()));
    }
}

