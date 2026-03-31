package com.smartrent.connect.smartrentconnect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "guest_passes")
@NoArgsConstructor
@AllArgsConstructor
public class GuestPass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pass_id", unique = true, nullable = false)
    private String passId;

    @NotBlank(message = "Visitor name is required")
    @Column(name = "visitor_name", nullable = false, length = 100)
    private String visitorName;

    @NotBlank(message = "Visitor mobile is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be 10 digits")
    @Column(name = "visitor_mobile", nullable = false, length = 10)
    private String visitorMobile;

    @Column(name = "visitor_image")
    private String visitorImage; // URL to image

    @NotNull(message = "Visit date and time is required")
    @Column(name = "visit_date_time", nullable = false)
    private LocalDateTime visitDateTime;

    @NotNull(message = "Number of guests is required")
    @Positive(message = "Number of guests must be positive")
    @Column(name = "number_of_guests", nullable = false)
    private Integer numberOfGuests;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private GuestPassStatus status = GuestPassStatus.ACTIVE;

    @Column(name = "entry_time")
    private LocalDateTime entryTime;

    @Column(name = "exit_time")
    private LocalDateTime exitTime;

    @Column(name = "verified_by")
    private String verifiedBy; // Watchman username

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    public enum GuestPassStatus {
        ACTIVE, USED, EXPIRED, CANCELLED
    }

    @PrePersist
    public void prePersist() {
        if (this.passId == null) {
            this.passId = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = GuestPassStatus.ACTIVE;
        }
        if (this.expiresAt == null) {
            // Set expiry to 24 hours after visit time
            this.expiresAt = this.visitDateTime.plusHours(24);
        }
    }

    // Explicit getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPassId() { return passId; }
    public void setPassId(String passId) { this.passId = passId; }

    public String getVisitorName() { return visitorName; }
    public void setVisitorName(String visitorName) { this.visitorName = visitorName; }

    public String getVisitorMobile() { return visitorMobile; }
    public void setVisitorMobile(String visitorMobile) { this.visitorMobile = visitorMobile; }

    public String getVisitorImage() { return visitorImage; }
    public void setVisitorImage(String visitorImage) { this.visitorImage = visitorImage; }

    public LocalDateTime getVisitDateTime() { return visitDateTime; }
    public void setVisitDateTime(LocalDateTime visitDateTime) { this.visitDateTime = visitDateTime; }

    public Integer getNumberOfGuests() { return numberOfGuests; }
    public void setNumberOfGuests(Integer numberOfGuests) { this.numberOfGuests = numberOfGuests; }

    public Tenant getTenant() { return tenant; }
    public void setTenant(Tenant tenant) { this.tenant = tenant; }

    public GuestPassStatus getStatus() { return status; }
    public void setStatus(GuestPassStatus status) { this.status = status; }

    public LocalDateTime getEntryTime() { return entryTime; }
    public void setEntryTime(LocalDateTime entryTime) { this.entryTime = entryTime; }

    public LocalDateTime getExitTime() { return exitTime; }
    public void setExitTime(LocalDateTime exitTime) { this.exitTime = exitTime; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
