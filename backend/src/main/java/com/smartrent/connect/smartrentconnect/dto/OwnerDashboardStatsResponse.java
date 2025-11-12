package com.smartrent.connect.smartrentconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerDashboardStatsResponse {
    private Long totalProperties;
    private Long approvedProperties;
    private Long pendingProperties;
    private Long activeTenants;
    private Long pendingRequests;
    private Double occupancyRate;
}
