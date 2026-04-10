package com.smartrent.connect.smartrentconnect.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class FlatDetailsResponse {

    private Long id;
    private String bhkType;
    private Double rentPerMonth;
    private Integer totalRooms;
    private Integer bathrooms;
    private String furnishingType;
    private String flatNumber;
}
