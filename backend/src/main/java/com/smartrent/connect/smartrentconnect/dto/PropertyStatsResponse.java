package com.smartrent.connect.smartrentconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyStatsResponse {
    private Integer totalListings;
    private Integer approvedListings;
    private Integer pendingApproval;
    private Integer rejectedListings;
    private Double averageRent;
    private Double occupancyRate;
    private PropertyTypeDistribution propertyTypeDistribution;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PropertyTypeDistribution {
        private Long flats;
        private Long pgs;
        private Long total;
    }
}
