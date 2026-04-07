package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.ComplaintImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintImageRepository extends JpaRepository<ComplaintImage, Long> {
    
    List<ComplaintImage> findByComplaintIdOrderByDisplayOrderAsc(Long complaintId);
    
    List<ComplaintImage> findByComplaintId(Long complaintId);
    
    void deleteByComplaintId(Long complaintId);
}
