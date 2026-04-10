package com.smartrent.connect.smartrentconnect.service;

import com.smartrent.connect.smartrentconnect.dto.RatingRequest;
import com.smartrent.connect.smartrentconnect.dto.RatingResponse;
import com.smartrent.connect.smartrentconnect.entity.Property;
import com.smartrent.connect.smartrentconnect.entity.PropertyRating;
import com.smartrent.connect.smartrentconnect.entity.Tenant;
import com.smartrent.connect.smartrentconnect.repository.PropertyRepository;
import com.smartrent.connect.smartrentconnect.repository.PropertyRatingRepository;
import com.smartrent.connect.smartrentconnect.repository.TenantRepository;
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
public class RatingService {

    private final PropertyRatingRepository propertyRatingRepository;
    private final PropertyRepository propertyRepository;
    private final TenantRepository tenantRepository;

    public RatingResponse createRating(Long propertyId, RatingRequest request, String tenantUsername) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        // Only allow rating for approved properties
        if (property.getStatus() != com.smartrent.connect.smartrentconnect.enums.PropertyStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Property is not approved");
        }

        Tenant tenant = tenantRepository.findByUsername(tenantUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

        // Check if tenant has already rated this property
        if (propertyRatingRepository.existsByPropertyIdAndTenantId(propertyId, tenant.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have already rated this property");
        }

        // Check if tenant has booked this property (placeholder - implement actual booking check)
        if (!hasTenantBookedProperty(propertyId, tenant.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only rate properties you have booked");
        }

        PropertyRating rating = PropertyRating.builder()
                .property(property)
                .tenant(tenant)
                .rating(request.getRating())
                .review(request.getReview())
                .build();

        PropertyRating savedRating = propertyRatingRepository.save(rating);

        return mapToResponse(savedRating);
    }

    public List<RatingResponse> getPropertyRatings(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        List<PropertyRating> ratings = propertyRatingRepository.findByPropertyIdOrderByCreatedAtDesc(propertyId);
        return ratings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Double getAverageRating(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        return propertyRatingRepository.findAverageRatingByPropertyId(propertyId);
    }

    public Long getTotalRatings(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        return propertyRatingRepository.countRatingsByPropertyId(propertyId);
    }

    public RatingResponse updateRating(Long ratingId, RatingRequest request, String tenantUsername) {
        PropertyRating rating = propertyRatingRepository.findById(ratingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rating not found"));

        // Verify ownership
        if (!rating.getTenant().getUsername().equals(tenantUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this rating");
        }

        rating.setRating(request.getRating());
        rating.setReview(request.getReview());

        PropertyRating updatedRating = propertyRatingRepository.save(rating);
        return mapToResponse(updatedRating);
    }

    public void deleteRating(Long ratingId, String tenantUsername) {
        PropertyRating rating = propertyRatingRepository.findById(ratingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rating not found"));

        // Verify ownership
        if (!rating.getTenant().getUsername().equals(tenantUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to delete this rating");
        }

        propertyRatingRepository.delete(rating);
    }

    public List<RatingResponse> getTenantRatings(String tenantUsername) {
        Tenant tenant = tenantRepository.findByUsername(tenantUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

        List<PropertyRating> ratings = propertyRatingRepository.findByTenantIdOrderByCreatedAtDesc(tenant.getId());
        return ratings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private boolean hasTenantBookedProperty(Long propertyId, Long tenantId) {
        // This is a placeholder implementation
        // In a real system, you would check the Booking entity
        // For now, we'll allow all tenants to rate (remove this check in production)
        return true;
    }

    private RatingResponse mapToResponse(PropertyRating rating) {
        return RatingResponse.builder()
                .id(rating.getId())
                .propertyId(rating.getProperty().getId())
                .propertyTitle(rating.getProperty().getTitle())
                .tenantId(rating.getTenant().getId())
                .tenantName(rating.getTenant().getFullName())
                .rating(rating.getRating())
                .review(rating.getReview())
                .createdAt(rating.getCreatedAt())
                .build();
    }
}
