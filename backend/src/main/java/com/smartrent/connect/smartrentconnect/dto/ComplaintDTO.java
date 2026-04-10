package com.smartrent.connect.smartrentconnect.dto;

import com.smartrent.connect.smartrentconnect.enums.ComplaintCategory;
import com.smartrent.connect.smartrentconnect.enums.ComplaintPriority;
import com.smartrent.connect.smartrentconnect.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintDTO {
    private Long id;
    private String title;
    private String description;
    private ComplaintCategory category;
    private ComplaintStatus status;
    private ComplaintPriority priority;
    private LocalDate reportedDate;
    private LocalDate resolvedDate;
    private String responseMessage;
    private String assignedTo;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Related entities (simplified)
    private TenantInfo tenant;
    private OwnerInfo owner;
    private PropertyInfo property;
    private FlatDetailsInfo flatDetails;
    private PGBedInfo pgBed;
    private List<ComplaintImageDTO> complaintImages;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TenantInfo {
        private Long id;
        private String username;
        private String fullName;
        private String email;
        private String phone;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerInfo {
        private Long id;
        private String username;
        private String fullName;
        private String email;
        private String phone;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PropertyInfo {
        private Long id;
        private String propertyName;
        private String propertyType;
        private String address;
        private String city;
        private String state;
        private String postalCode;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlatDetailsInfo {
        private Long id;
        private String flatNumber;
        private Integer bedrooms;
        private Integer bathrooms;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PGBedInfo {
        private Long id;
        private String bedNumber;
        private String roomNumber;
        private Double monthlyRent;
        private Boolean available;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComplaintImageDTO {
        private Long id;
        private String imageUrl;
        private String fileName;
        private Long fileSize;
        private String contentType;
        private Integer displayOrder;
        private LocalDateTime createdAt;
    }
}
