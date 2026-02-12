package com.smartrent.connect.smartrentconnect.Service;

import com.smartrent.connect.smartrentconnect.dto.*;
import com.smartrent.connect.smartrentconnect.entity.*;
import com.smartrent.connect.smartrentconnect.enums.*;
import com.smartrent.connect.smartrentconnect.repository.*;
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
public class TenantPropertyService {

    private final PropertyRepository propertyRepository;
    private final FlatDetailsRepository flatDetailsRepository;
    private final PGDetailsRepository pgDetailsRepository;
    private final PGRoomRepository pgRoomRepository;
    private final PGBedRepository pgBedRepository;
    private final PropertyRatingRepository propertyRatingRepository;
    private final TenantRepository tenantRepository;

    public List<PropertyResponse> getApprovedProperties(String city, PropertyType propertyType, 
                                                       Double minDeposit, Double maxDeposit) {
        List<Property> properties = propertyRepository.findApprovedPropertiesWithFilters(
                PropertyStatus.APPROVED, city, propertyType, minDeposit, maxDeposit);
        
        return properties.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PropertyResponse getPropertyById(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        // Only show approved properties to tenants
        if (property.getStatus() != PropertyStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Property is not approved");
        }

        return mapToResponse(property);
    }

    public PGAvailabilityResponse getPGAvailability(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        if (property.getPropertyType() != PropertyType.PG) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property is not a PG type");
        }

        if (property.getStatus() != PropertyStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Property is not approved");
        }

        PGDetails pgDetails = pgDetailsRepository.findByPropertyId(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "PG details not found"));

        List<PGRoomResponse> roomResponses = pgRoomRepository.findByPropertyId(propertyId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PGAvailabilityResponse.builder()
                .propertyId(propertyId)
                .propertyTitle(property.getTitle())
                .genderAllowed(pgDetails.getGenderAllowed())
                .foodIncluded(pgDetails.getFoodIncluded())
                .rooms(roomResponses)
                .build();
    }

    public BookingResponse bookFlat(Long propertyId, String tenantUsername) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        if (property.getPropertyType() != PropertyType.FLAT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property is not a flat type");
        }

        if (property.getStatus() != PropertyStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Property is not approved");
        }

        Tenant tenant = tenantRepository.findByUsername(tenantUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

        // Check if tenant already booked this property
        if (hasTenantBookedProperty(propertyId, tenant.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have already booked this property");
        }

        // Create booking record (you might want to create a separate booking entity)
        // For now, we'll just return a success response
        return BookingResponse.builder()
                .bookingId("FLAT_" + propertyId + "_" + tenant.getId())
                .propertyId(propertyId)
                .propertyTitle(property.getTitle())
                .tenantId(tenant.getId())
                .tenantName(tenant.getFullName())
                .bookingType("FLAT")
                .status("CONFIRMED")
                .message("Flat booked successfully")
                .build();
    }

    public BookingResponse bookBed(Long propertyId, Long roomId, Long bedId, String tenantUsername) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        if (property.getPropertyType() != PropertyType.PG) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property is not a PG type");
        }

        if (property.getStatus() != PropertyStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Property is not approved");
        }

