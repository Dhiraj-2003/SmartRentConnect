package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.TenantPropertyHistory;
import com.smartrent.connect.smartrentconnect.entity.Tenant;
import com.smartrent.connect.smartrentconnect.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
    
    @Query("SELECT COUNT(tph) FROM TenantPropertyHistory tph WHERE tph.endDate IS NULL")
    Long countByEndDateIsNull();
    
    @Query("SELECT COUNT(tph) FROM TenantPropertyHistory tph WHERE tph.tenant.id = :tenantId AND tph.endDate IS NULL")
    Long countByTenantIdAndEndDateIsNull(@Param("tenantId") Long tenantId);
    
    @Query("SELECT COUNT(tph) FROM TenantPropertyHistory tph WHERE tph.property.id = :propertyId AND tph.endDate IS NULL")
    Long countByPropertyIdAndEndDateIsNull(@Param("propertyId") Long propertyId);
}
