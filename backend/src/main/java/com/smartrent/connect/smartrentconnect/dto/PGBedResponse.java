package com.smartrent.connect.smartrentconnect.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class PGBedResponse {

    private Long id;
    private String bedNumber;
    private Boolean isOccupied;
}
