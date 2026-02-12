package com.smartrent.connect.smartrentconnect.controller;

import com.smartrent.connect.smartrentconnect.Service.PGRoomGenerationService;
import com.smartrent.connect.smartrentconnect.dto.BulkRoomGenerationRequest;
import com.smartrent.connect.smartrentconnect.dto.BulkRoomGenerationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/owner/pg")
@RequiredArgsConstructor
@Slf4j
public class PGRoomGenerationController {

    private final PGRoomGenerationService pgRoomGenerationService;

    @PostMapping("/{pgDetailsId}/generate-rooms")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<BulkRoomGenerationResponse> generateRooms(
            @PathVariable Long pgDetailsId,
            @Valid @RequestBody BulkRoomGenerationRequest request) {
        
        log.info("Received bulk room generation request for PG Details ID: {}", pgDetailsId);
        
        // Ensure the pgDetailsId in request matches the path variable
        request.setPgDetailsId(pgDetailsId);
        
        BulkRoomGenerationResponse response = pgRoomGenerationService.generateRooms(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/{pgDetailsId}/room-summary")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Object> getRoomSummary(
           @PathVariable Long pgDetailsId) {
        
        log.info("Fetching room summary for PG Details ID: {}", pgDetailsId);
        
        // This endpoint can be implemented to provide summary of existing rooms
        // For now, returning a simple response
        return ResponseEntity.ok().body(Map.of(
            "pgDetailsId", pgDetailsId,
            "message", "Room summary endpoint - to be implemented"
        ));
    }
}
