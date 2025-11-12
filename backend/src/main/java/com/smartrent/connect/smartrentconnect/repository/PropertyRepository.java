package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.Property;
import com.smartrent.connect.smartrentconnect.entity.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByOwner(Owner owner);

    List<Property> findByAvailableTrue();

    List<Property> findByLocationContainingIgnoreCase(String location);

    List<Property> findByRentBetween(Double minRent, Double maxRent);

    @Query("SELECT p FROM Property p WHERE p.available = true AND " +
           "(:location IS NULL OR LOWER(p.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minRent IS NULL OR p.rent >= :minRent) AND " +
           "(:maxRent IS NULL OR p.rent <= :maxRent) AND " +
           "(:minRating IS NULL OR p.rating >= :minRating)")
    List<Property> findPropertiesWithFilters(
            @Param("location") String location,
            @Param("minRent") Double minRent,
            @Param("maxRent") Double maxRent,
            @Param("minRating") Double minRating
    );

    @Query("SELECT p FROM Property p WHERE p.owner.id = :ownerId")
    List<Property> findByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(p) FROM Property p WHERE p.owner.id = :ownerId")
    Long countByOwnerId(@Param("ownerId") Long ownerId);
    
    Long countByAvailableFalse();
}
