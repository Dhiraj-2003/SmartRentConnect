package com.smartrent.connect.smartrentconnect.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class BookingResponse {

    private String bookingId;
    private Long propertyId;
    private String propertyTitle;
    private Long roomId;
    private String roomNumber;
    private Long bedId;
    private Integer bedNumber;
    private Long tenantId;
    private String tenantName;
    private String bookingType; // FLAT or PG_BED
    private String status;
    private String message;
}
