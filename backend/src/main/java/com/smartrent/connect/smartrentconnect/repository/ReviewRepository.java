package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.Review;
import com.smartrent.connect.smartrentconnect.entity.Property;
import com.smartrent.connect.smartrentconnect.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProperty(Property property);

    List<Review> findByTenant(Tenant tenant);

    List<Review> findByPropertyOrderByCreatedAtDesc(Property property);

    Optional<Review> findByPropertyAndTenant(Property property, Tenant tenant);

    @Query("SELECT r FROM Review r WHERE r.property.id = :propertyId ORDER BY r.createdAt DESC")
    List<Review> findByPropertyIdOrderByCreatedAtDesc(@Param("propertyId") Long propertyId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.property.id = :propertyId")
    Long countByPropertyId(@Param("propertyId") Long propertyId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.property.id = :propertyId")
    Double getAverageRatingByPropertyId(@Param("propertyId") Long propertyId);

    boolean existsByPropertyAndTenant(Property property, Tenant tenant);
    
    @Query("SELECT AVG(r.rating) FROM Review r")
    Optional<Double> findAverageRating();
}
