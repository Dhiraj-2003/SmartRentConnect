package com.smartrent.connect.smartrentconnect.Service;

import com.smartrent.connect.smartrentconnect.dto.*;
import com.smartrent.connect.smartrentconnect.entity.*;
import com.smartrent.connect.smartrentconnect.repository.*;
import com.smartrent.connect.smartrentconnect.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final OwnerRepository ownerRepository;
    private final WatchmanRepository watchmanRepository;
    private final AdminRepository adminRepository;
    private final PropertyRepository propertyRepository;
    private final GuestPassRepository guestPassRepository;
    private final ReviewRepository reviewRepository;
    private final TenantPropertyHistoryRepository tenantPropertyHistoryRepository;

    public DashboardStatsResponse getDashboardStats() {
        long totalProperties = propertyRepository.count();
        long totalTenants = tenantRepository.count();
        long totalOwners = ownerRepository.count();
        long totalWatchmen = watchmanRepository.count();
        long activeRentals = tenantPropertyHistoryRepository.countByEndDateIsNull();
        long pendingApprovals = propertyRepository.countByAvailableFalse(); // Assuming false means pending
        long totalGuestPasses = guestPassRepository.count();
        long activeGuestPasses = guestPassRepository.countByStatus(GuestPass.GuestPassStatus.ACTIVE);
        long totalReviews = reviewRepository.count();
        
        // Calculate total revenue (this would typically come from a payments table)
        double totalRevenue = calculateTotalRevenue();
        double monthlyRevenue = calculateMonthlyRevenue();
        double averageRating = reviewRepository.findAverageRating().orElse(0.0);

        return DashboardStatsResponse.builder()
                .totalProperties(totalProperties)
                .totalTenants(totalTenants)
                .totalOwners(totalOwners)
                .totalWatchmen(totalWatchmen)
                .activeRentals(activeRentals)
                .pendingApprovals(pendingApprovals)
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthlyRevenue)
                .totalGuestPasses(totalGuestPasses)
                .activeGuestPasses(activeGuestPasses)
                .totalReviews(totalReviews)
                .averageRating(averageRating)
                .build();
    }

    public Page<UserManagementResponse> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return users.map(this::mapToUserManagementResponse);
    }

    public Page<UserManagementResponse> getUsersByRole(String role, Pageable pageable) {
        Role userRole = Role.valueOf(role.toUpperCase());
        Page<User> users = userRepository.findByRole(userRole, pageable);
        return users.map(this::mapToUserManagementResponse);
    }

    public UserManagementResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return mapToUserManagementResponse(user);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Check if user can be deleted (no active rentals, etc.)
        if (user.getRole() == Role.TENANT) {
            long activeRentals = tenantPropertyHistoryRepository.countByTenantIdAndEndDateIsNull(userId);
            if (activeRentals > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Cannot delete tenant with active rentals");
            }
        } else if (user.getRole() == Role.OWNER) {
            long activeProperties = propertyRepository.countByOwnerId(userId);
            if (activeProperties > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Cannot delete owner with active properties");
            }
        }
        
        userRepository.delete(user);
    }

    public Page<PropertyResponse> getAllProperties(Pageable pageable) {
        Page<Property> properties = propertyRepository.findAll(pageable);
        return properties.map(this::mapToPropertyResponse);
    }

    public void deleteProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
        
        // Check if property has active tenants
        long activeTenants = tenantPropertyHistoryRepository.countByPropertyIdAndEndDateIsNull(propertyId);
        if (activeTenants > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Cannot delete property with active tenants");
        }
        
        propertyRepository.delete(property);
    }

    public void approveProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
        
        property.setApprovalStatus("APPROVED");
        property.setAvailable(true);
        property.setRejectionReason(null);
        propertyRepository.save(property);
    }

    public void rejectProperty(Long propertyId, String reason) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
        
        property.setApprovalStatus("REJECTED");
        property.setAvailable(false);
        property.setRejectionReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : "Property rejected by admin");
        propertyRepository.save(property);
    }

    public RevenueReportResponse getRevenueReport() {
        double totalRevenue = calculateTotalRevenue();
        double monthlyRevenue = calculateMonthlyRevenue();
        double yearlyRevenue = calculateYearlyRevenue();
        
        List<RevenueReportResponse.MonthlyRevenue> monthlyBreakdown = getMonthlyRevenueBreakdown();
        Map<String, Double> propertyWiseRevenue = getPropertyWiseRevenue();
        Map<String, Double> ownerWiseRevenue = getOwnerWiseRevenue();

        return RevenueReportResponse.builder()
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthlyRevenue)
                .yearlyRevenue(yearlyRevenue)
                .monthlyBreakdown(monthlyBreakdown)
                .propertyWiseRevenue(propertyWiseRevenue)
                .ownerWiseRevenue(ownerWiseRevenue)
                .build();
    }

    public Page<GuestPassResponse> getAllGuestPasses(Pageable pageable) {
        Page<GuestPass> guestPasses = guestPassRepository.findAll(pageable);
        return guestPasses.map(this::mapToGuestPassResponse);
    }

    public Page<GuestPassResponse> getGuestPassesByStatus(GuestPass.GuestPassStatus status, Pageable pageable) {
        Page<GuestPass> guestPasses = guestPassRepository.findByStatus(status, pageable);
        return guestPasses.map(this::mapToGuestPassResponse);
    }

    // Private helper methods
    private UserManagementResponse mapToUserManagementResponse(User user) {
        UserManagementResponse.UserManagementResponseBuilder builder = UserManagementResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().getName());

        // Add role-specific fields
        switch (user.getRole()) {
            case TENANT:
                Tenant tenant = (Tenant) user;
                builder.fullName(tenant.getFullName())
                       .phoneNumber(tenant.getPhoneNumber())
                       .roomNumber(tenant.getRoomNumber())
                       .address(tenant.getAddress());
                break;
            case OWNER:
                Owner owner = (Owner) user;
                builder.fullName(owner.getFullName())
                       .phoneNumber(owner.getPhoneNumber())
                       .businessName(owner.getBusinessName())
                       .gstNumber(owner.getGstNumber())
                       .address(owner.getAddress());
                break;
            case ADMIN:
                Admin admin = (Admin) user;
                builder.designation(admin.getDesignation());
                break;
            case WATCHMAN:
                Watchman watchman = (Watchman) user;
                builder.fullName(watchman.getFullName())
                       .phoneNumber(watchman.getPhoneNumber())
                       .shiftTiming(watchman.getShiftTiming())
                       .assignedBuilding(watchman.getAssignedBuilding());
                break;
        }

        return builder.build();
    }

    private PropertyResponse mapToPropertyResponse(Property property) {
        return PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .location(property.getLocation())
                .city(property.getCity())
                .state(property.getState())
                .pincode(property.getPincode())
                .rent(property.getRent())
                .amenities(property.getAmenities())
                .images(property.getImages())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .area(property.getArea())
                .available(property.getAvailable())
                .approvalStatus(property.getApprovalStatus())
                .rejectionReason(property.getRejectionReason())
                .rating(property.getRating())
                .reviewCount(property.getReviewCount())
                .ownerName(property.getOwner().getFullName())
                .ownerId(property.getOwner().getId())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }

    private GuestPassResponse mapToGuestPassResponse(GuestPass guestPass) {
        return GuestPassResponse.builder()
                .id(guestPass.getId())
                .passId(guestPass.getPassId())
                .visitorName(guestPass.getVisitorName())
                .visitorMobile(guestPass.getVisitorMobile())
                .visitDateTime(guestPass.getVisitDateTime())
                .numberOfGuests(guestPass.getNumberOfGuests())
                .tenantName(guestPass.getTenant().getFullName())
                .tenantId(guestPass.getTenant().getId())
                .status(guestPass.getStatus().name())
                .entryTime(guestPass.getEntryTime())
                .exitTime(guestPass.getExitTime())
                .verifiedBy(guestPass.getVerifiedBy())
                .createdAt(guestPass.getCreatedAt())
                .expiresAt(guestPass.getExpiresAt())
                .build();
    }

    // Revenue calculation methods (simplified - in real app, this would use payment records)
    private double calculateTotalRevenue() {
        return propertyRepository.findAll().stream()
                .mapToDouble(Property::getRent)
                .sum() * 12; // Assuming yearly calculation
    }

    private double calculateMonthlyRevenue() {
        return propertyRepository.findAll().stream()
                .mapToDouble(Property::getRent)
                .sum();
    }

    private double calculateYearlyRevenue() {
        return calculateTotalRevenue();
    }

    private List<RevenueReportResponse.MonthlyRevenue> getMonthlyRevenueBreakdown() {
        List<RevenueReportResponse.MonthlyRevenue> breakdown = new ArrayList<>();
        LocalDate now = LocalDate.now();
        
        for (int i = 11; i >= 0; i--) {
            LocalDate date = now.minusMonths(i);
            String monthName = date.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            
            breakdown.add(RevenueReportResponse.MonthlyRevenue.builder()
                    .month(monthName)
                    .year(date.getYear())
                    .date(date)
                    .revenue(calculateMonthlyRevenue()) // Simplified
                    .build());
        }
        
        return breakdown;
    }

    private Map<String, Double> getPropertyWiseRevenue() {
        return propertyRepository.findAll().stream()
                .collect(Collectors.toMap(
                    Property::getTitle,
                    property -> property.getRent() * 12
                ));
    }

    private Map<String, Double> getOwnerWiseRevenue() {
        return propertyRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                    property -> property.getOwner().getFullName(),
                    Collectors.summingDouble(property -> property.getRent() * 12)
                ));
    }

    // =============== OWNER VERIFICATION METHODS ===============
    
    public Page<OwnerResponse> getAllOwners(Pageable pageable) {
        Page<Owner> owners = ownerRepository.findAll(pageable);
        return owners.map(this::mapToOwnerResponse);
    }
    
    public OwnerResponse verifyOwner(Long ownerId) {
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Owner not found"));
        
        owner.setIsVerified(true);
        owner.setVerificationStatus("VERIFIED");
        owner.setRejectionReason(null); // Clear any previous rejection reason
        Owner savedOwner = ownerRepository.save(owner);
        
        return mapToOwnerResponse(savedOwner);
    }
    
    public OwnerResponse rejectOwnerVerification(Long ownerId, String reason) {
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Owner not found"));
        
        owner.setIsVerified(false);
        owner.setVerificationStatus("REJECTED");
        owner.setRejectionReason(reason);
        Owner savedOwner = ownerRepository.save(owner);
        
        return mapToOwnerResponse(savedOwner);
    }
    
    public List<OwnerResponse> getPendingOwnerVerifications() {
        List<Owner> pendingOwners = ownerRepository.findAll().stream()
                .filter(owner -> owner.getIsProfileComplete() && !owner.getIsVerified() && 
                        "PENDING".equals(owner.getVerificationStatus()))
                .collect(Collectors.toList());
        
        return pendingOwners.stream()
                .map(this::mapToOwnerResponse)
                .collect(Collectors.toList());
    }
    
    public OwnerResponse getOwnerDetails(Long ownerId) {
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Owner not found"));
        
        return mapToOwnerResponse(owner);
    }
    
    private OwnerResponse mapToOwnerResponse(Owner owner) {
        // Calculate owner statistics
        Integer totalProperties = Math.toIntExact(propertyRepository.countByOwnerId(owner.getId()));
        Integer activeRentals = Math.toIntExact(tenantPropertyHistoryRepository.countByPropertyOwnerIdAndEndDateIsNull(owner.getId()));
        Double totalRevenue = propertyRepository.findByOwnerId(owner.getId()).stream()
                .mapToDouble(Property::getRent)
                .sum() * 12; // Yearly revenue calculation
        
        return OwnerResponse.builder()
                .id(owner.getId())
                .username(owner.getUsername())
                .email(owner.getEmail())
                .fullName(owner.getFullName())
                .phoneNumber(owner.getPhoneNumber())
                .address(owner.getAddress())
                .city(owner.getCity())
                .state(owner.getState())
                .pincode(owner.getPincode())
                .dateOfBirth(owner.getDateOfBirth())
                .businessName(owner.getBusinessName())
                .gstNumber(owner.getGstNumber())
                .profileImage(owner.getProfileImage())
                .aadharCardImage(owner.getAadharCardImage())
                .panCardImage(owner.getPanCardImage())
                .isProfileComplete(owner.getIsProfileComplete())
                .isVerified(owner.getIsVerified())
                .verificationStatus(owner.getVerificationStatus())
                .rejectionReason(owner.getRejectionReason())
                .role(owner.getRole().getName())
                .joinDate(LocalDateTime.now()) // This should be from user creation date if available
                .totalProperties(totalProperties)
                .activeRentals(activeRentals)
                .totalRevenue(totalRevenue)
                .lastLogin(LocalDateTime.now()) // This should be from actual login tracking
                .status("ACTIVE") // This should be from actual user status field
                .build();
    }
}
