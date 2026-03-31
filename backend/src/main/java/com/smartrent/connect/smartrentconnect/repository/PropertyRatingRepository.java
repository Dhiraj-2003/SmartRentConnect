package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.PropertyRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRatingRepository extends JpaRepository<PropertyRating, Long> {
    
    List<PropertyRating> findByPropertyId(Long propertyId);
    
    Optional<PropertyRating> findByPropertyIdAndTenantId(Long propertyId, Long tenantId);
    
    boolean existsByPropertyIdAndTenantId(Long propertyId, Long tenantId);
    
    @Query("SELECT AVG(pr.rating) FROM PropertyRating pr WHERE pr.property.id = :propertyId")
    Double findAverageRatingByPropertyId(@Param("propertyId") Long propertyId);
    
    @Query("SELECT COUNT(pr) FROM PropertyRating pr WHERE pr.property.id = :propertyId")
    Long countRatingsByPropertyId(@Param("propertyId") Long propertyId);
    
    @Query("SELECT pr FROM PropertyRating pr WHERE pr.property.id = :propertyId ORDER BY pr.createdAt DESC")
    List<PropertyRating> findByPropertyIdOrderByCreatedAtDesc(@Param("propertyId") Long propertyId);
}
