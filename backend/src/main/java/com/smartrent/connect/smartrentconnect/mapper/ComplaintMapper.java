package com.smartrent.connect.smartrentconnect.mapper;

import com.smartrent.connect.smartrentconnect.dto.ComplaintDTO;
import com.smartrent.connect.smartrentconnect.entity.Complaint;
import com.smartrent.connect.smartrentconnect.entity.ComplaintImage;
import com.smartrent.connect.smartrentconnect.entity.FlatDetails;
import com.smartrent.connect.smartrentconnect.entity.Owner;
import com.smartrent.connect.smartrentconnect.entity.PGBed;
import com.smartrent.connect.smartrentconnect.entity.Property;
import com.smartrent.connect.smartrentconnect.entity.Tenant;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ComplaintMapper {

    public ComplaintDTO toDTO(Complaint complaint) {
        if (complaint == null) {
            return null;
        }

        return ComplaintDTO.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory())
                .status(complaint.getStatus())
                .priority(complaint.getPriority())
                .reportedDate(complaint.getReportedDate())
                .resolvedDate(complaint.getResolvedDate())
                .responseMessage(complaint.getResponseMessage())
                .assignedTo(complaint.getAssignedTo())
                .isActive(complaint.getIsActive())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .tenant(mapToTenantInfo(complaint.getTenant()))
                .owner(mapToOwnerInfo(complaint.getOwner()))
                .property(mapToPropertyInfo(complaint.getProperty()))
                .flatDetails(mapToFlatDetailsInfo(complaint.getFlatDetails()))
                .pgBed(mapToPGBedInfo(complaint.getPgBed()))
                .complaintImages(mapToComplaintImageDTOs(complaint.getComplaintImages()))
                .build();
    }

    public List<ComplaintDTO> toDTOs(List<Complaint> complaints) {
        return complaints.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private ComplaintDTO.TenantInfo mapToTenantInfo(Tenant tenant) {
        if (tenant == null) {
            return null;
        }
        return ComplaintDTO.TenantInfo.builder()
                .id(tenant.getId())
                .username(tenant.getUsername())
                .fullName(tenant.getFullName())
                .email(tenant.getEmail())
                .phone(tenant.getPhoneNumber())
                .build();
    }

    private ComplaintDTO.OwnerInfo mapToOwnerInfo(Owner owner) {
        if (owner == null) {
            return null;
        }
        return ComplaintDTO.OwnerInfo.builder()
                .id(owner.getId())
                .username(owner.getUsername())
                .fullName(owner.getFullName())
                .email(owner.getEmail())
                .phone(owner.getPhoneNumber())
                .build();
    }

    private ComplaintDTO.PropertyInfo mapToPropertyInfo(Property property) {
        if (property == null) {
            return null;
        }
        return ComplaintDTO.PropertyInfo.builder()
                .id(property.getId())
                .propertyName(property.getTitle())
                .propertyType(String.valueOf(property.getPropertyType()))
                .address(property.getAddress())
                .city(property.getCity())
                .state(property.getState())
                .postalCode(property.getPincode())
                .build();
    }

    private ComplaintDTO.FlatDetailsInfo mapToFlatDetailsInfo(FlatDetails flatDetails) {
        if (flatDetails == null) {
            return null;
        }
        return ComplaintDTO.FlatDetailsInfo.builder()
                .id(flatDetails.getId())
                .flatNumber(flatDetails.getFlatNumber())
                .bedrooms(flatDetails.getTotalRooms())
                .bathrooms(flatDetails.getBathrooms())
                .build();
    }

    private ComplaintDTO.PGBedInfo mapToPGBedInfo(PGBed pgBed) {
        if (pgBed == null) {
            return null;
        }
        return ComplaintDTO.PGBedInfo.builder()
                .id(pgBed.getId())
                .bedNumber(pgBed.getBedNumber())
                .roomNumber(pgBed.getPgRoom().getRoomNumber())
                .monthlyRent(pgBed.getPgRoom().getPricePerBed())
                .available(pgBed.getIsOccupied())
                .build();
    }

    private List<ComplaintDTO.ComplaintImageDTO> mapToComplaintImageDTOs(List<ComplaintImage> images) {
        if (images == null) {
            return null;
        }
        return images.stream()
                .map(this::mapToComplaintImageDTO)
                .collect(Collectors.toList());
    }

    private ComplaintDTO.ComplaintImageDTO mapToComplaintImageDTO(ComplaintImage image) {
        if (image == null) {
            return null;
        }
        return ComplaintDTO.ComplaintImageDTO.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .fileName(image.getFileName())
                .fileSize(image.getFileSize())
                .contentType(image.getContentType())
                .displayOrder(image.getDisplayOrder())
                .createdAt(image.getCreatedAt())
                .build();
    }
}
