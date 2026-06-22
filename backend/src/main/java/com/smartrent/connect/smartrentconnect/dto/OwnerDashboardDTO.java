package com.smartrent.connect.smartrentconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerDashboardDTO {
    
    // Basic Stats
    private DashboardStatsDTO stats;
    
    // Revenue Analytics
    private RevenueAnalyticsDTO revenueAnalytics;
    
    // Occupancy Analytics
    private OccupancyAnalyticsDTO occupancyAnalytics;
    
    // Payment Analytics
    private PaymentAnalyticsDTO paymentAnalytics;
    
    // Complaint Analytics
    private ComplaintAnalyticsDTO complaintAnalytics;
    
    // Property Performance
    private List<PropertyPerformanceDTO> propertyPerformance;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStatsDTO {
        private Long totalProperties;
        private Long activeTenants;
        private Long pendingRequests;
        private Long totalBookings;
        private Long pendingCashPayments;
        private Long openComplaints;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueAnalyticsDTO {
        private Double monthlyRevenue;
        private Double monthlyGrowth;
        private Double quarterlyRevenue;
        private Double quarterlyGrowth;
        private Double yearlyRevenue;
        private Double yearlyGrowth;
        private Double averageMonthly;
        private List<MonthlyRevenueDataDTO> monthlyCollectionData;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenueDataDTO {
        private String month;
        private Double collected;
        private Double expected;
        private Double lateFees;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OccupancyAnalyticsDTO {
        private Double currentOccupancyRate;
        private List<OccupancyTrendDTO> occupancyTrend;
        private Long totalUnits;
        private Long occupiedUnits;
        private Long availableUnits;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OccupancyTrendDTO {
        private String month;
        private Double occupancyRate;
        private Long totalUnits;
        private Long occupiedUnits;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentAnalyticsDTO {
        private Long totalPayments;
        private Long successfulPayments;
        private Long failedPayments;
        private Long pendingPayments;
        private Double successRate;
        private Double totalAmount;
        private Map<String, Long> paymentMethodBreakdown; // ONLINE vs CASH
        private List<PaymentTrendDTO> paymentTrend;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentTrendDTO {
        private String month;
        private Long totalPayments;
        private Double totalAmount;
        private Double successRate;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComplaintAnalyticsDTO {
        private Long totalComplaints;
        private Long openComplaints;
        private Long resolvedComplaints;
        private Long inProgressComplaints;
        private Double averageResolutionTime; // in days
        private Map<String, Long> complaintsByCategory;
        private Map<String, Long> complaintsByStatus;
        private List<ComplaintTrendDTO> complaintTrend;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComplaintTrendDTO {
        private String month;
        private Long totalComplaints;
        private Long resolvedComplaints;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PropertyPerformanceDTO {
        private Long propertyId;
        private String propertyName;
        private String propertyType;
        private Double monthlyRevenue;
        private Double occupancyRate;
        private Long totalTenants;
        private Long activeTenants;
        private Double averageRating;
        private Long totalComplaints;
    }
}
