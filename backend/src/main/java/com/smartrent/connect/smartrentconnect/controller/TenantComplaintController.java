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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tenant/complaints")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAuthority('TENANT')")
@CrossOrigin(
        origins = {"http://localhost:3000", "http://127.0.0.1:3000"},
        allowCredentials = "true"
)
public class TenantComplaintController {

    private final ComplaintService complaintService;
    private final ComplaintMapper complaintMapper;

    @GetMapping
    public ResponseEntity<List<ComplaintDTO>> getTenantComplaints(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            List<Complaint> complaints = complaintService.getComplaintsByTenantUsername(username);
            List<ComplaintDTO> complaintDTOs = complaintMapper.toDTOs(complaints);
            return ResponseEntity.ok(complaintDTOs);
        } catch (Exception e) {
            log.error("Error fetching complaints for tenant", e);
            throw new RuntimeException("Failed to fetch complaints: " + e.getMessage());
        }
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ComplaintDTO> createComplaint(
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("category") String category,
            @RequestPart("priority") String priority,
            @RequestPart("propertyId") String propertyId,
            @RequestPart(value = "flatDetailsId", required = false) String flatDetailsId,
            @RequestPart(value = "pgBedId", required = false) String pgBedId,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            
            ComplaintRequest request = ComplaintRequest.builder()
                    .title(title)
                    .description(description)
                    .category(ComplaintCategory.valueOf(category))
                    .priority(ComplaintPriority.valueOf(priority))
                    .propertyId(Long.parseLong(propertyId))
                    .flatDetailsId(flatDetailsId != null ? Long.parseLong(flatDetailsId) : null)
                    .pgBedId(pgBedId != null ? Long.parseLong(pgBedId) : null)
                    .images(images)
                    .build();
                    
            Complaint complaint = complaintService.createComplaint(request, username);
            ComplaintDTO complaintDTO = complaintMapper.toDTO(complaint);
            return ResponseEntity.ok(complaintDTO);
        } catch (Exception e) {
            log.error("Error creating complaint", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Complaint> updateComplaintStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        try {
            Complaint complaint = complaintService.updateComplaintStatus(id, request.getStatus());
            return ResponseEntity.ok(complaint);
        } catch (Exception e) {
            log.error("Error updating complaint status", e);
            return ResponseEntity.internalServerError().build();
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

    // DTOs
    @lombok.Data
    @lombok.Builder
    public static class ComplaintRequest {
        private String title;
        private String description;
        private ComplaintCategory category;
        private ComplaintPriority priority;
        private Long propertyId;
        private Long flatDetailsId;
        private Long pgBedId;
        private List<MultipartFile> images;
    }

    @lombok.Data
    public static class StatusUpdateRequest {
        private ComplaintStatus status;
    }
}
