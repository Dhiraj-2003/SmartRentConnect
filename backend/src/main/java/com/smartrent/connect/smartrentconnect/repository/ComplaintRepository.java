package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.Complaint;
import com.smartrent.connect.smartrentconnect.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    
    List<Complaint> findByTenantIdOrderByReportedDateDesc(Long tenantId);
    
    List<Complaint> findByPropertyIdOrderByReportedDateDesc(Long propertyId);
    
    List<Complaint> findByOwnerIdOrderByReportedDateDesc(Long ownerId);
    
    List<Complaint> findByStatusOrderByReportedDateDesc(ComplaintStatus status);
    
    List<Complaint> findByTenantIdAndStatusOrderByReportedDateDesc(Long tenantId, ComplaintStatus status);
    
    List<Complaint> findByPropertyIdAndStatusOrderByReportedDateDesc(Long propertyId, ComplaintStatus status);
    
    List<Complaint> findByOwnerIdAndStatusOrderByReportedDateDesc(Long ownerId, ComplaintStatus status);
}
