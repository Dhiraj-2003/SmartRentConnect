package com.smartrent.connect.smartrentconnect.Service;

import com.smartrent.connect.smartrentconnect.dto.BulkRoomGenerationRequest;
import com.smartrent.connect.smartrentconnect.dto.BulkRoomGenerationResponse;
import com.smartrent.connect.smartrentconnect.dto.FloorConfigDto;
import com.smartrent.connect.smartrentconnect.entity.PGBed;
import com.smartrent.connect.smartrentconnect.entity.PGDetails;
import com.smartrent.connect.smartrentconnect.entity.PGRoom;
import com.smartrent.connect.smartrentconnect.enums.SharingType;
import com.smartrent.connect.smartrentconnect.repository.PGBedRepository;
import com.smartrent.connect.smartrentconnect.repository.PGDetailsRepository;
import com.smartrent.connect.smartrentconnect.repository.PGRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PGRoomGenerationService {

    private final PGDetailsRepository pgDetailsRepository;
    private final PGRoomRepository pgRoomRepository;
    private final PGBedRepository pgBedRepository;
    private final OwnerPropertyService ownerPropertyService; // NEW: Use existing service

    public BulkRoomGenerationResponse generateRooms(BulkRoomGenerationRequest request) {
        log.info("Starting bulk room generation for PG Details ID: {}", request.getPgDetailsId());

        // Validate PG Details exists
        PGDetails pgDetails = pgDetailsRepository.findById(request.getPgDetailsId())
                .orElseThrow(() -> new RuntimeException("PG Details not found with ID: " + request.getPgDetailsId()));

        // Check if rooms already exist for this PG
        List<PGRoom> existingRooms = pgRoomRepository.findByPgDetailsId(request.getPgDetailsId());
        if (!existingRooms.isEmpty()) {
            log.warn("PG Details ID {} already has {} rooms. Clearing existing rooms.", 
                    request.getPgDetailsId(), existingRooms.size());
            
            // Delete existing beds first (due to foreign key constraint)
            for (PGRoom room : existingRooms) {
                pgBedRepository.deleteByPGRoomId(room.getId());
            }
            
            // Delete existing rooms
            pgRoomRepository.deleteByPgDetailsId(request.getPgDetailsId());
        }

        List<String> generatedRoomNumbers = new ArrayList<>();
        int totalRoomsGenerated = 0;
        int totalBedsGenerated = 0;

        try {
            for (FloorConfigDto floorConfig : request.getFloorConfigs()) {
                log.info("Processing floor {}: {} rooms starting from {}", 
                        floorConfig.getFloorNumber(), floorConfig.getTotalRooms(), floorConfig.getStartingRoomNumber());

                // DELEGATE to OwnerPropertyService to avoid duplicate logic
                ownerPropertyService.createRoomsFromFloorConfig(pgDetails, floorConfig);

                totalRoomsGenerated += floorConfig.getTotalRooms();
                totalBedsGenerated += calculateBedsBySharingType(SharingType.valueOf(floorConfig.getSharingType()));
            }

            BulkRoomGenerationResponse response = BulkRoomGenerationResponse.builder()
                    .pgDetailsId(request.getPgDetailsId())
                    .totalFloors(request.getFloorConfigs().size())
                    .totalRoomsGenerated(totalRoomsGenerated)
                    .totalBedsGenerated(totalBedsGenerated)
                    .generatedRoomNumbers(generatedRoomNumbers)
                    .message("Successfully generated " + totalRoomsGenerated + " rooms with " + totalBedsGenerated + " beds")
                    .success(true)
                    .build();

            log.info("Bulk room generation completed successfully. Generated {} rooms and {} beds", 
                    totalRoomsGenerated, totalBedsGenerated);

            return response;

        } catch (Exception e) {
            log.error("Error during bulk room generation: {}", e.getMessage(), e);
            
            return BulkRoomGenerationResponse.builder()
                    .pgDetailsId(request.getPgDetailsId())
                    .totalFloors(0)
                    .totalRoomsGenerated(0)
                    .totalBedsGenerated(0)
                    .generatedRoomNumbers(new ArrayList<>())
                    .message("Failed to generate rooms: " + e.getMessage())
                    .success(false)
                    .build();
        }
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

    private int extractNumericPrefix(String roomNumber) {
        // Extract numeric part from room number (e.g., "101" from "101" or "A101")
        String numericPart = roomNumber.replaceAll("[^0-9]", "");
        return numericPart.isEmpty() ? 1 : Integer.parseInt(numericPart);
    }

    private String extractAlphaSuffix(String roomNumber) {
        // Extract alphabetic part from room number (e.g., "A" from "A101")
        String alphaPart = roomNumber.replaceAll("[0-9]", "");
        return alphaPart;
    }

    private String generateRoomNumber(int prefix, String suffix, int offset) {
        // Generate sequential room numbers
        int newNumber = prefix + offset;
        return suffix + newNumber;
    }
}
