package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByTenantId(Long tenantId);
    
    List<Booking> findByPropertyId(Long propertyId);
    
    Optional<Booking> findByIdAndTenantId(Long id, Long tenantId);
    
    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND b.tenant.id = :tenantId")
    List<Booking> findPendingBookingsByTenant(Long tenantId);

    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND b.propertyId IN (SELECT p.id FROM Property p WHERE p.owner.id = :ownerId)")
    List<Booking> findPendingBookingsByOwner(Long ownerId);
    
    @Query("SELECT b FROM Booking b WHERE b.propertyId IN (SELECT p.id FROM Property p WHERE p.owner.id = :ownerId)")
    List<Booking> findByPropertyOwner(Long ownerId);
    
    @Query("SELECT b FROM Booking b WHERE b.flatDetails.id = :flatDetailsId AND b.status = 'PENDING'")
    Optional<Booking> findPendingBookingByFlatDetailsId(Long flatDetailsId);
    
    @Query("SELECT b FROM Booking b WHERE b.pgBedId = :pgBedId AND b.status = 'PENDING'")
    Optional<Booking> findPendingBookingByPgBedId(Long pgBedId);
}
