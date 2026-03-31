package com.smartrent.connect.smartrentconnect.entity;

import com.smartrent.connect.smartrentconnect.enums.GenderType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "pg_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PGDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "property_id", nullable = false, unique = true)
    private Property property;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender_allowed", nullable = false, length = 10)
    private GenderType genderAllowed;

    @NotNull(message = "Food included is required")
    @Column(name = "food_included", nullable = false)
    private Boolean foodIncluded;

    @OneToMany(mappedBy = "pgDetails", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PGRoom> rooms;
}
