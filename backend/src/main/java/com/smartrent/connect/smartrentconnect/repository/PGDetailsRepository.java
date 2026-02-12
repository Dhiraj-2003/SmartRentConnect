package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.PGDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PGDetailsRepository extends JpaRepository<PGDetails, Long> {
    
    Optional<PGDetails> findByPropertyId(Long propertyId);
    
    boolean existsByPropertyId(Long propertyId);
    
    @Query("SELECT pgd FROM PGDetails pgd JOIN pgd.property p WHERE p.owner.id = :ownerId")
    java.util.List<PGDetails> findByOwnerId(Long ownerId);
}
