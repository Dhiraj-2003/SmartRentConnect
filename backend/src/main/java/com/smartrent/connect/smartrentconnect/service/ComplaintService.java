package com.smartrent.connect.smartrentconnect.service;

import com.smartrent.connect.smartrentconnect.entity.Complaint;
import com.smartrent.connect.smartrentconnect.entity.ComplaintImage;
import com.smartrent.connect.smartrentconnect.entity.Tenant;
import com.smartrent.connect.smartrentconnect.entity.Owner;
import com.smartrent.connect.smartrentconnect.entity.Property;
import com.smartrent.connect.smartrentconnect.entity.FlatDetails;
import com.smartrent.connect.smartrentconnect.entity.PGBed;
import com.smartrent.connect.smartrentconnect.enums.ComplaintStatus;
import com.smartrent.connect.smartrentconnect.repository.*;
import com.smartrent.connect.smartrentconnect.controller.TenantComplaintController.ComplaintRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintImageRepository complaintImageRepository;
    private final TenantRepository tenantRepository;
    private final OwnerRepository ownerRepository;
    private final PropertyRepository propertyRepository;
    private final FlatDetailsRepository flatDetailsRepository;
    private final PGBedRepository pgBedRepository;
    private final CloudinaryService cloudinaryService;

    public List<Complaint> getComplaintsByTenantUsername(String username) {
        Tenant tenant = tenantRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + username));
        
        return complaintRepository.findByTenantIdOrderByReportedDateDesc(tenant.getId());
    }

    public Complaint createComplaint(ComplaintRequest request, String username) {
        Tenant tenant = tenantRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + username));

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found: " + request.getPropertyId()));

        Owner owner = property.getOwner();

        // Handle flat details or PG bed
        FlatDetails flatDetails = null;
        PGBed pgBed = null;
        
        if (request.getFlatDetailsId() != null) {
            flatDetails = flatDetailsRepository.findById(request.getFlatDetailsId())
                    .orElse(null);
        }
        
        if (request.getPgBedId() != null) {
            pgBed = pgBedRepository.findById(request.getPgBedId())
                    .orElse(null);
        }

        Complaint complaint = Complaint.builder()
                .tenant(tenant)
                .owner(owner)
                .property(property)
                .flatDetails(flatDetails)
                .pgBed(pgBed)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(ComplaintStatus.OPEN)
                .reportedDate(LocalDate.now())
                .build();

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Handle complaint images
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            uploadComplaintImages(savedComplaint, request.getImages(), tenant.getUsername(), property.getTitle());
        }

        return savedComplaint;
    }

    private void uploadComplaintImages(Complaint complaint, List<MultipartFile> images, String tenantName, String propertyName) {
        try {
            // Create folder path: Complaints/Tenant_Name/PropertyName/
            String sanitizedTenantName = cloudinaryService.sanitizeTitle(tenantName);
            String sanitizedPropertyName = cloudinaryService.sanitizeTitle(propertyName);
            String folderPath = "SmartRentConnect/complaints/" + sanitizedTenantName + "/" + sanitizedPropertyName;
            
            for (int i = 0; i < images.size(); i++) {
                MultipartFile image = images.get(i);
                
                // Validate image file
                if (!cloudinaryService.isValidImageFile(image)) {
                    throw new RuntimeException("Invalid image file type: " + image.getContentType());
                }
                
                if (!cloudinaryService.isValidFileSize(image)) {
                    throw new RuntimeException("Image file size exceeds maximum limit of 5MB");
                }
                
                // Upload to Cloudinary
                String imageUrl = cloudinaryService.uploadFile(image, folderPath);
                
                // Save to database
                ComplaintImage complaintImage = ComplaintImage.builder()
                        .complaint(complaint)
                        .imageUrl(imageUrl)
                        .fileName(image.getOriginalFilename())
                        .fileSize(image.getSize())
                        .contentType(image.getContentType())
                        .displayOrder(i)
                        .build();
                
                complaintImageRepository.save(complaintImage);
            }
            
            log.info("Successfully uploaded {} images for complaint ID: {}", images.size(), complaint.getId());
            
        } catch (Exception e) {
            log.error("Error uploading complaint images for complaint ID: {}", complaint.getId(), e);
            throw new RuntimeException("Failed to upload complaint images: " + e.getMessage());
        }
    }

    public Complaint updateComplaintStatus(Long complaintId, ComplaintStatus status) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found: " + complaintId));

        complaint.setStatus(status);
        if (status == ComplaintStatus.RESOLVED) {
            complaint.setResolvedDate(LocalDate.now());
        }

        return complaintRepository.save(complaint);
    }

    public List<Complaint> getComplaintsByPropertyId(Long propertyId) {
        return complaintRepository.findByPropertyIdOrderByReportedDateDesc(propertyId);
    }

    public List<Complaint> getComplaintsByOwnerId(Long ownerId) {
        return complaintRepository.findByOwnerIdOrderByReportedDateDesc(ownerId);
    }

    public List<Complaint> getComplaintsByOwnerUsername(String ownerUsername) {
        Owner owner = ownerRepository.findByUsername(ownerUsername)
                .orElseThrow(() -> new RuntimeException("Owner not found: " + ownerUsername));
        return complaintRepository.findByOwnerIdOrderByReportedDateDesc(owner.getId());
    }

    public Complaint getComplaintByIdAndOwner(Long complaintId, String ownerUsername) {
        Owner owner = ownerRepository.findByUsername(ownerUsername)
                .orElseThrow(() -> new RuntimeException("Owner not found: " + ownerUsername));
        
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found: " + complaintId));
        
        if (!complaint.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Access denied: Complaint does not belong to this owner");
        }
        
        return complaint;
    }

    public Complaint updateComplaintStatusForOwner(Long complaintId, ComplaintStatus status, String ownerUsername) {
        Complaint complaint = getComplaintByIdAndOwner(complaintId, ownerUsername);
        
        complaint.setStatus(status);
        if (status == ComplaintStatus.RESOLVED) {
            complaint.setResolvedDate(LocalDate.now());
        }
        
        return complaintRepository.save(complaint);
    }

    public Complaint respondToComplaint(Long complaintId, String responseMessage, String ownerUsername) {
        Complaint complaint = getComplaintByIdAndOwner(complaintId, ownerUsername);
        
        complaint.setResponseMessage(responseMessage);
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        
        return complaintRepository.save(complaint);
    }

    public List<Complaint> getComplaintsByStatus(ComplaintStatus status) {
        return complaintRepository.findByStatusOrderByReportedDateDesc(status);
    }
}
