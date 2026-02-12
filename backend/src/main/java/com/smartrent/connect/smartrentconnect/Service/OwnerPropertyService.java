package com.smartrent.connect.smartrentconnect.Service;

import com.smartrent.connect.smartrentconnect.dto.*;
import com.smartrent.connect.smartrentconnect.entity.*;
import com.smartrent.connect.smartrentconnect.enums.*;
import com.smartrent.connect.smartrentconnect.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OwnerPropertyService {

    private final PropertyRepository propertyRepository;
    private final OwnerRepository ownerRepository;
    private final FlatDetailsRepository flatDetailsRepository;
    private final PGDetailsRepository pgDetailsRepository;
    private final PGRoomRepository pgRoomRepository;
    private final PGBedRepository pgBedRepository;
    private final PropertyRatingRepository propertyRatingRepository;
    private final FileStorageService fileStorageService;
    private final CloudinaryService cloudinaryService;
    private final PropertyImageRepository propertyImageRepository;
    private final PropertyDocumentRepository propertyDocumentRepository;

    @Transactional
    public PropertyResponse createProperty(PropertyCreateRequest request, String ownerUsername) {
        Owner owner = ownerRepository.findByUsername(ownerUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Owner not found"));

        // Check if property with same title already exists for this owner
        if (propertyRepository.existsByOwnerAndTitle(owner, request.getTitle())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property with this title already exists");
        }

        // Create main property
        Property property = Property.builder()
                .title(request.getTitle())
                .propertyType(request.getPropertyType())
                .description(request.getDescription())
                .owner(owner)
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .deposit(request.getDeposit())
                .amenities(request.getAmenities())
                .status(PropertyStatus.PENDING)
                .build();

        Property savedProperty = propertyRepository.save(property);

        // Create type-specific details
        if (request.getPropertyType() == PropertyType.FLAT) {
            createFlatDetails(savedProperty, request);
        } else if (request.getPropertyType() == PropertyType.PG) {
            createPGDetails(savedProperty, request);
        }

        // Handle property images within the same transaction
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            uploadPropertyImages(savedProperty, request.getImages());
        }

        // Handle property documents within the same transaction
        if (request.getDocuments() != null && !request.getDocuments().isEmpty()) {
            uploadPropertyDocuments(savedProperty, request.getDocuments());
        }

        return mapToResponse(savedProperty);
    }

    private void createFlatDetails(Property property, PropertyCreateRequest request) {
        FlatDetails flatDetails = FlatDetails.builder()
                .property(property)
                .bhkType(request.getBhkType())
                .rentPerMonth(request.getRentPerMonth())
                .totalRooms(request.getTotalRooms())
                .bathrooms(request.getBathrooms())
                .furnishingType(request.getFurnishingType())
                .flatNumber(request.getFlatNumber())
                .build();

        flatDetailsRepository.save(flatDetails);
    }

    private void createPGDetails(Property property, PropertyCreateRequest request) {
        PGDetails pgDetails = PGDetails.builder()
                .property(property)
                .genderAllowed(GenderType.valueOf(request.getGenderAllowed()))
                .foodIncluded(request.getFoodIncluded())
                .build();

        PGDetails savedPGDetails = pgDetailsRepository.save(pgDetails);

        // NEW: Handle floor-based room configuration
        if (request.getFloorConfigs() != null) {
            for (FloorConfigDto floorConfig : request.getFloorConfigs()) {
                createRoomsFromFloorConfig(savedPGDetails, floorConfig);
            }
        }
    }

    public void createRoomsFromFloorConfig(PGDetails pgDetails, FloorConfigDto floorConfig) {
        try {
            // Parse starting room number
            String startingRoomNumber = floorConfig.getStartingRoomNumber();
            int startingNumber = Integer.parseInt(startingRoomNumber.replaceAll("[^0-9]", ""));
            
            // Generate rooms for this floor
            for (int i = 0; i < floorConfig.getTotalRooms(); i++) {
                String roomNumber = String.valueOf(startingNumber + i);
                
                // Create PGRoom entity directly (no need for PGRoomRequest)
                PGRoom pgRoom = PGRoom.builder()
                        .pgDetails(pgDetails)
                        .roomNumber(roomNumber)
                        .floorNumber(floorConfig.getFloorNumber())
                        .sharingType(SharingType.valueOf(floorConfig.getSharingType()))
                        .bathrooms(floorConfig.getBathrooms())
                        .pricePerBed(floorConfig.getPricePerBed())
                        .totalBeds(calculateBedsBySharingType(SharingType.valueOf(floorConfig.getSharingType())))
                        .build();
                
                // Save room and create beds using existing logic
                PGRoom savedRoom = pgRoomRepository.save(pgRoom);
                
                // Create beds for the room
                int totalBeds = calculateBedsBySharingType(SharingType.valueOf(floorConfig.getSharingType()));
                for (int bedNum = 1; bedNum <= totalBeds; bedNum++) {
                    PGBed bed = PGBed.builder()
                            .pgRoom(savedRoom)
                            .bedNumber(bedNum)
                            .isOccupied(false)
                            .build();
                    pgBedRepository.save(bed);
                }
            }
            
            log.info("Created {} rooms for floor {} starting from room {}", 
                    floorConfig.getTotalRooms(), 
                    floorConfig.getFloorNumber(), 
                    startingRoomNumber);
                    
        } catch (NumberFormatException e) {
            log.error("Invalid starting room number format: {}", floorConfig.getStartingRoomNumber(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Invalid starting room number format: " + floorConfig.getStartingRoomNumber());
        }
    }

    public PGRoomResponse addPGRoom(Long propertyId, PGRoomRequest request, String ownerUsername) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        // Verify ownership
        if (!property.getOwner().getUsername().equals(ownerUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to manage this property");
        }

        // Verify property is PG type
        if (property.getPropertyType() != PropertyType.PG) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property is not a PG type");
        }

        PGDetails pgDetails = pgDetailsRepository.findByPropertyId(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "PG details not found"));

        // Check if room number already exists
        if (pgRoomRepository.findByPgDetailsIdAndRoomNumber(pgDetails.getId(), request.getRoomNumber()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room number already exists");
        }

        PGRoom pgRoom = createPGRoom(pgDetails, request);
        return mapToResponse(pgRoom);
    }

    private PGRoom createPGRoom(PGDetails pgDetails, PGRoomRequest request) {
        // Calculate total beds based on sharing type
        Integer totalBeds = calculateBedsBySharingType(request.getSharingType());

        PGRoom pgRoom = PGRoom.builder()
                .pgDetails(pgDetails)
                .roomNumber(request.getRoomNumber())
                .sharingType(request.getSharingType())
                .totalBeds(totalBeds)
                .bathrooms(request.getBathrooms())
                .pricePerBed(request.getPricePerBed())
                .build();

        PGRoom savedRoom = pgRoomRepository.save(pgRoom);

        // Create beds for the room
        for (int i = 1; i <= totalBeds; i++) {
            PGBed bed = PGBed.builder()
                    .pgRoom(savedRoom)
                    .bedNumber(i)
                    .isOccupied(false)
                    .build();
            pgBedRepository.save(bed);
        }

        return savedRoom;
    }

    private Integer calculateBedsBySharingType(SharingType sharingType) {
        switch (sharingType) {
            case SINGLE:
                return 1;
            case DOUBLE:
                return 2;
            case TRIPLE:
                return 3;
            default:
                return 1;
        }
    }

    public void deletePGRoom(Long propertyId, Long roomId, String ownerUsername) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        // Verify ownership
        if (!property.getOwner().getUsername().equals(ownerUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to manage this property");
        }

        PGRoom pgRoom = pgRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        // Check if any beds are occupied
        List<PGBed> occupiedBeds = pgBedRepository.findByPgRoomIdAndIsOccupied(roomId, true);
        if (!occupiedBeds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete room with occupied beds");
        }

        pgRoomRepository.delete(pgRoom);
    }

    public List<PropertyResponse> getOwnerProperties(String ownerUsername) {
        Owner owner = ownerRepository.findByUsername(ownerUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Owner not found"));

        List<Property> properties = propertyRepository.findByOwner(owner);
        return properties.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PropertyResponse getPropertyById(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        return mapToResponse(property);
    }

    public PropertyResponse getPropertyById(Long propertyId, String ownerEmail) {
        Property property = getPropertyEntityById(propertyId, ownerEmail);
        return mapToResponse(property);
    }

    // NEW: Method to get Property entity directly for internal use
    public Property getPropertyEntityById(Long propertyId, String ownerName) {
        
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));


        // Verify ownership
        if (!property.getOwner().getUsername().equals(ownerName)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to access this property");
        }

        return property;
    }

    public void submitPropertyForVerification(Long propertyId, String ownerUsername) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        // Verify ownership
        if (!property.getOwner().getUsername().equals(ownerUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to manage this property");
        }

        if (property.getStatus() != PropertyStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property is not in pending status");
        }

        property.setStatus(PropertyStatus.PENDING);
        propertyRepository.save(property);
    }

    public PropertyResponse mapToResponse(Property property) {
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
                .rejectionReason(property.getRejectionReason())
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

        // Add property images
        List<String> imageUrls = propertyImageRepository.findByPropertyId(property.getId())
                .stream()
                .map(PropertyImage::getImageUrl)
                .collect(Collectors.toList());
        builder.images(imageUrls);

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
        List<PGRoomResponse> roomResponses = pgDetails.getRooms().stream()
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

    //Images and Document Uploading methods
    private void uploadPropertyImages(Property property, List<MultipartFile> images) {
        try {
            String sanitizedTitle = cloudinaryService.sanitizeTitle(property.getTitle());
            String folderPath = "SmartRentConnect/properties/" + sanitizedTitle + "/propertyImages";
            
            for (int i = 0; i < images.size(); i++) {
                MultipartFile image = images.get(i);
                
                // Validate image file
                if (!cloudinaryService.isValidImageFile(image)) {
                    throw new RuntimeException("Invalid image file type: " + image.getContentType());
                }
                
                if (!cloudinaryService.isValidFileSize(image)) {
                    throw new RuntimeException("Image file size exceeds maximum limit of 5MB");
                }
                
                // Upload to Cloudinary
                String imageUrl = cloudinaryService.uploadFile(image, folderPath);
                
                // Save to database
                PropertyImage propertyImage = PropertyImage.builder()
                        .property(property)
                        .imageUrl(imageUrl)
                        .isPrimary(i == 0) // First image is primary
                        .displayOrder(i)
                        .build();
                
                propertyImageRepository.save(propertyImage);
            }
            
            log.info("Successfully uploaded {} images for property: {}", images.size(), property.getId());
            
        } catch (Exception e) {
            log.error("Failed to upload images for property {}: {}", property.getId(), e.getMessage());
            throw new RuntimeException("Failed to upload property images: " + e.getMessage(), e);
        }
    }

    private void uploadPropertyDocuments(Property property, List<PropertyDocumentUploadRequest> documents) {
        try {
            String sanitizedTitle = cloudinaryService.sanitizeTitle(property.getTitle());
            String folderPath = "SmartRentConnect/properties/" + sanitizedTitle + "/propertyDocuments";
            
            for (PropertyDocumentUploadRequest docRequest : documents) {
                MultipartFile document = docRequest.getFile();
                
                // Validate document file
                if (!cloudinaryService.isValidDocumentFile(document)) {
                    throw new RuntimeException("Invalid document file type: " + document.getContentType());
                }
                
                if (!cloudinaryService.isValidFileSize(document)) {
                    throw new RuntimeException("Document file size exceeds maximum limit of 5MB");
                }
                
                // Upload to Cloudinary
                String documentUrl = cloudinaryService.uploadFile(document, folderPath);
                
                // Save to database
                PropertyDocument propertyDocument = PropertyDocument.builder()
                        .property(property)
                        .documentType(docRequest.getDocumentType())
                        .documentUrl(documentUrl)
                        .documentName(document.getOriginalFilename())
                        .build();
                
                propertyDocumentRepository.save(propertyDocument);
            }
            
            log.info("Successfully uploaded {} documents for property: {}", documents.size(), property.getId());
            
        } catch (Exception e) {
            log.error("Failed to upload documents for property {}: {}", property.getId(), e.getMessage());
            throw new RuntimeException("Failed to upload property documents: " + e.getMessage(), e);
        }
    }
}