        Tenant tenant = tenantRepository.findByUsername(tenantUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

        PGBed bed = pgBedRepository.findById(bedId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bed not found"));

        // Verify bed belongs to the specified room and property
        if (!bed.getPgRoom().getId().equals(roomId) || 
            !bed.getPgRoom().getPgDetails().getProperty().getId().equals(propertyId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid bed selection");
        }

        if (bed.getIsOccupied()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bed is already occupied");
        }

        // Check if tenant already has a booking in this PG
        if (hasTenantBookedProperty(propertyId, tenant.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You already have a booking in this PG");
        }

        // Mark bed as occupied
        bed.setIsOccupied(true);
        pgBedRepository.save(bed);

        PGRoom room = bed.getPgRoom();

        return BookingResponse.builder()
                .bookingId("BED_" + bedId + "_" + tenant.getId())
                .propertyId(propertyId)
                .propertyTitle(property.getTitle())
                .roomId(roomId)
                .roomNumber(room.getRoomNumber())
                .bedId(bedId)
                .bedNumber(bed.getBedNumber())
                .tenantId(tenant.getId())
                .tenantName(tenant.getFullName())
                .bookingType("PG_BED")
                .status("CONFIRMED")
                .message("Bed booked successfully")
                .build();
    }

    private boolean hasTenantBookedProperty(Long propertyId, Long tenantId) {
        // This is a placeholder implementation
        // In a real system, you would have a Booking entity and check there
        return false;
    }

    private PropertyResponse mapToResponse(Property property) {
        PropertyResponse.PropertyResponseBuilder builder = PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .propertyType(property.getPropertyType())
                .description(property.getDescription())
                .address(property.getAddress())
                .city(property.getCity())
                .state(property.getState())
                .pincode(property.getPincode())
                .deposit(property.getDeposit())
                .amenities(property.getAmenities())
                .status(property.getStatus())
                .ownerId(property.getOwner().getId())
                .ownerName(property.getOwner().getFullName())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt());

        // Add rating information
        Double averageRating = propertyRatingRepository.findAverageRatingByPropertyId(property.getId());
        Long totalRatings = propertyRatingRepository.countRatingsByPropertyId(property.getId());
        builder.averageRating(averageRating != null ? averageRating : 0.0);
        builder.totalRatings(totalRatings != null ? totalRatings : 0L);

        // Add type-specific details
        if (property.getPropertyType() == PropertyType.FLAT) {
            flatDetailsRepository.findByPropertyId(property.getId())
                    .ifPresent(flatDetails -> builder.flatDetails(mapToResponse(flatDetails)));
        } else if (property.getPropertyType() == PropertyType.PG) {
            pgDetailsRepository.findByPropertyId(property.getId())
                    .ifPresent(pgDetails -> builder.pgDetails(mapToResponse(pgDetails)));
        }

        return builder.build();
    }

    private FlatDetailsResponse mapToResponse(FlatDetails flatDetails) {
        return FlatDetailsResponse.builder()
                .id(flatDetails.getId())
                .bhkType(flatDetails.getBhkType())
                .rentPerMonth(flatDetails.getRentPerMonth())
                .totalRooms(flatDetails.getTotalRooms())
                .bathrooms(flatDetails.getBathrooms())
                .furnishingType(flatDetails.getFurnishingType())
                .flatNumber(flatDetails.getFlatNumber())
                .build();
    }

    private PGDetailsResponse mapToResponse(PGDetails pgDetails) {
        List<PGRoomResponse> roomResponses = pgRoomRepository.findByPgDetailsId(pgDetails.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PGDetailsResponse.builder()
                .id(pgDetails.getId())
                .genderAllowed(pgDetails.getGenderAllowed())
                .foodIncluded(pgDetails.getFoodIncluded())
                .rooms(roomResponses)
                .build();
    }

    private PGRoomResponse mapToResponse(PGRoom pgRoom) {
        List<PGBedResponse> bedResponses = pgRoom.getBeds().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        long availableBeds = pgRoom.getBeds().stream()
                .filter(bed -> !bed.getIsOccupied())
                .count();

        return PGRoomResponse.builder()
                .id(pgRoom.getId())
                .roomNumber(pgRoom.getRoomNumber())
                .sharingType(pgRoom.getSharingType())
                .totalBeds(pgRoom.getTotalBeds())
                .bathrooms(pgRoom.getBathrooms())
                .pricePerBed(pgRoom.getPricePerBed())
                .availableBeds((int) availableBeds)
                .beds(bedResponses)
                .build();
    }

    private PGBedResponse mapToResponse(PGBed pgBed) {
        return PGBedResponse.builder()
                .id(pgBed.getId())
                .bedNumber(pgBed.getBedNumber())
                .isOccupied(pgBed.getIsOccupied())
                .build();
    }
}
