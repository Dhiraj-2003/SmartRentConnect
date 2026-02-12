package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.PGBed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PGBedRepository extends JpaRepository<PGBed, Long> {
    
    List<PGBed> findByPgRoomId(Long pgRoomId);
    
    List<PGBed> findByPgRoomIdAndIsOccupied(Long pgRoomId, Boolean isOccupied);
    
    Optional<PGBed> findByPgRoomIdAndBedNumber(Long pgRoomId, Integer bedNumber);
    
    @Query("SELECT pb FROM PGBed pb WHERE pb.pgRoom.pgDetails.property.id = :propertyId")
    List<PGBed> findByPropertyId(@Param("propertyId") Long propertyId);
    
    @Query("SELECT pb FROM PGBed pb WHERE pb.pgRoom.pgDetails.property.id = :propertyId AND pb.isOccupied = false")
    List<PGBed> findAvailableBedsByPropertyId(@Param("propertyId") Long propertyId);
    
    @Query("SELECT COUNT(pb) FROM PGBed pb WHERE pb.pgRoom.pgDetails.property.id = :propertyId AND pb.isOccupied = false")
    Long countAvailableBedsByPropertyId(@Param("propertyId") Long propertyId);
    
    @Query("SELECT pb FROM PGBed pb WHERE pb.pgRoom.pgDetails.property.id = :propertyId AND pb.pgRoom.sharingType = :sharingType AND pb.isOccupied = false")
    List<PGBed> findAvailableBedsByPropertyIdAndSharingType(@Param("propertyId") Long propertyId, @Param("sharingType") String sharingType);
    
    // Bulk bed management methods
    @Modifying
    @Query("DELETE FROM PGBed pb WHERE pb.pgRoom.id = :pgRoomId")
    void deleteByPGRoomId(@Param("pgRoomId") Long pgRoomId);
    
    @Query("SELECT COUNT(pb) FROM PGBed pb WHERE pb.pgRoom.pgDetails.id = :pgDetailsId")
    long countByPgDetailsId(@Param("pgDetailsId") Long pgDetailsId);
    
    @Query("SELECT COUNT(pb) FROM PGBed pb WHERE pb.pgRoom.pgDetails.id = :pgDetailsId AND pb.isOccupied = false")
    long countAvailableBedsByPgDetailsId(@Param("pgDetailsId") Long pgDetailsId);
}
