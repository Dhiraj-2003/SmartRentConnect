package com.smartrent.connect.smartrentconnect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "pg_bed")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PGBed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pgRoomId", nullable = false)
    private PGRoom pgRoom;

    @NotNull(message = "Bed number is required")
    @Column(name = "bedNumber", nullable = false)
    private Integer bedNumber;

    @NotNull(message = "Occupied status is required")
    @Column(name = "isOccupied", nullable = false)
    @Builder.Default
    private Boolean isOccupied = false;
}
