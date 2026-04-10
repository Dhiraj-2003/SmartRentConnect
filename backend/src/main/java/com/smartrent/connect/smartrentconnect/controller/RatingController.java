package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.dto.RatingRequest;
import com.smartrent.connect.smartrentconnect.dto.RatingResponse;
import com.smartrent.connect.smartrentconnect.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class RatingController {

    private final RatingService ratingService;

    @PostMapping("/property/{propertyId}")
    @PreAuthorize("hasAuthority('TENANT')")
    public ResponseEntity<RatingResponse> createRating(
            @PathVariable Long propertyId,
            @Valid @RequestBody RatingRequest request,
            Authentication authentication) {
        RatingResponse response = ratingService.createRating(propertyId, request, authentication.getName());
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<RatingResponse>> getPropertyRatings(@PathVariable Long propertyId) {
        List<RatingResponse> ratings = ratingService.getPropertyRatings(propertyId);
        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/property/{propertyId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long propertyId) {
        Double averageRating = ratingService.getAverageRating(propertyId);
        return ResponseEntity.ok(averageRating != null ? averageRating : 0.0);
    }

    @GetMapping("/property/{propertyId}/total")
    public ResponseEntity<Long> getTotalRatings(@PathVariable Long propertyId) {
        Long totalRatings = ratingService.getTotalRatings(propertyId);
        return ResponseEntity.ok(totalRatings != null ? totalRatings : 0L);
    }

    @PutMapping("/{ratingId}")
    @PreAuthorize("hasAuthority('TENANT')")
    public ResponseEntity<RatingResponse> updateRating(
            @PathVariable Long ratingId,
            @Valid @RequestBody RatingRequest request,
            Authentication authentication) {
        RatingResponse response = ratingService.updateRating(ratingId, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{ratingId}")
    @PreAuthorize("hasAuthority('TENANT')")
    public ResponseEntity<Void> deleteRating(
            @PathVariable Long ratingId,
            Authentication authentication) {
        ratingService.deleteRating(ratingId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tenant/my-ratings")
    @PreAuthorize("hasAuthority('TENANT')")
    public ResponseEntity<List<RatingResponse>> getTenantRatings(Authentication authentication) {
        List<RatingResponse> ratings = ratingService.getTenantRatings(authentication.getName());
        return ResponseEntity.ok(ratings);
    }
}
