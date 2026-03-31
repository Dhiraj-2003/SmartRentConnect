package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.Property;
import com.smartrent.connect.smartrentconnect.entity.PropertyDocument;
import com.smartrent.connect.smartrentconnect.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyDocumentRepository extends JpaRepository<PropertyDocument, Long> {

    List<PropertyDocument> findByPropertyId(Long propertyId);

    List<PropertyDocument> findByPropertyIdOrderByUploadedAtDesc(Long propertyId);

    Optional<PropertyDocument> findByPropertyIdAndDocumentType(Long propertyId, DocumentType documentType);

    List<PropertyDocument> findByDocumentType(DocumentType documentType);

    void deleteByPropertyId(Long propertyId);

    @Query("SELECT COUNT(pd) FROM PropertyDocument pd WHERE pd.property.id = :propertyId")
    long countByPropertyId(@Param("propertyId") Long propertyId);

    @Query("SELECT pd FROM PropertyDocument pd WHERE pd.property.id = :propertyId ORDER BY pd.documentType ASC, pd.uploadedAt DESC")
    List<PropertyDocument> findPropertyDocumentsGroupedByType(@Param("propertyId") Long propertyId);
}
