package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.dto.ComplaintDTO;
import com.smartrent.connect.smartrentconnect.entity.Complaint;
import com.smartrent.connect.smartrentconnect.enums.ComplaintCategory;
import com.smartrent.connect.smartrentconnect.enums.ComplaintPriority;
import com.smartrent.connect.smartrentconnect.enums.ComplaintStatus;
import com.smartrent.connect.smartrentconnect.mapper.ComplaintMapper;
import com.smartrent.connect.smartrentconnect.security.CustomUserDetails;
import com.smartrent.connect.smartrentconnect.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner/complaints")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAuthority('OWNER')")
@CrossOrigin(
        origins = {"http://localhost:3000", "http://127.0.0.1:3000"},
        allowCredentials = "true"
)
public class OwnerComplaintController {

    private final ComplaintService complaintService;
    private final ComplaintMapper complaintMapper;

    @GetMapping
    public ResponseEntity<List<ComplaintDTO>> getOwnerComplaints(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            List<Complaint> complaints = complaintService.getComplaintsByOwnerUsername(username);
            List<ComplaintDTO> complaintDTOs = complaintMapper.toDTOs(complaints);
            return ResponseEntity.ok(complaintDTOs);
        } catch (Exception e) {
            log.error("Error fetching complaints for owner", e);
            throw new RuntimeException("Failed to fetch complaints: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintDTO> getComplaintById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            Complaint complaint = complaintService.getComplaintByIdAndOwner(id, username);
            ComplaintDTO complaintDTO = complaintMapper.toDTO(complaint);
            return ResponseEntity.ok(complaintDTO);
        } catch (Exception e) {
            log.error("Error fetching complaint for owner", e);
            throw new RuntimeException("Failed to fetch complaint: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ComplaintDTO> updateComplaintStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            Complaint complaint = complaintService.updateComplaintStatusForOwner(id, request.getStatus(), username);
            ComplaintDTO complaintDTO = complaintMapper.toDTO(complaint);
            return ResponseEntity.ok(complaintDTO);
        } catch (Exception e) {
            log.error("Error updating complaint status for owner", e);
            throw new RuntimeException("Failed to update complaint status: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/respond")
    public ResponseEntity<ComplaintDTO> respondToComplaint(
            @PathVariable Long id,
            @RequestBody ResponseRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            Complaint complaint = complaintService.respondToComplaint(id, request.getResponseMessage(), username);
            ComplaintDTO complaintDTO = complaintMapper.toDTO(complaint);
            return ResponseEntity.ok(complaintDTO);
        } catch (Exception e) {
            log.error("Error responding to complaint for owner", e);
            throw new RuntimeException("Failed to respond to complaint: " + e.getMessage());
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<ComplaintCategory[]> getCategories() {
        return ResponseEntity.ok(ComplaintCategory.values());
    }

    @GetMapping("/priorities")
    public ResponseEntity<ComplaintPriority[]> getPriorities() {
        return ResponseEntity.ok(ComplaintPriority.values());
    }

    @GetMapping("/statuses")
    public ResponseEntity<ComplaintStatus[]> getStatuses() {
        return ResponseEntity.ok(ComplaintStatus.values());
    }

    // Request DTOs
    @lombok.Data
    @lombok.Builder
    public static class StatusUpdateRequest {
        private ComplaintStatus status;
    }

    @lombok.Data
    @lombok.Builder
    public static class ResponseRequest {
        private String responseMessage;
    }
}
