package com.smartrent.connect.smartrentconnect.entity;

import com.smartrent.connect.smartrentconnect.enums.SharingType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "pg_room")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PGRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pgDetailsId", nullable = false)
    private PGDetails pgDetails;

    @NotBlank(message = "Room number is required")
    @Column(name = "roomNumber", nullable = false, length = 20)
    private String roomNumber;

    @NotNull(message = "Floor number is required")
    @Column(name = "floorNumber", nullable = false)
    private Integer floorNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "sharingType", nullable = false, length = 10)
    private SharingType sharingType;

    @NotNull(message = "Total beds is required")
    @Column(name = "totalBeds", nullable = false)
    private Integer totalBeds;

    @NotNull(message = "Bathrooms is required")
    @Column(name = "bathrooms", nullable = false)
    private Integer bathrooms;

    @NotNull(message = "Price per bed is required")
    @Positive(message = "Price must be positive")
    @Column(name = "pricePerBed", nullable = false)
    private Double pricePerBed;

    @OneToMany(mappedBy = "pgRoom", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PGBed> beds;
}
