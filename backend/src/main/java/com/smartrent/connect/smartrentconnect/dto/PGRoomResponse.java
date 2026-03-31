package com.smartrent.connect.smartrentconnect.dto;

import com.smartrent.connect.smartrentconnect.enums.SharingType;
import lombok.Data;
import lombok.Builder;

import java.util.List;

@Data
@Builder
public class PGRoomResponse {

    private Long id;
    private String roomNumber;
    private SharingType sharingType;
    private Integer totalBeds;
    private Integer bathrooms;
    private Double pricePerBed;
    private Integer availableBeds;
    private List<PGBedResponse> beds;
}
