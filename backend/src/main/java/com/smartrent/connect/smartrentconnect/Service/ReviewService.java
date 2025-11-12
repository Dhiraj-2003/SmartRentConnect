package com.smartrent.connect.smartrentconnect.Service;

import com.smartrent.connect.smartrentconnect.dto.ReviewRequest;
import com.smartrent.connect.smartrentconnect.dto.ReviewResponse;
import com.smartrent.connect.smartrentconnect.entity.Review;
import com.smartrent.connect.smartrentconnect.entity.Property;
import com.smartrent.connect.smartrentconnect.entity.Tenant;
import com.smartrent.connect.smartrentconnect.repository.ReviewRepository;
import com.smartrent.connect.smartrentconnect.repository.PropertyRepository;
import com.smartrent.connect.smartrentconnect.repository.TenantRepository;
import com.smartrent.connect.smartrentconnect.repository.TenantPropertyHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PropertyRepository propertyRepository;
    private final TenantRepository tenantRepository;
    private final TenantPropertyHistoryRepository tenantPropertyHistoryRepository;

    public ReviewResponse createReview(ReviewRequest request, String tenantUsername) {
        Tenant tenant = tenantRepository.findByUsername(tenantUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        // Check if tenant has rented this property
        boolean hasRentedProperty = tenantPropertyHistoryRepository
                .existsByTenantIdAndPropertyId(tenant.getId(), property.getId());

        if (!hasRentedProperty) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You can only review properties you have rented");
        }

        // Check if tenant has already reviewed this property
        if (reviewRepository.existsByPropertyAndTenant(property, tenant)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "You have already reviewed this property");
        }

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .property(property)
                .tenant(tenant)
                .build();

        Review savedReview = reviewRepository.save(review);

        // Update property rating and review count
        updatePropertyRating(property);

        return mapToResponse(savedReview);
    }

    public List<ReviewResponse> getReviewsByProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        return reviewRepository.findByPropertyOrderByCreatedAtDesc(property)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getReviewsByTenant(String tenantUsername) {
        Tenant tenant = tenantRepository.findByUsername(tenantUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

        return reviewRepository.findByTenant(tenant)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse updateReview(Long reviewId, ReviewRequest request, String tenantUsername) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        // Check if the tenant is authorized to update this review
        if (!review.getTenant().getUsername().equals(tenantUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this review");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review updatedReview = reviewRepository.save(review);

        // Update property rating
        updatePropertyRating(review.getProperty());

        return mapToResponse(updatedReview);
    }

    public void deleteReview(Long reviewId, String tenantUsername) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        // Check if the tenant is authorized to delete this review
        if (!review.getTenant().getUsername().equals(tenantUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to delete this review");
        }

        Property property = review.getProperty();
        reviewRepository.delete(review);

        // Update property rating after deletion
        updatePropertyRating(property);
    }

    private void updatePropertyRating(Property property) {
        Double averageRating = reviewRepository.getAverageRatingByPropertyId(property.getId());
        Long reviewCount = reviewRepository.countByPropertyId(property.getId());

        property.setRating(averageRating != null ? averageRating : 0.0);
        property.setReviewCount(reviewCount.intValue());

        propertyRepository.save(property);
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .propertyId(review.getProperty().getId())
                .propertyTitle(review.getProperty().getTitle())
                .tenantId(review.getTenant().getId())
                .tenantName(review.getTenant().getFullName())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
