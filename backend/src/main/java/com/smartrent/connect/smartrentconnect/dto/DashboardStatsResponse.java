package com.smartrent.connect.smartrentconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Long totalProperties;
    private Long totalTenants;
    private Long totalOwners;
    private Long totalWatchmen;
    private Long activeRentals;
    private Long pendingApprovals;
    private Double totalRevenue;
    private Double monthlyRevenue;
    private Long totalGuestPasses;
    private Long activeGuestPasses;
    private Long totalReviews;
    private Double averageRating;
}
