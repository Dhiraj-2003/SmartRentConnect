package com.smartrent.connect.smartrentconnect.Service;

import com.smartrent.connect.smartrentconnect.dto.PropertyRequest;
import com.smartrent.connect.smartrentconnect.dto.PropertyResponse;
import com.smartrent.connect.smartrentconnect.entity.Property;
import com.smartrent.connect.smartrentconnect.entity.Owner;
import com.smartrent.connect.smartrentconnect.repository.OwnerRepository;
import com.smartrent.connect.smartrentconnect.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final OwnerRepository ownerRepository;

    public PropertyResponse createProperty(PropertyRequest request, String ownerUsername) {
        Owner owner = ownerRepository.findByUsername(ownerUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Owner not found"));

        Property property = Property.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .rent(request.getRent())
                .amenities(request.getAmenities())
                .images(request.getImages())
                .bedrooms(request.getBedrooms())
                .bathrooms(request.getBathrooms())
                .area(request.getArea())
                .available(request.getAvailable())
                .owner(owner)
                .build();

        Property savedProperty = propertyRepository.save(property);
        return mapToResponse(savedProperty);
    }

    public PropertyResponse updateProperty(Long propertyId, PropertyRequest request, String ownerUsername) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        // Check if the owner is authorized to update this property
        if (!property.getOwner().getUsername().equals(ownerUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this property");
        }

        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setLocation(request.getLocation());
        property.setRent(request.getRent());
        property.setAmenities(request.getAmenities());
        property.setImages(request.getImages());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setArea(request.getArea());
        property.setAvailable(request.getAvailable());

        Property updatedProperty = propertyRepository.save(property);
        return mapToResponse(updatedProperty);
    }

    public void deleteProperty(Long propertyId, String ownerUsername) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        // Check if the owner is authorized to delete this property
        if (!property.getOwner().getUsername().equals(ownerUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to delete this property");
        }

        propertyRepository.delete(property);
    }

    public PropertyResponse getPropertyById(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
        return mapToResponse(property);
    }

    public List<PropertyResponse> getAllAvailableProperties() {
        return propertyRepository.findByAvailableTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PropertyResponse> getPropertiesByOwner(String ownerUsername) {
        Owner owner = ownerRepository.findByUsername(ownerUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Owner not found"));

        return propertyRepository.findByOwner(owner)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PropertyResponse> searchProperties(String location, Double minRent, Double maxRent, Double minRating) {
        return propertyRepository.findPropertiesWithFilters(location, minRent, maxRent, minRating)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PropertyResponse> searchPropertiesAdvanced(String location, Double minRent, Double maxRent, 
            Double minRating, Integer bedrooms, Integer bathrooms, Double minArea, Double maxArea, 
            String amenities, String sortBy, String sortDir) {
        
        List<Property> properties = propertyRepository.findByAvailableTrue();
        
        // Apply filters
        return properties.stream()
                .filter(p -> location == null || p.getLocation().toLowerCase().contains(location.toLowerCase()))
                .filter(p -> minRent == null || p.getRent() >= minRent)
                .filter(p -> maxRent == null || p.getRent() <= maxRent)
                .filter(p -> minRating == null || p.getRating() >= minRating)
                .filter(p -> bedrooms == null || (p.getBedrooms() != null && p.getBedrooms().equals(bedrooms)))
                .filter(p -> bathrooms == null || (p.getBathrooms() != null && p.getBathrooms().equals(bathrooms)))
                .filter(p -> minArea == null || (p.getArea() != null && p.getArea() >= minArea))
                .filter(p -> maxArea == null || (p.getArea() != null && p.getArea() <= maxArea))
                .filter(p -> amenities == null || (p.getAmenities() != null && 
                    p.getAmenities().toLowerCase().contains(amenities.toLowerCase())))
                .sorted((p1, p2) -> {
                    int result = 0;
                    switch (sortBy.toLowerCase()) {
                        case "rent":
                            result = Double.compare(p1.getRent(), p2.getRent());
                            break;
                        case "rating":
                            result = Double.compare(p1.getRating(), p2.getRating());
                            break;
                        case "area":
                            result = p1.getArea() != null && p2.getArea() != null ? 
                                Double.compare(p1.getArea(), p2.getArea()) : 0;
                            break;
                        case "created":
                            result = p1.getCreatedAt().compareTo(p2.getCreatedAt());
                            break;
                        default:
                            result = p1.getTitle().compareTo(p2.getTitle());
                    }
                    return "desc".equalsIgnoreCase(sortDir) ? -result : result;
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PropertyResponse mapToResponse(Property property) {
        return PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .location(property.getLocation())
                .rent(property.getRent())
                .amenities(property.getAmenities())
                .images(property.getImages())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .area(property.getArea())
                .available(property.getAvailable())
                .rating(property.getRating())
                .reviewCount(property.getReviewCount())
                .ownerId(property.getOwner().getId())
                .ownerName(property.getOwner().getFullName())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }
}
