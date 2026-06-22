package com.smartrent.connect.smartrentconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerRevenueDTO {
    private Long pendingPayments;
    private Long overduePayments;
    private Double receivedThisMonth;
    private Double totalRevenue;
    private List<PropertyRevenueDTO> properties;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PropertyRevenueDTO {
        private Long id;
        private String title;
        private String address;
        private Double monthlyRent;
        private String overallStatus; // 'all_paid', 'some_pending', 'overdue'
        private String imageUrl;
        private List<TenantPaymentDTO> tenants;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TenantPaymentDTO {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String unitNumber;
        private Double monthlyRent;
        private String paymentStatus; // 'paid', 'pending', 'overdue'
        private LocalDate paymentDate;
        private LocalDate dueDate;
    }
}
