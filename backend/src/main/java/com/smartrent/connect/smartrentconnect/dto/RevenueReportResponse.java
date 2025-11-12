package com.smartrent.connect.smartrentconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueReportResponse {
    private Double totalRevenue;
    private Double monthlyRevenue;
    private Double yearlyRevenue;
    private List<MonthlyRevenue> monthlyBreakdown;
    private Map<String, Double> propertyWiseRevenue;
    private Map<String, Double> ownerWiseRevenue;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private String month;
        private Double revenue;
        private Integer year;
        private LocalDate date;
    }
}
