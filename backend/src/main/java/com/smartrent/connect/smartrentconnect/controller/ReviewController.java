package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.dto.ReviewRequest;
import com.smartrent.connect.smartrentconnect.dto.ReviewResponse;
import com.smartrent.connect.smartrentconnect.Service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class ReviewController {

    private final ReviewService reviewService;

    // =============== CREATE REVIEW (TENANT ONLY) ===============
    @PostMapping
    @PreAuthorize("hasAuthority('TENANT')")
    public ResponseEntity<ReviewResponse> createReview(
            @Validated @RequestBody ReviewRequest request,
            Authentication authentication) {
        ReviewResponse response = reviewService.createReview(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =============== UPDATE REVIEW (TENANT ONLY) ===============
    @PutMapping("/{reviewId}")
    @PreAuthorize("hasAuthority('TENANT')")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @Validated @RequestBody ReviewRequest request,
            Authentication authentication) {
        ReviewResponse response = reviewService.updateReview(reviewId, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    // =============== DELETE REVIEW (TENANT ONLY) ===============
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAuthority('TENANT')")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            Authentication authentication) {
        reviewService.deleteReview(reviewId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    // =============== GET REVIEWS BY PROPERTY (ALL AUTHENTICATED USERS) ===============
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByProperty(@PathVariable Long propertyId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByProperty(propertyId);
        return ResponseEntity.ok(reviews);
    }

    // =============== GET REVIEWS BY TENANT (TENANT ONLY) ===============
    @GetMapping("/my-reviews")
    @PreAuthorize("hasAuthority('TENANT')")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(Authentication authentication) {
        List<ReviewResponse> reviews = reviewService.getReviewsByTenant(authentication.getName());
        return ResponseEntity.ok(reviews);
    }
}
