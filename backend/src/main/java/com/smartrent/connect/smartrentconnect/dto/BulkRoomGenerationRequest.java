package com.smartrent.connect.smartrentconnect.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkRoomGenerationRequest {
    
    @NotNull(message = "PG Details ID is required")
    private Long pgDetailsId;
    
    @NotEmpty(message = "At least one floor configuration is required")
    private List<FloorConfigDto> floorConfigs;
}
