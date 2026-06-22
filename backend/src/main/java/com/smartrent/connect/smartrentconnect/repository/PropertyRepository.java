package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.Property;
import com.smartrent.connect.smartrentconnect.entity.Owner;
import com.smartrent.connect.smartrentconnect.enums.PropertyType;
import com.smartrent.connect.smartrentconnect.enums.PropertyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByOwner(Owner owner);

    List<Property> findByStatus(PropertyStatus status);

    List<Property> findByOwnerAndStatus(Owner owner, PropertyStatus status);

    List<Property> findByPropertyType(PropertyType propertyType);

    List<Property> findByPropertyTypeAndStatus(PropertyType propertyType, PropertyStatus status);

    List<Property> findByCityIgnoreCase(String city);

    List<Property> findByCityIgnoreCaseAndStatus(String city, PropertyStatus status);

    List<Property> findByCityAndStateIgnoreCase(String city, String state);

    List<Property> findByCityAndStateIgnoreCaseAndStatus(String city, String state, PropertyStatus status);

    @Query("SELECT p FROM Property p WHERE p.status = :status AND " +
           "(:city IS NULL OR LOWER(p.city) = LOWER(:city)) AND " +
           "(:propertyType IS NULL OR p.propertyType = :propertyType) AND " +
           "(:minDeposit IS NULL OR p.deposit >= :minDeposit) AND " +
           "(:maxDeposit IS NULL OR p.deposit <= :maxDeposit)")
    List<Property> findApprovedPropertiesWithFilters(
            @Param("status") PropertyStatus status,
            @Param("city") String city,
            @Param("propertyType") PropertyType propertyType,
            @Param("minDeposit") Double minDeposit,
            @Param("maxDeposit") Double maxDeposit
    );

    @Query("SELECT p FROM Property p WHERE p.owner.id = :ownerId")
    List<Property> findByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(p) FROM Property p WHERE p.owner.id = :ownerId")
    Long countByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(p) FROM Property p WHERE p.owner = :owner")
    Long countByOwner(@Param("owner") Owner owner);

    @Query("SELECT COUNT(p) FROM Property p WHERE p.status = :status")
    Long countByStatus(@Param("status") PropertyStatus status);

    @Query("SELECT COUNT(p) FROM Property p WHERE p.propertyType = :propertyType")
    Long countByPropertyType(@Param("propertyType") PropertyType propertyType);

    @Query("SELECT p FROM Property p WHERE p.status = 'PENDING' ORDER BY p.createdAt DESC")
    List<Property> findPendingProperties();

    boolean existsByOwnerAndTitle(Owner owner, String title);
}
