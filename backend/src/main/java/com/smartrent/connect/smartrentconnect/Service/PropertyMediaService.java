package com.smartrent.connect.smartrentconnect.Service;

import com.smartrent.connect.smartrentconnect.dto.PropertyDocumentRequest;
import com.smartrent.connect.smartrentconnect.dto.PropertyDocumentResponse;
import com.smartrent.connect.smartrentconnect.dto.PropertyImageRequest;
import com.smartrent.connect.smartrentconnect.dto.PropertyImageResponse;
import com.smartrent.connect.smartrentconnect.entity.Property;
import com.smartrent.connect.smartrentconnect.entity.PropertyDocument;
import com.smartrent.connect.smartrentconnect.entity.PropertyImage;
import com.smartrent.connect.smartrentconnect.enums.DocumentStatus;
import com.smartrent.connect.smartrentconnect.repository.PropertyDocumentRepository;
import com.smartrent.connect.smartrentconnect.repository.PropertyImageRepository;
import com.smartrent.connect.smartrentconnect.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PropertyMediaService {

    private final PropertyImageRepository propertyImageRepository;
    private final PropertyDocumentRepository propertyDocumentRepository;
    private final PropertyRepository propertyRepository;

    // Property Image Methods
    public PropertyImageResponse addPropertyImage(PropertyImageRequest request) {
        log.info("Adding image to property: {}", request.getPropertyId());
        
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found with ID: " + request.getPropertyId()));

        // If this is marked as primary, unmark other primary images
        if (request.getIsPrimary()) {
            propertyImageRepository.findByPropertyIdAndIsPrimaryTrue(request.getPropertyId())
                    .ifPresent(img -> {
                        img.setIsPrimary(false);
                        propertyImageRepository.save(img);
                    });
        }

        PropertyImage image = PropertyImage.builder()
                .property(property)
                .imageUrl(request.getImageUrl())
                .isPrimary(request.getIsPrimary())
                .displayOrder(request.getDisplayOrder())
                .build();

        PropertyImage savedImage = propertyImageRepository.save(image);
        log.info("Successfully added image: {} to property: {}", savedImage.getId(), request.getPropertyId());
        
        return mapToPropertyImageResponse(savedImage);
    }

    public List<PropertyImageResponse> getPropertyImages(Long propertyId) {
        log.info("Fetching images for property: {}", propertyId);
        
        List<PropertyImage> images = propertyImageRepository.findPropertyImagesWithPrimaryFirst(propertyId);
        return images.stream()
                .map(this::mapToPropertyImageResponse)
                .collect(Collectors.toList());
    }

    public PropertyImageResponse updatePropertyImage(Long imageId, PropertyImageRequest request) {
        log.info("Updating image: {}", imageId);
        
        PropertyImage image = propertyImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with ID: " + imageId));

        // If this is marked as primary, unmark other primary images
        if (request.getIsPrimary()) {
            propertyImageRepository.findByPropertyIdAndIsPrimaryTrue(image.getProperty().getId())
                    .ifPresent(img -> {
                        if (!img.getId().equals(imageId)) {
                            img.setIsPrimary(false);
                            propertyImageRepository.save(img);
                        }
                    });
        }

        image.setImageUrl(request.getImageUrl());
        image.setIsPrimary(request.getIsPrimary());
        image.setDisplayOrder(request.getDisplayOrder());

        PropertyImage updatedImage = propertyImageRepository.save(image);
        log.info("Successfully updated image: {}", imageId);
        
        return mapToPropertyImageResponse(updatedImage);
    }

    public void deletePropertyImage(Long imageId) {
        log.info("Deleting image: {}", imageId);
        
        PropertyImage image = propertyImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with ID: " + imageId));

        propertyImageRepository.delete(image);
        log.info("Successfully deleted image: {}", imageId);
    }

    // Property Document Methods
    public PropertyDocumentResponse addPropertyDocument(PropertyDocumentRequest request) {
        log.info("Adding document to property: {}", request.getPropertyId());
        
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found with ID: " + request.getPropertyId()));

        PropertyDocument document = PropertyDocument.builder()
                .property(property)
                .documentType(request.getDocumentType())
                .documentUrl(request.getDocumentUrl())
                .documentName(request.getDocumentName())
                .build();

        PropertyDocument savedDocument = propertyDocumentRepository.save(document);
        log.info("Successfully added document: {} to property: {}", savedDocument.getId(), request.getPropertyId());
        
        return mapToPropertyDocumentResponse(savedDocument);
    }

    public List<PropertyDocumentResponse> getPropertyDocuments(Long propertyId) {
        log.info("Fetching documents for property: {}", propertyId);
        
        List<PropertyDocument> documents = propertyDocumentRepository.findPropertyDocumentsGroupedByType(propertyId);
        return documents.stream()
                .map(this::mapToPropertyDocumentResponse)
                .collect(Collectors.toList());
    }

    public void deletePropertyDocument(Long documentId) {
        log.info("Deleting document: {}", documentId);
        
        PropertyDocument document = propertyDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + documentId));

        propertyDocumentRepository.delete(document);
        log.info("Successfully deleted document: {}", documentId);
    }

    // Helper Methods
    private PropertyImageResponse mapToPropertyImageResponse(PropertyImage image) {
        return PropertyImageResponse.builder()
                .id(image.getId())
                .propertyId(image.getProperty().getId())
                .imageUrl(image.getImageUrl())
                .isPrimary(image.getIsPrimary())
                .displayOrder(image.getDisplayOrder())
                .uploadedAt(image.getUploadedAt())
                .build();
    }

    private PropertyDocumentResponse mapToPropertyDocumentResponse(PropertyDocument document) {
        return PropertyDocumentResponse.builder()
                .id(document.getId())
                .propertyId(document.getProperty().getId())
                .documentType(document.getDocumentType())
                .documentTypeDisplayName(document.getDocumentType().getDisplayName())
                .documentUrl(document.getDocumentUrl())
                .documentName(document.getDocumentName())
                .uploadedAt(document.getUploadedAt())
                .build();
    }
}
