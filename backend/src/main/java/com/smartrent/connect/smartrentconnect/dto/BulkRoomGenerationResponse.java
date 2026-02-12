package com.smartrent.connect.smartrentconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkRoomGenerationResponse {
    
    private Long pgDetailsId;
    private int totalFloors;
    private int totalRoomsGenerated;
    private int totalBedsGenerated;
    private List<String> generatedRoomNumbers;
    private String message;
    private boolean success;
}
