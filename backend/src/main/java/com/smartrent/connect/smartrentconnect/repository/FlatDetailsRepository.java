package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.FlatDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FlatDetailsRepository extends JpaRepository<FlatDetails, Long> {
    
    Optional<FlatDetails> findByPropertyId(Long propertyId);
    
    boolean existsByPropertyId(Long propertyId);
    
    @Query("SELECT fd FROM FlatDetails fd JOIN fd.property p WHERE p.owner.id = :ownerId")
    java.util.List<FlatDetails> findByOwnerId(Long ownerId);
}
