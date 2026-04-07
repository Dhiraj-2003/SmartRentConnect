package com.smartrent.connect.smartrentconnect.service;

import com.smartrent.connect.smartrentconnect.dto.PropertyResponse;
import com.smartrent.connect.smartrentconnect.dto.PropertyImageResponse;
import com.smartrent.connect.smartrentconnect.dto.PropertyDocumentResponse;
import com.smartrent.connect.smartrentconnect.entity.Property;
import com.smartrent.connect.smartrentconnect.enums.PropertyStatus;
import com.smartrent.connect.smartrentconnect.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminPropertyService {

    private final PropertyRepository propertyRepository;
    private final OwnerPropertyService ownerPropertyService;
    private final PropertyMediaService propertyMediaService;

    public List<PropertyResponse> getPendingProperties() {
        List<Property> pendingProperties = propertyRepository.findPendingProperties();
        return pendingProperties.stream()
                .map(ownerPropertyService::mapToResponse)
                .collect(Collectors.toList());
    }

    public PropertyResponse approveProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        if (property.getStatus() != PropertyStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property is not in pending status");
        }

        property.setStatus(PropertyStatus.APPROVED);
        property.setRejectionReason(null);
        Property savedProperty = propertyRepository.save(property);

        return ownerPropertyService.mapToResponse(savedProperty);
    }

    public PropertyResponse rejectProperty(Long propertyId, String rejectionReason) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        if (property.getStatus() != PropertyStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property is not in pending status");
        }

        property.setStatus(PropertyStatus.REJECTED);
        property.setRejectionReason(rejectionReason);
        Property savedProperty = propertyRepository.save(property);

        return ownerPropertyService.mapToResponse(savedProperty);
    }

    public List<PropertyImageResponse> getPropertyImages(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        return propertyMediaService.getPropertyImages(propertyId);
    }

    public List<PropertyDocumentResponse> getPropertyDocuments(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        return propertyMediaService.getPropertyDocuments(propertyId);
    }

    public List<PropertyResponse> getAllProperties() {
        List<Property> allProperties = propertyRepository.findAll();
        return allProperties.stream()
                .map(ownerPropertyService::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PropertyResponse> getPropertiesByStatus(PropertyStatus status) {
        List<Property> properties = propertyRepository.findByStatus(status);
        return properties.stream()
                .map(ownerPropertyService::mapToResponse)
                .collect(Collectors.toList());
    }

    public PropertyResponse getPropertyById(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
        return ownerPropertyService.mapToResponse(property);
    }
}
