package com.smartrent.connect.smartrentconnect.entity;

import com.smartrent.connect.smartrentconnect.enums.PropertyType;
import com.smartrent.connect.smartrentconnect.enums.PropertyStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "property")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "propertyType", nullable = false, length = 10)
    private PropertyType propertyType;

    @NotBlank(message = "Description is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ownerId", nullable = false)
    private Owner owner;

    @NotBlank(message = "Address is required")
    @Column(nullable = false, length = 500)
    private String address;

    @NotBlank(message = "City is required")
    @Column(nullable = false, length = 100)
    private String city;

    @NotBlank(message = "State is required")
    @Column(nullable = false, length = 100)
    private String state;

    @NotBlank(message = "Pincode is required")
    @Column(nullable = false, length = 10)
    private String pincode;

    @NotNull(message = "Deposit is required")
    @Positive(message = "Deposit must be positive")
    @Column(nullable = false)
    private Double deposit;

    @Column(columnDefinition = "TEXT")
    private String amenities; // JSON string of amenities

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PropertyStatus status = PropertyStatus.PENDING;

    @Column(name = "rejectionReason")
    private String rejectionReason;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PropertyImage> images;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PropertyDocument> documents;

    @OneToOne(mappedBy = "property", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private FlatDetails flatDetails;

    @OneToOne(mappedBy = "property", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private PGDetails pgDetails;

    @Column(name = "createdAt")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updatedAt")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    public void created(){
        this.createdAt=LocalDateTime.now();
    }
}
