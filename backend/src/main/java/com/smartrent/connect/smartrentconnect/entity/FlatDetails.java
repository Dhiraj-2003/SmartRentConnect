package com.smartrent.connect.smartrentconnect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Entity
@Table(name = "flat_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlatDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "property_id", nullable = false, unique = true)
    private Property property;

    @NotBlank(message = "BHK type is required")
    @Column(name = "bhkType", nullable = false, length = 20)
    private String bhkType; // e.g., 1BHK, 2BHK, 3BHK

    @NotNull(message = "Rent per month is required")
    @Positive(message = "Rent must be positive")
    @Column(name = "rentPerMonth", nullable = false)
    private Double rentPerMonth;

    @NotNull(message = "Total rooms is required")
    @Column(name = "totalRooms", nullable = false)
    private Integer totalRooms;

    @NotNull(message = "Bathrooms is required")
    @Column(name = "bathrooms", nullable = false)
    private Integer bathrooms;

    @NotBlank(message = "Furnishing type is required")
    @Column(name = "furnishingType", nullable = false, length = 50)
    private String furnishingType; // e.g., FURNISHED, SEMI_FURNISHED, UNFURNISHED

    @NotBlank(message = "Flat number is required")
    @Column(name = "flatNumber", nullable = false, length = 20)
    private String flatNumber;
}
