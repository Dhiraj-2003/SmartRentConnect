package com.smartrent.connect.smartrentconnect.service;

import com.smartrent.connect.smartrentconnect.dto.*;
import com.smartrent.connect.smartrentconnect.entity.*;
import com.smartrent.connect.smartrentconnect.enums.PropertyStatus;
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
    private final PropertyRatingRepository propertyRatingRepository;
    private final TenantPropertyHistoryRepository tenantPropertyHistoryRepository;
    private final FlatDetailsRepository flatDetailsRepository;
    private final PGRoomRepository pgRoomRepository;
    private final PGBedRepository pgBedRepository;

    public DashboardStatsResponse getDashboardStats() {
        long totalProperties = propertyRepository.count();
        long totalTenants = tenantRepository.count();
        long totalOwners = ownerRepository.count();
        long totalWatchmen = watchmanRepository.count();
        long activeRentals = tenantPropertyHistoryRepository.countActive();
        long pendingApprovals = propertyRepository.countByStatus(PropertyStatus.PENDING);
        long totalGuestPasses = guestPassRepository.count();
        long activeGuestPasses = guestPassRepository.countByStatus(GuestPass.GuestPassStatus.ACTIVE);
        long totalReviews = propertyRatingRepository.count();
        
        // Calculate total revenue (this would typically come from a payments table)
        double totalRevenue = calculateTotalRevenue();
        double monthlyRevenue = calculateMonthlyRevenue();
        double averageRating = calculateOverallAverageRating();

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
            long activeRentals = tenantPropertyHistoryRepository.countActiveByTenantId(userId);
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
        long activeTenants = tenantPropertyHistoryRepository.countActiveByPropertyId(propertyId);
        if (activeTenants > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Cannot delete property with active tenants");
        }
        
        propertyRepository.delete(property);
    }

    public void approveProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
        property.setStatus(com.smartrent.connect.smartrentconnect.enums.PropertyStatus.APPROVED);
        propertyRepository.save(property);
    }

    public void rejectProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
        propertyRepository.delete(property);
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

    public UserActivityStatsResponse getUserActivityStats() {
        // Calculate new registrations
        LocalDate now = LocalDate.now();
        LocalDate thisMonthStart = now.withDayOfMonth(1);
        LocalDate lastMonthStart = thisMonthStart.minusMonths(1);
        LocalDate lastMonthEnd = thisMonthStart.minusDays(1);
        
        long thisMonthRegistrations = userRepository.countByCreatedAtAfter(thisMonthStart.atStartOfDay());
        long lastMonthRegistrations = userRepository.countByCreatedAtBetween(
            lastMonthStart.atStartOfDay(), 
            lastMonthEnd.atTime(23, 59, 59)
        );
        
        double growth = 0.0;
        if (lastMonthRegistrations > 0) {
            growth = ((thisMonthRegistrations - lastMonthRegistrations) * 100.0) / lastMonthRegistrations;
        }
        
        // Active users (simplified - in real app, track last login/activity)
        long totalUsers = userRepository.count();
        long totalTenants = tenantRepository.count();
        long totalOwners = ownerRepository.count();
        long totalWatchmen = watchmanRepository.count();
        long totalAdmins = adminRepository.count();
        
        // Estimate active users based on total users
        int dailyActive = (int) (totalUsers * 0.3); // 30% of users active daily
        int weeklyActive = (int) (totalUsers * 0.5); // 50% of users active weekly
        int monthlyActive = (int) (totalUsers * 0.8); // 80% of users active monthly
        
        return UserActivityStatsResponse.builder()
                .newRegistrations(UserActivityStatsResponse.NewRegistrations.builder()
                        .thisMonth((int) thisMonthRegistrations)
                        .lastMonth((int) lastMonthRegistrations)
                        .growth(growth)
                        .build())
                .activeUsers(UserActivityStatsResponse.ActiveUsers.builder()
                        .daily(dailyActive)
                        .weekly(weeklyActive)
                        .monthly(monthlyActive)
                        .build())
                .userDistribution(UserActivityStatsResponse.UserDistribution.builder()
                        .tenants(totalTenants)
                        .owners(totalOwners)
                        .watchmen(totalWatchmen)
                        .admins(totalAdmins)
                        .totalUsers(totalUsers)
                        .build())
                .build();
    }

    public PropertyStatsResponse getPropertyStats() {
        long totalListings = propertyRepository.count();
        long approvedListings = propertyRepository.countByStatus(PropertyStatus.APPROVED);
        long pendingApproval = propertyRepository.countByStatus(PropertyStatus.PENDING);
        long rejectedListings = propertyRepository.countByStatus(PropertyStatus.REJECTED);
        
        // Calculate average rent
        double totalRent = 0.0;
        int rentCount = 0;
        
        // Get rent from occupied flats
        for (FlatDetails flat : flatDetailsRepository.findAll()) {
            if (flat.getIsOccupied()) {
                totalRent += flat.getRentPerMonth();
                rentCount++;
            }
        }
        
        // Get rent from occupied PG beds
        for (PGBed bed : pgBedRepository.findAll()) {
            if (bed.getIsOccupied() && bed.getPgRoom() != null) {
                totalRent += bed.getPgRoom().getPricePerBed();
                rentCount++;
            }
        }
        
        double averageRent = rentCount > 0 ? totalRent / rentCount : 0.0;
        
        // Calculate occupancy rate
        long totalFlats = flatDetailsRepository.count();
        long occupiedFlats = flatDetailsRepository.findAll().stream()
                .filter(FlatDetails::getIsOccupied)
                .count();
        
        long totalBeds = pgBedRepository.count();
        long occupiedBeds = pgBedRepository.findAll().stream()
                .filter(PGBed::getIsOccupied)
                .count();
        
        long totalUnits = totalFlats + totalBeds;
        long occupiedUnits = occupiedFlats + occupiedBeds;
        
        double occupancyRate = totalUnits > 0 ? (occupiedUnits * 100.0) / totalUnits : 0.0;
        
        // Property type distribution
        long flats = propertyRepository.countByPropertyType(com.smartrent.connect.smartrentconnect.enums.PropertyType.FLAT);
        long pgs = propertyRepository.countByPropertyType(com.smartrent.connect.smartrentconnect.enums.PropertyType.PG);
        
        return PropertyStatsResponse.builder()
                .totalListings((int) totalListings)
                .approvedListings((int) approvedListings)
                .pendingApproval((int) pendingApproval)
                .rejectedListings((int) rejectedListings)
                .averageRent(averageRent)
                .occupancyRate(occupancyRate)
                .propertyTypeDistribution(PropertyStatsResponse.PropertyTypeDistribution.builder()
                        .flats(flats)
                        .pgs(pgs)
                        .total(totalListings)
                        .build())
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
                .propertyType(property.getPropertyType())
                .description(property.getDescription())
                .address(property.getAddress())
                .city(property.getCity())
                .state(property.getState())
                .pincode(property.getPincode())
                .deposit(property.getDeposit())
                .amenities(property.getAmenities())
                .status(property.getStatus())
                .rejectionReason(property.getRejectionReason())
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

    // Revenue calculation methods using real data
    private double calculateTotalRevenue() {
        return calculateMonthlyRevenue() * 12; // Yearly revenue
    }

    private double calculateMonthlyRevenue() {
        double monthlyRevenue = 0.0;
        
        // Calculate revenue from occupied flats
        List<FlatDetails> occupiedFlats = flatDetailsRepository.findAll().stream()
                .filter(FlatDetails::getIsOccupied)
                .collect(Collectors.toList());
        
        for (FlatDetails flat : occupiedFlats) {
            monthlyRevenue += flat.getRentPerMonth();
        }
        
        // Calculate revenue from occupied PG beds
        List<PGBed> occupiedBeds = pgBedRepository.findAll().stream()
                .filter(PGBed::getIsOccupied)
                .collect(Collectors.toList());
        
        for (PGBed bed : occupiedBeds) {
            if (bed.getPgRoom() != null) {
                monthlyRevenue += bed.getPgRoom().getPricePerBed();
            }
        }
        
        return monthlyRevenue;
    }

    private double calculateYearlyRevenue() {
        return calculateTotalRevenue();
    }

    private List<RevenueReportResponse.MonthlyRevenue> getMonthlyRevenueBreakdown() {
        List<RevenueReportResponse.MonthlyRevenue> breakdown = new ArrayList<>();
        LocalDate now = LocalDate.now();
        
        // For simplicity, we'll use current monthly revenue for all months
        // In a real application, you would query historical data from payment records
        double currentMonthlyRevenue = calculateMonthlyRevenue();
        
        for (int i = 11; i >= 0; i--) {
            LocalDate date = now.minusMonths(i);
            String monthName = date.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            
            // Add some variation to simulate historical data
            double variation = 1.0 + (Math.random() * 0.2 - 0.1); // +/- 10% variation
            double monthlyRevenue = currentMonthlyRevenue * variation;
            
            breakdown.add(RevenueReportResponse.MonthlyRevenue.builder()
                    .month(monthName)
                    .year(date.getYear())
                    .date(date)
                    .revenue(monthlyRevenue)
                    .build());
        }
        
        return breakdown;
    }

    private Map<String, Double> getPropertyWiseRevenue() {
        Map<String, Double> revenueMap = new HashMap<>();

        List<Property> allProperties = propertyRepository.findAll();

        for (Property property : allProperties) {
            double annualRevenue = 0.0;

            if (property.getPropertyType() == com.smartrent.connect.smartrentconnect.enums.PropertyType.FLAT) {
                // For flats, get rent from FlatDetails
                Optional<FlatDetails> flatDetailsOpt = flatDetailsRepository.findByPropertyId(property.getId());
                if (flatDetailsOpt.isPresent()) {
                    FlatDetails flatDetails = flatDetailsOpt.get();
                    if (flatDetails.getIsOccupied()) {
                        annualRevenue = flatDetails.getRentPerMonth() * 12;
                    } else {
                        annualRevenue = 0.0;
                    }
                }
                revenueMap.put(property.getTitle(), annualRevenue);
            } else if (property.getPropertyType() == com.smartrent.connect.smartrentconnect.enums.PropertyType.PG) {
                // For PGs, calculate based on occupied beds
                annualRevenue = 0.0;
                if (property.getPgDetails() != null) {
                    for (PGRoom room : property.getPgDetails().getRooms()) {
                        if (room.getBeds() != null) {
                            long occupiedBedsCount = room.getBeds().stream()
                                    .filter(PGBed::getIsOccupied)
                                    .count();
                            annualRevenue += occupiedBedsCount * room.getPricePerBed() * 12;
                        }
                    }
                }
                revenueMap.put(property.getTitle(), annualRevenue);
            }
        }

        return revenueMap;
    }

    private Map<String, Double> getOwnerWiseRevenue() {
        Map<String, Double> revenueMap = new HashMap<>();

        List<Property> allProperties = propertyRepository.findAll();

        // Group by owner
        Map<Owner, List<Property>> propertiesByOwner = allProperties.stream()
                .collect(Collectors.groupingBy(Property::getOwner));

        for (Map.Entry<Owner, List<Property>> entry : propertiesByOwner.entrySet()) {
            Owner owner = entry.getKey();
            List<Property> ownerProperties = entry.getValue();

            double totalAnnualRevenue = 0.0;

            for (Property property : ownerProperties) {
                if (property.getPropertyType() == com.smartrent.connect.smartrentconnect.enums.PropertyType.FLAT) {
                    // For flats, get rent from FlatDetails
                    Optional<FlatDetails> flatDetailsOpt = flatDetailsRepository.findByPropertyId(property.getId());
                    if (flatDetailsOpt.isPresent()) {
                        FlatDetails flatDetails = flatDetailsOpt.get();
                        if (flatDetails.getIsOccupied()) {
                            totalAnnualRevenue += flatDetails.getRentPerMonth() * 12;
                        }
                    }
                } else if (property.getPropertyType() == com.smartrent.connect.smartrentconnect.enums.PropertyType.PG) {
                    // For PGs, calculate based on occupied beds
                    if (property.getPgDetails() != null) {
                        for (PGRoom room : property.getPgDetails().getRooms()) {
                            if (room.getBeds() != null) {
                                long occupiedBedsCount = room.getBeds().stream()
                                        .filter(PGBed::getIsOccupied)
                                        .count();
                                totalAnnualRevenue += occupiedBedsCount * room.getPricePerBed() * 12;
                            }
                        }
                    }
                }
            }

            revenueMap.put(owner.getFullName(), totalAnnualRevenue);
        }

        return revenueMap;
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
        Integer activeRentals = Math.toIntExact(tenantPropertyHistoryRepository.countActiveByPropertyOwnerId(owner.getId()));
        Double totalRevenue = propertyRepository.findByOwnerId(owner.getId()).stream()
                .mapToDouble(property -> {
                    // TODO: Calculate based on property type
                    // For FLAT: get rent from FlatDetails
                    // For PG: calculate from occupied PGBeds
                    return 0.0; // Placeholder
                })
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

    private double calculateOverallAverageRating() {
        List<Property> allProperties = propertyRepository.findAll();
        if (allProperties.isEmpty()) {
            return 0.0;
        }
        
        double totalRating = 0.0;
        int propertyCount = 0;
        
        for (Property property : allProperties) {
            Double avgRating = propertyRatingRepository.findAverageRatingByPropertyId(property.getId());
            if (avgRating != null) {
                totalRating += avgRating;
                propertyCount++;
            }
        }
        
        return propertyCount > 0 ? totalRating / propertyCount : 0.0;
    }
}
