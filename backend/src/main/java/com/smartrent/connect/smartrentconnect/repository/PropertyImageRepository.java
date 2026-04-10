package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.Property;
import com.smartrent.connect.smartrentconnect.entity.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyImageRepository extends JpaRepository<PropertyImage, Long> {

    List<PropertyImage> findByPropertyId(Long propertyId);

    List<PropertyImage> findByPropertyIdOrderByDisplayOrderAsc(Long propertyId);

    Optional<PropertyImage> findByPropertyIdAndIsPrimaryTrue(Long propertyId);

    //List<PropertyImage> findByPropertyIdAndIsPrimaryTrue(Long propertyId);

    void deleteByPropertyId(Long propertyId);

    @Query("SELECT COUNT(pi) FROM PropertyImage pi WHERE pi.property.id = :propertyId")
    long countByPropertyId(@Param("propertyId") Long propertyId);

    @Query("SELECT pi FROM PropertyImage pi WHERE pi.property.id = :propertyId ORDER BY pi.isPrimary DESC, pi.displayOrder ASC")
    List<PropertyImage> findPropertyImagesWithPrimaryFirst(@Param("propertyId") Long propertyId);
}
