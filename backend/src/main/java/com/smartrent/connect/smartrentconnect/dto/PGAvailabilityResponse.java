package com.smartrent.connect.smartrentconnect.dto;

import com.smartrent.connect.smartrentconnect.enums.GenderType;
import lombok.Data;
import lombok.Builder;

import java.util.List;

@Data
@Builder
public class PGAvailabilityResponse {

    private Long propertyId;
    private String propertyTitle;
    private GenderType genderAllowed;
    private Boolean foodIncluded;
    private List<PGRoomResponse> rooms;
}
