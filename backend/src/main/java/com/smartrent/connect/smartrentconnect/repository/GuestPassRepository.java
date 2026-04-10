package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.GuestPass;
import com.smartrent.connect.smartrentconnect.entity.Tenant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GuestPassRepository extends JpaRepository<GuestPass, Long> {

    Optional<GuestPass> findByPassId(String passId);

    List<GuestPass> findByTenant(Tenant tenant);

    List<GuestPass> findByTenantOrderByCreatedAtDesc(Tenant tenant);

    @Query("SELECT g FROM GuestPass g WHERE g.tenant.id = :tenantId ORDER BY g.createdAt DESC")
    List<GuestPass> findByTenantIdOrderByCreatedAtDesc(@Param("tenantId") Long tenantId);

    @Query("SELECT g FROM GuestPass g WHERE g.status = :status")
    List<GuestPass> findByStatus(@Param("status") GuestPass.GuestPassStatus status);

    @Query("SELECT g FROM GuestPass g WHERE g.visitDateTime BETWEEN :startDate AND :endDate")
    List<GuestPass> findByVisitDateTimeBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT g FROM GuestPass g WHERE g.expiresAt < :currentTime AND g.status = 'ACTIVE'")
    List<GuestPass> findExpiredPasses(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT COUNT(g) FROM GuestPass g WHERE g.tenant.id = :tenantId")
    Long countByTenantId(@Param("tenantId") Long tenantId);
    
    Long countByStatus(GuestPass.GuestPassStatus status);
    
    Page<GuestPass> findByStatus(GuestPass.GuestPassStatus status, Pageable pageable);
}
