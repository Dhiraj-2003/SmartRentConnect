package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.TenantPropertyHistory;
import com.smartrent.connect.smartrentconnect.entity.Tenant;
import com.smartrent.connect.smartrentconnect.entity.Property;
import com.smartrent.connect.smartrentconnect.enums.OccupancyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TenantPropertyHistoryRepository extends JpaRepository<TenantPropertyHistory, Long> {

    List<TenantPropertyHistory> findByTenant(Tenant tenant);

    List<TenantPropertyHistory> findByProperty(Property property);

    @Query("SELECT tph FROM TenantPropertyHistory tph WHERE tph.tenant.id = :tenantId AND tph.property.id = :propertyId")
    List<TenantPropertyHistory> findByTenantIdAndPropertyId(
            @Param("tenantId") Long tenantId,
            @Param("propertyId") Long propertyId
    );

    @Query("SELECT CASE WHEN COUNT(tph) > 0 THEN true ELSE false END FROM TenantPropertyHistory tph " +
           "WHERE tph.tenant.id = :tenantId AND tph.property.id = :propertyId")
    boolean existsByTenantIdAndPropertyId(@Param("tenantId") Long tenantId, @Param("propertyId") Long propertyId);

    @Query("SELECT tph FROM TenantPropertyHistory tph WHERE tph.tenant.id = :tenantId AND tph.status = 'ACTIVE'")
    List<TenantPropertyHistory> findActiveTenanciesByTenantId(@Param("tenantId") Long tenantId);
    
    @Query("SELECT tph FROM TenantPropertyHistory tph WHERE tph.tenant.id = :tenantId AND tph.status = :status")
    List<TenantPropertyHistory> findByTenantIdAndStatus(@Param("tenantId") Long tenantId, @Param("status") OccupancyStatus status);
    
    @Query("SELECT tph FROM TenantPropertyHistory tph WHERE tph.tenant.id = :tenantId ORDER BY tph.occupancyStartDate DESC")
    List<TenantPropertyHistory> findByTenantIdOrderByOccupancyStartDateDesc(@Param("tenantId") Long tenantId);
    
    @Query("SELECT tph FROM TenantPropertyHistory tph WHERE tph.isActive = true")
    List<TenantPropertyHistory> findAllActive();
    
    @Query("SELECT COUNT(tph) FROM TenantPropertyHistory tph WHERE tph.isActive = true")
    Long countActive();
    
    @Query("SELECT COUNT(tph) FROM TenantPropertyHistory tph WHERE tph.tenant.id = :tenantId AND tph.isActive = true")
    Long countActiveByTenantId(@Param("tenantId") Long tenantId);
    
    @Query("SELECT COUNT(tph) FROM TenantPropertyHistory tph WHERE tph.property.id = :propertyId AND tph.isActive = true")
    Long countActiveByPropertyId(@Param("propertyId") Long propertyId);
    
    @Query("SELECT COUNT(tph) FROM TenantPropertyHistory tph WHERE tph.property.owner.id = :ownerId AND tph.isActive = true")
    Long countActiveByPropertyOwnerId(@Param("ownerId") Long ownerId);
    
    @Query("SELECT tph FROM TenantPropertyHistory tph WHERE tph.property.owner.id = :ownerId")
    List<TenantPropertyHistory> findByPropertyOwnerId(@Param("ownerId") Long ownerId);
    
    @Query("SELECT tph FROM TenantPropertyHistory tph WHERE tph.nextRentDueDate <= :date AND tph.isActive = true")
    List<TenantPropertyHistory> findRentDueByDate(@Param("date") LocalDate date);
    
    @Query("SELECT tph FROM TenantPropertyHistory tph WHERE tph.nextRentDueDate = :dueDate AND tph.isActive = true")
    List<TenantPropertyHistory> findByNextRentDueDate(@Param("dueDate") LocalDate dueDate);
    
    @Query("SELECT tph FROM TenantPropertyHistory tph WHERE tph.status = :status AND tph.isActive = true")
    List<TenantPropertyHistory> findByStatus(@Param("status") OccupancyStatus status);
}
