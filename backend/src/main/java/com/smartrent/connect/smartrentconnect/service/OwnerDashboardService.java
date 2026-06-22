package com.smartrent.connect.smartrentconnect.service;

import com.smartrent.connect.smartrentconnect.dto.OwnerDashboardDTO;
import com.smartrent.connect.smartrentconnect.dto.OwnerRevenueDTO;
import com.smartrent.connect.smartrentconnect.entity.*;
import com.smartrent.connect.smartrentconnect.enums.*;
import com.smartrent.connect.smartrentconnect.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OwnerDashboardService {

    private final OwnerRepository ownerRepository;
    private final PropertyRepository propertyRepository;
    private final TenantPropertyHistoryRepository tenantPropertyHistoryRepository;
    private final PaymentRepository paymentRepository;
    private final ComplaintRepository complaintRepository;
    private final BookingRepository bookingRepository;
    private final PropertyRatingRepository propertyRatingRepository;
    private final FlatDetailsRepository flatDetailsRepository;
    private final PGBedRepository pgBedRepository;
    private final PropertyImageRepository propertyImageRepository;

    public OwnerDashboardDTO getDashboardData(String ownerUsername) {
        Owner owner = ownerRepository.findByUsername(ownerUsername)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        return OwnerDashboardDTO.builder()
                .stats(calculateDashboardStats(owner))
                .revenueAnalytics(calculateRevenueAnalytics(owner))
                .occupancyAnalytics(calculateOccupancyAnalytics(owner))
                .paymentAnalytics(calculatePaymentAnalytics(owner))
                .complaintAnalytics(calculateComplaintAnalytics(owner))
                .propertyPerformance(calculatePropertyPerformance(owner))
                .build();
    }

    private OwnerDashboardDTO.DashboardStatsDTO calculateDashboardStats(Owner owner) {
        Long totalProperties = propertyRepository.countByOwner(owner);
        Long activeTenants = tenantPropertyHistoryRepository.countActiveByPropertyOwnerId(owner.getId());
        
        // Count pending bookings
        List<Booking> pendingBookings = bookingRepository.findByPropertyOwner(owner.getId())
                .stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING)
                .collect(Collectors.toList());
        Long pendingRequests = (long) pendingBookings.size();
        
        // Count total bookings
        Long totalBookings = (long) bookingRepository.findByPropertyOwner(owner.getId()).size();
        
        // Count pending cash payments
        Long pendingCashPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentMethod() == PaymentMethod.CASH)
                .filter(p -> p.getPaymentStatus() == PaymentStatus.PENDING)
                .filter(p -> {
                    if (p.getBooking() != null) {
                        Property bookingProperty = propertyRepository.findById(p.getBooking().getPropertyId()).orElse(null);
                        return bookingProperty != null && bookingProperty.getOwner().getId().equals(owner.getId());
                    }
                    if (p.getTenantPropertyHistory() != null) {
                        return p.getTenantPropertyHistory().getOwner().getId().equals(owner.getId());
                    }
                    return false;
                })
                .count();
        
        // Count open complaints
        Long openComplaints = complaintRepository.findByOwnerIdOrderByReportedDateDesc(owner.getId())
                .stream()
                .filter(c -> c.getStatus() == ComplaintStatus.OPEN || c.getStatus() == ComplaintStatus.IN_PROGRESS)
                .count();

        return OwnerDashboardDTO.DashboardStatsDTO.builder()
                .totalProperties(totalProperties)
                .activeTenants(activeTenants)
                .pendingRequests(pendingRequests)
                .totalBookings(totalBookings)
                .pendingCashPayments(pendingCashPayments)
                .openComplaints(openComplaints)
                .build();
    }

    private OwnerDashboardDTO.RevenueAnalyticsDTO calculateRevenueAnalytics(Owner owner) {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate quarterStart = today.withMonth(today.getMonth().firstMonthOfQuarter().getValue()).withDayOfMonth(1);
        LocalDate yearStart = today.withDayOfYear(1);
        
        // Get all successful payments for owner's properties
        List<Payment> successfulPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .filter(p -> {
                    if (p.getBooking() != null) {
                        Property bookingProperty = propertyRepository.findById(p.getBooking().getPropertyId()).orElse(null);
                        return bookingProperty != null && bookingProperty.getOwner().getId().equals(owner.getId());
                    }
                    if (p.getTenantPropertyHistory() != null) {
                        return p.getTenantPropertyHistory().getOwner().getId().equals(owner.getId());
                    }
                    return false;
                })
                .collect(Collectors.toList());
        
        // Calculate monthly revenue
        double monthlyRevenue = successfulPayments.stream()
                .filter(p -> p.getTransactionDate() != null && 
                           p.getTransactionDate().toLocalDate().isAfter(monthStart.minusDays(1)))
                .mapToDouble(Payment::getAmount)
                .sum();
        
        // Calculate quarterly revenue
        double quarterlyRevenue = successfulPayments.stream()
                .filter(p -> p.getTransactionDate() != null && 
                           p.getTransactionDate().toLocalDate().isAfter(quarterStart.minusDays(1)))
                .mapToDouble(Payment::getAmount)
                .sum();
        
        // Calculate yearly revenue
        double yearlyRevenue = successfulPayments.stream()
                .filter(p -> p.getTransactionDate() != null && 
                           p.getTransactionDate().toLocalDate().isAfter(yearStart.minusDays(1)))
                .mapToDouble(Payment::getAmount)
                .sum();
        
        // Calculate previous month/quarter/year for growth rates
        LocalDate prevMonthStart = monthStart.minusMonths(1);
        double prevMonthRevenue = successfulPayments.stream()
                .filter(p -> p.getTransactionDate() != null && 
                           p.getTransactionDate().toLocalDate().isAfter(prevMonthStart.minusDays(1)) &&
                           p.getTransactionDate().toLocalDate().isBefore(monthStart))
                .mapToDouble(Payment::getAmount)
                .sum();
        
        double monthlyGrowth = prevMonthRevenue > 0 ? 
                ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;
        
        LocalDate prevQuarterStart = quarterStart.minusMonths(3);
        double prevQuarterRevenue = successfulPayments.stream()
                .filter(p -> p.getTransactionDate() != null && 
                           p.getTransactionDate().toLocalDate().isAfter(prevQuarterStart.minusDays(1)) &&
                           p.getTransactionDate().toLocalDate().isBefore(quarterStart))
                .mapToDouble(Payment::getAmount)
                .sum();
        
        double quarterlyGrowth = prevQuarterRevenue > 0 ? 
                ((quarterlyRevenue - prevQuarterRevenue) / prevQuarterRevenue) * 100 : 0;
        
        LocalDate prevYearStart = yearStart.minusYears(1);
        double prevYearRevenue = successfulPayments.stream()
                .filter(p -> p.getTransactionDate() != null && 
                           p.getTransactionDate().toLocalDate().isAfter(prevYearStart.minusDays(1)) &&
                           p.getTransactionDate().toLocalDate().isBefore(yearStart))
                .mapToDouble(Payment::getAmount)
                .sum();
        
        double yearlyGrowth = prevYearRevenue > 0 ? 
                ((yearlyRevenue - prevYearRevenue) / prevYearRevenue) * 100 : 0;
        
        // Calculate average monthly (last 6 months)
        double sixMonthRevenue = successfulPayments.stream()
                .filter(p -> p.getTransactionDate() != null && 
                           p.getTransactionDate().toLocalDate().isAfter(today.minusMonths(6)))
                .mapToDouble(Payment::getAmount)
                .sum();
        double averageMonthly = sixMonthRevenue / 6;
        
        // Generate monthly collection data for last 6 months
        List<OwnerDashboardDTO.MonthlyRevenueDataDTO> monthlyCollectionData = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        
        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = today.minusMonths(i);
            LocalDate monthStartDt = monthDate.withDayOfMonth(1);
            LocalDate monthEndDt = monthDate.withDayOfMonth(monthDate.lengthOfMonth());
            
            double collected = successfulPayments.stream()
                    .filter(p -> p.getTransactionDate() != null && 
                               !p.getTransactionDate().toLocalDate().isBefore(monthStartDt) &&
                               !p.getTransactionDate().toLocalDate().isAfter(monthEndDt))
                    .mapToDouble(Payment::getAmount)
                    .sum();
            
            // Calculate expected revenue from active tenants
            double expected = tenantPropertyHistoryRepository.findByPropertyOwnerId(owner.getId())
                    .stream()
                    .filter(h -> h.getStatus() == OccupancyStatus.ACTIVE)
                    .mapToDouble(TenantPropertyHistory::getMonthlyRent)
                    .sum();
            
            // Calculate late fees
            double lateFees = successfulPayments.stream()
                    .filter(p -> p.getTransactionDate() != null && 
                               !p.getTransactionDate().toLocalDate().isBefore(monthStartDt) &&
                               !p.getTransactionDate().toLocalDate().isAfter(monthEndDt))
                    .filter(p -> p.getTenantPropertyHistory() != null)
                    .mapToDouble(p -> {
                        TenantPropertyHistory history = p.getTenantPropertyHistory();
                        if (history.getNextRentDueDate() != null && p.getTransactionDate().toLocalDate().isAfter(history.getNextRentDueDate())) {
                            long daysOverdue = ChronoUnit.DAYS.between(history.getNextRentDueDate(), p.getTransactionDate().toLocalDate());
                            return Math.min(daysOverdue * 0.10 * history.getMonthlyRent(), 0.30 * history.getMonthlyRent());
                        }
                        return 0;
                    })
                    .sum();
            
            monthlyCollectionData.add(OwnerDashboardDTO.MonthlyRevenueDataDTO.builder()
                    .month(monthDate.format(monthFormatter))
                    .collected(collected)
                    .expected(expected)
                    .lateFees(lateFees)
                    .build());
        }
        
        return OwnerDashboardDTO.RevenueAnalyticsDTO.builder()
                .monthlyRevenue(monthlyRevenue)
                .monthlyGrowth(monthlyGrowth)
                .quarterlyRevenue(quarterlyRevenue)
                .quarterlyGrowth(quarterlyGrowth)
                .yearlyRevenue(yearlyRevenue)
                .yearlyGrowth(yearlyGrowth)
                .averageMonthly(averageMonthly)
                .monthlyCollectionData(monthlyCollectionData)
                .build();
    }

    private OwnerDashboardDTO.OccupancyAnalyticsDTO calculateOccupancyAnalytics(Owner owner) {
        List<Property> properties = propertyRepository.findByOwner(owner);
        
        long totalUnits = 0;
        long occupiedUnits = 0;
        
        for (Property property : properties) {
            if (property.getPropertyType() == PropertyType.FLAT) {
                totalUnits++;
                FlatDetails flatDetails = flatDetailsRepository.findByPropertyId(property.getId()).orElse(null);
                if (flatDetails != null && flatDetails.getIsOccupied()) {
                    occupiedUnits++;
                }
            } else if (property.getPropertyType() == PropertyType.PG) {
                List<PGRoom> rooms = pgBedRepository.findAll().stream()
                        .filter(bed -> bed.getPgRoom() != null && 
                                   bed.getPgRoom().getPgDetails() != null &&
                                   bed.getPgRoom().getPgDetails().getProperty().getId().equals(property.getId()))
                        .map(PGBed::getPgRoom)
                        .distinct()
                        .collect(Collectors.toList());
                
                for (PGRoom room : rooms) {
                    totalUnits += room.getTotalBeds();
                    occupiedUnits += room.getBeds().stream().filter(PGBed::getIsOccupied).count();
                }
            }
        }
        
        double currentOccupancyRate = totalUnits > 0 ? (double) occupiedUnits / totalUnits * 100 : 0;
        long availableUnits = totalUnits - occupiedUnits;
        
        // Generate occupancy trend for last 6 months
        List<OwnerDashboardDTO.OccupancyTrendDTO> occupancyTrend = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        
        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = LocalDate.now().minusMonths(i);
            // For simplicity, using current occupancy (in real app, would use historical data)
            occupancyTrend.add(OwnerDashboardDTO.OccupancyTrendDTO.builder()
                    .month(monthDate.format(monthFormatter))
                    .occupancyRate(currentOccupancyRate)
                    .totalUnits(totalUnits)
                    .occupiedUnits(occupiedUnits)
                    .build());
        }
        
        return OwnerDashboardDTO.OccupancyAnalyticsDTO.builder()
                .currentOccupancyRate(currentOccupancyRate)
                .occupancyTrend(occupancyTrend)
                .totalUnits(totalUnits)
                .occupiedUnits(occupiedUnits)
                .availableUnits(availableUnits)
                .build();
    }

    private OwnerDashboardDTO.PaymentAnalyticsDTO calculatePaymentAnalytics(Owner owner) {
        List<Payment> ownerPayments = paymentRepository.findAll().stream()
                .filter(p -> {
                    if (p.getBooking() != null) {
                        Property bookingProperty = propertyRepository.findById(p.getBooking().getPropertyId()).orElse(null);
                        return bookingProperty != null && bookingProperty.getOwner().getId().equals(owner.getId());
                    }
                    if (p.getTenantPropertyHistory() != null) {
                        return p.getTenantPropertyHistory().getOwner().getId().equals(owner.getId());
                    }
                    return false;
                })
                .collect(Collectors.toList());
        
        long totalPayments = ownerPayments.size();
        long successfulPayments = ownerPayments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .count();
        long failedPayments = ownerPayments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.FAILED)
                .count();
        long pendingPayments = ownerPayments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.PENDING)
                .count();
        
        double successRate = totalPayments > 0 ? (double) successfulPayments / totalPayments * 100 : 0;
        
        double totalAmount = ownerPayments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .mapToDouble(Payment::getAmount)
                .sum();
        
        // Payment method breakdown
        Map<String, Long> paymentMethodBreakdown = new HashMap<>();
        paymentMethodBreakdown.put("ONLINE", ownerPayments.stream()
                .filter(p -> p.getPaymentMethod() == PaymentMethod.ONLINE)
                .count());
        paymentMethodBreakdown.put("CASH", ownerPayments.stream()
                .filter(p -> p.getPaymentMethod() == PaymentMethod.CASH)
                .count());
        
        // Payment trend for last 6 months
        List<OwnerDashboardDTO.PaymentTrendDTO> paymentTrend = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        
        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = LocalDate.now().minusMonths(i);
            LocalDate monthStart = monthDate.withDayOfMonth(1);
            LocalDate monthEnd = monthDate.withDayOfMonth(monthDate.lengthOfMonth());
            
            List<Payment> monthPayments = ownerPayments.stream()
                    .filter(p -> p.getTransactionDate() != null && 
                               !p.getTransactionDate().toLocalDate().isBefore(monthStart) &&
                               !p.getTransactionDate().toLocalDate().isAfter(monthEnd))
                    .collect(Collectors.toList());
            
            long monthTotal = monthPayments.size();
            double monthAmount = monthPayments.stream()
                    .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                    .mapToDouble(Payment::getAmount)
                    .sum();
            double monthSuccessRate = monthTotal > 0 ? 
                    (double) monthPayments.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS).count() / monthTotal * 100 : 0;
            
            paymentTrend.add(OwnerDashboardDTO.PaymentTrendDTO.builder()
                    .month(monthDate.format(monthFormatter))
                    .totalPayments(monthTotal)
                    .totalAmount(monthAmount)
                    .successRate(monthSuccessRate)
                    .build());
        }
        
        return OwnerDashboardDTO.PaymentAnalyticsDTO.builder()
                .totalPayments(totalPayments)
                .successfulPayments(successfulPayments)
                .failedPayments(failedPayments)
                .pendingPayments(pendingPayments)
                .successRate(successRate)
                .totalAmount(totalAmount)
                .paymentMethodBreakdown(paymentMethodBreakdown)
                .paymentTrend(paymentTrend)
                .build();
    }

    private OwnerDashboardDTO.ComplaintAnalyticsDTO calculateComplaintAnalytics(Owner owner) {
        List<Complaint> complaints = complaintRepository.findByOwnerIdOrderByReportedDateDesc(owner.getId());
        
        long totalComplaints = complaints.size();
        long openComplaints = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.OPEN)
                .count();
        long resolvedComplaints = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED)
                .count();
        long inProgressComplaints = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.IN_PROGRESS)
                .count();
        
        // Calculate average resolution time
        double averageResolutionTime = complaints.stream()
                .filter(c -> c.getResolvedDate() != null)
                .mapToLong(c -> ChronoUnit.DAYS.between(c.getReportedDate(), c.getResolvedDate()))
                .average()
                .orElse(0);
        
        // Complaints by category
        Map<String, Long> complaintsByCategory = complaints.stream()
                .collect(Collectors.groupingBy(c -> c.getCategory().name(), Collectors.counting()));
        
        // Complaints by status
        Map<String, Long> complaintsByStatus = complaints.stream()
                .collect(Collectors.groupingBy(c -> c.getStatus().name(), Collectors.counting()));
        
        // Complaint trend for last 6 months
        List<OwnerDashboardDTO.ComplaintTrendDTO> complaintTrend = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        
        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = LocalDate.now().minusMonths(i);
            LocalDate monthStart = monthDate.withDayOfMonth(1);
            LocalDate monthEnd = monthDate.withDayOfMonth(monthDate.lengthOfMonth());
            
            List<Complaint> monthComplaints = complaints.stream()
                    .filter(c -> !c.getReportedDate().isBefore(monthStart) && 
                               !c.getReportedDate().isAfter(monthEnd))
                    .collect(Collectors.toList());
            
            long monthTotal = monthComplaints.size();
            long monthResolved = monthComplaints.stream()
                    .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED)
                    .count();
            
            complaintTrend.add(OwnerDashboardDTO.ComplaintTrendDTO.builder()
                    .month(monthDate.format(monthFormatter))
                    .totalComplaints(monthTotal)
                    .resolvedComplaints(monthResolved)
                    .build());
        }
        
        return OwnerDashboardDTO.ComplaintAnalyticsDTO.builder()
                .totalComplaints(totalComplaints)
                .openComplaints(openComplaints)
                .resolvedComplaints(resolvedComplaints)
                .inProgressComplaints(inProgressComplaints)
                .averageResolutionTime(averageResolutionTime)
                .complaintsByCategory(complaintsByCategory)
                .complaintsByStatus(complaintsByStatus)
                .complaintTrend(complaintTrend)
                .build();
    }

    private List<OwnerDashboardDTO.PropertyPerformanceDTO> calculatePropertyPerformance(Owner owner) {
        List<Property> properties = propertyRepository.findByOwner(owner);
        
        return properties.stream().map(property -> {
            // Calculate monthly revenue for this property
            double monthlyRevenue = tenantPropertyHistoryRepository.findByPropertyOwnerId(owner.getId())
                    .stream()
                    .filter(h -> h.getProperty().getId().equals(property.getId()) && 
                               h.getStatus() == OccupancyStatus.ACTIVE)
                    .mapToDouble(TenantPropertyHistory::getMonthlyRent)
                    .sum();
            
            // Calculate occupancy rate for this property
            long totalUnits = 0;
            long occupiedUnits = 0;
            
            if (property.getPropertyType() == PropertyType.FLAT) {
                totalUnits = 1;
                FlatDetails flatDetails = flatDetailsRepository.findByPropertyId(property.getId()).orElse(null);
                if (flatDetails != null && flatDetails.getIsOccupied()) {
                    occupiedUnits = 1;
                }
            } else if (property.getPropertyType() == PropertyType.PG) {
                List<PGBed> beds = pgBedRepository.findAll().stream()
                        .filter(bed -> bed.getPgRoom() != null && 
                                   bed.getPgRoom().getPgDetails() != null &&
                                   bed.getPgRoom().getPgDetails().getProperty().getId().equals(property.getId()))
                        .collect(Collectors.toList());
                totalUnits = beds.size();
                occupiedUnits = beds.stream().filter(PGBed::getIsOccupied).count();
            }
            
            double occupancyRate = totalUnits > 0 ? (double) occupiedUnits / totalUnits * 100 : 0;
            
            // Get tenant counts
            long totalTenants = tenantPropertyHistoryRepository.findByPropertyOwnerId(owner.getId())
                    .stream()
                    .filter(h -> h.getProperty().getId().equals(property.getId()))
                    .count();
            
            long activeTenants = tenantPropertyHistoryRepository.findByPropertyOwnerId(owner.getId())
                    .stream()
                    .filter(h -> h.getProperty().getId().equals(property.getId()) && 
                               h.getStatus() == OccupancyStatus.ACTIVE)
                    .count();
            
            // Get average rating
            Double averageRating = propertyRatingRepository.findAverageRatingByPropertyId(property.getId());
            
            // Get total complaints
            long totalComplaints = complaintRepository.findByPropertyIdOrderByReportedDateDesc(property.getId())
                    .size();
            
            return OwnerDashboardDTO.PropertyPerformanceDTO.builder()
                    .propertyId(property.getId())
                    .propertyName(property.getTitle())
                    .propertyType(property.getPropertyType().name())
                    .monthlyRevenue(monthlyRevenue)
                    .occupancyRate(occupancyRate)
                    .totalTenants(totalTenants)
                    .activeTenants(activeTenants)
                    .averageRating(averageRating != null ? averageRating : 0.0)
                    .totalComplaints(totalComplaints)
                    .build();
        }).collect(Collectors.toList());
    }

    public OwnerRevenueDTO getRevenueData(String ownerUsername) {
        Owner owner = ownerRepository.findByUsername(ownerUsername)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);

        // Get all properties for the owner
        List<Property> properties = propertyRepository.findByOwner(owner);

        List<OwnerRevenueDTO.PropertyRevenueDTO> propertyRevenueList = new ArrayList<>();
        long pendingPayments = 0;
        long overduePayments = 0;
        double receivedThisMonth = 0;
        double totalRevenue = 0;

        for (Property property : properties) {
            // Get all tenant property histories for this property
            List<TenantPropertyHistory> histories = tenantPropertyHistoryRepository.findByPropertyOwnerId(owner.getId())
                    .stream()
                    .filter(h -> h.getProperty().getId().equals(property.getId()))
                    .filter(h -> h.getStatus() == OccupancyStatus.ACTIVE)
                    .collect(Collectors.toList());

            List<OwnerRevenueDTO.TenantPaymentDTO> tenantPaymentList = new ArrayList<>();
            long propertyPending = 0;
            long propertyOverdue = 0;
            double propertyMonthlyRent = 0;

            for (TenantPropertyHistory history : histories) {
                // Calculate payment status
                String paymentStatus = "paid";
                LocalDate paymentDate = null;
                LocalDate dueDate = history.getNextRentDueDate() != null ? history.getNextRentDueDate() : today.withDayOfMonth(1);

                // Get the latest payment for this tenant
                Payment latestPayment = paymentRepository.findByTenantPropertyHistoryId(history.getId())
                        .stream()
                        .filter(p -> p.getTransactionDate() != null && 
                                   p.getTransactionDate().toLocalDate().isAfter(monthStart.minusDays(1)))
                        .max(Comparator.comparing(Payment::getTransactionDate))
                        .orElse(null);

                if (latestPayment != null && latestPayment.getPaymentStatus() == PaymentStatus.SUCCESS) {
                    paymentDate = latestPayment.getTransactionDate().toLocalDate();
                    paymentStatus = "paid";
                    receivedThisMonth += latestPayment.getAmount();
                } else if (dueDate.isBefore(today)) {
                    paymentStatus = "overdue";
                    propertyOverdue++;
                    overduePayments++;
                } else if (ChronoUnit.DAYS.between(today, dueDate) <= 5) {
                    // Only count as pending if due date is within 5 days
                    paymentStatus = "pending";
                    propertyPending++;
                    pendingPayments++;
                } else {
                    // Due date is more than 5 days away - not counted as pending
                    paymentStatus = "upcoming";
                }

                propertyMonthlyRent += history.getMonthlyRent();

                // Get tenant details
                User tenant = history.getTenant();
                if (tenant != null) {
                    String tenantName = tenant.getUsername();
                    String tenantPhone = null;
                    
                    // If tenant is actually a Tenant object, get full name and phone
                    if (tenant instanceof Tenant) {
                        Tenant tenantEntity = (Tenant) tenant;
                        tenantName = tenantEntity.getFullName() != null ? tenantEntity.getFullName() : tenant.getUsername();
                        tenantPhone = tenantEntity.getPhoneNumber();
                    }
                    
                    OwnerRevenueDTO.TenantPaymentDTO tenantPayment = OwnerRevenueDTO.TenantPaymentDTO.builder()
                            .id(tenant.getId())
                            .name(tenantName)
                            .email(tenant.getEmail())
                            .phone(tenantPhone)
                            .unitNumber(getUnitNumber(history, property))
                            .monthlyRent(history.getMonthlyRent())
                            .paymentStatus(paymentStatus)
                            .paymentDate(paymentDate)
                            .dueDate(dueDate)
                            .build();
                    tenantPaymentList.add(tenantPayment);
                }
            }

            totalRevenue += propertyMonthlyRent;

            // Determine overall property status (only consider pending and overdue, not upcoming)
            String overallStatus;
            if (propertyOverdue > 0) {
                overallStatus = "overdue";
            } else if (propertyPending > 0) {
                overallStatus = "some_pending";
            } else {
                overallStatus = "all_paid";
            }

            // Get property image (first image if available)
            String imageUrl = null;
            List<PropertyImage> images = propertyImageRepository.findByPropertyId(property.getId());
            if (!images.isEmpty()) {
                imageUrl = images.get(0).getImageUrl();
            }

            OwnerRevenueDTO.PropertyRevenueDTO propertyRevenue = OwnerRevenueDTO.PropertyRevenueDTO.builder()
                    .id(property.getId())
                    .title(property.getTitle())
                    .address(property.getAddress())
                    .monthlyRent(propertyMonthlyRent)
                    .overallStatus(overallStatus)
                    .imageUrl(imageUrl)
                    .tenants(tenantPaymentList)
                    .build();

            propertyRevenueList.add(propertyRevenue);
        }

        return OwnerRevenueDTO.builder()
                .pendingPayments(pendingPayments)
                .overduePayments(overduePayments)
                .receivedThisMonth(receivedThisMonth)
                .totalRevenue(totalRevenue)
                .properties(propertyRevenueList)
                .build();
    }

    private String getUnitNumber(TenantPropertyHistory history, Property property) {
        if (history.getFlatDetails() != null) {
            return history.getFlatDetails().getFlatNumber();
        } else if (history.getPgBed() != null && history.getPgBed().getPgRoom() != null) {
            return history.getPgBed().getPgRoom().getRoomNumber();
        }
        return "N/A";
    }
}
