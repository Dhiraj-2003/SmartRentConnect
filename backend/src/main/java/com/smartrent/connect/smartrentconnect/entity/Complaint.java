package com.smartrent.connect.smartrentconnect.entity;

import com.smartrent.connect.smartrentconnect.enums.ComplaintCategory;
import com.smartrent.connect.smartrentconnect.enums.ComplaintPriority;
import com.smartrent.connect.smartrentconnect.enums.ComplaintStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tenant who raised complaint
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    // Owner of property
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    // Main property
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    // For flat-specific issue
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "flat_details_id")
    private FlatDetails flatDetails;

    // For PG-specific issue
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pg_bed_id")
    private PGBed pgBed;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status;

    @Enumerated(EnumType.STRING)
    private ComplaintPriority priority;

    @Column(nullable = false)
    private LocalDate reportedDate;

    private LocalDate resolvedDate;

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<ComplaintImage> complaintImages;

    @Column(columnDefinition = "TEXT")
    private String responseMessage;

    private String assignedTo;

    private Boolean isActive = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        if (this.reportedDate == null) {
            this.reportedDate = LocalDate.now();
        }

        if (this.status == null) {
            this.status = ComplaintStatus.OPEN;
        }

        if (this.priority == null) {
            this.priority = ComplaintPriority.MEDIUM;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
