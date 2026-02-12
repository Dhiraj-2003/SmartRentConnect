package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.PGRoom;
import com.smartrent.connect.smartrentconnect.enums.SharingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PGRoomRepository extends JpaRepository<PGRoom, Long> {
    
    List<PGRoom> findByPgDetailsId(Long pgDetailsId);
    
    Optional<PGRoom> findByPgDetailsIdAndRoomNumber(Long pgDetailsId, String roomNumber);
    
    List<PGRoom> findByPgDetailsIdAndSharingType(Long pgDetailsId, SharingType sharingType);
    
    @Query("SELECT pr FROM PGRoom pr WHERE pr.pgDetails.property.id = :propertyId")
    List<PGRoom> findByPropertyId(@Param("propertyId") Long propertyId);
    
    @Query("SELECT pr FROM PGRoom pr JOIN pr.pgDetails pgd JOIN pgd.property p WHERE p.owner.id = :ownerId")
    List<PGRoom> findByOwnerId(@Param("ownerId") Long ownerId);
    
    // Bulk room management methods
    @Modifying
    @Query("DELETE FROM PGRoom pr WHERE pr.pgDetails.id = :pgDetailsId")
    void deleteByPgDetailsId(@Param("pgDetailsId") Long pgDetailsId);
    
    @Query("SELECT COUNT(pr) FROM PGRoom pr WHERE pr.pgDetails.id = :pgDetailsId")
    long countByPgDetailsId(@Param("pgDetailsId") Long pgDetailsId);
    
    @Query("SELECT pr FROM PGRoom pr WHERE pr.pgDetails.id = :pgDetailsId ORDER BY pr.floorNumber ASC, pr.roomNumber ASC")
    List<PGRoom> findByPgDetailsIdOrderByFloorAndRoom(@Param("pgDetailsId") Long pgDetailsId);
}
