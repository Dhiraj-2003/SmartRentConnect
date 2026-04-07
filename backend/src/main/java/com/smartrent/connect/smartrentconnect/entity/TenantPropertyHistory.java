package com.smartrent.connect.smartrentconnect.entity;

import com.smartrent.connect.smartrentconnect.enums.BookingType;
import com.smartrent.connect.smartrentconnect.enums.OccupancyStatus;
import com.smartrent.connect.smartrentconnect.enums.PaymentModePreference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenant_property_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantPropertyHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tenant
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    // Owner
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    // Main Property
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    // For FLAT booking only
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flat_details_id")
    private FlatDetails flatDetails;

    // For PG booking only
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pg_bed_id")
    private PGBed pgBed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingType bookingType;

    @Column(nullable = false)
    private Double depositAmount;

    @Column(nullable = false)
    private Double monthlyRent;

    @Column(nullable = false)
    private LocalDate bookingDate;

    private LocalDate occupancyStartDate;

    @Column(nullable = false)
    private LocalDate nextRentDueDate;

    private LocalDate lastPaidDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OccupancyStatus status;

    private LocalDate releaseDate;

    private String releaseReason;

    @Enumerated(EnumType.STRING)
    private PaymentModePreference paymentModePreference;

    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
