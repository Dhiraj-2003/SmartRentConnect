package com.smartrent.connect.smartrentconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserActivityStatsResponse {
    private NewRegistrations newRegistrations;
    private ActiveUsers activeUsers;
    private UserDistribution userDistribution;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NewRegistrations {
        private Integer thisMonth;
        private Integer lastMonth;
        private Double growth;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActiveUsers {
        private Integer daily;
        private Integer weekly;
        private Integer monthly;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDistribution {
        private Long tenants;
        private Long owners;
        private Long watchmen;
        private Long admins;
        private Long totalUsers;
    }
}
