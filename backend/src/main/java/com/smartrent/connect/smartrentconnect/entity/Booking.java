package com.smartrent.connect.smartrentconnect.entity;

import com.smartrent.connect.smartrentconnect.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "booking")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tenant_id", nullable = false)
    private User tenant;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "flat_details_id")
    private FlatDetails flatDetails;

    @Column(name = "pg_bed_id")
    private Long pgBedId;
    
    @Column(name = "booking_date")
    private LocalDateTime bookingDate;
    
    @Column(name = "move_in_date")
    private LocalDateTime moveInDate;
    
    @Column(name = "deposit_amount", nullable = false)
    private Double depositAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BookingStatus status;

}
