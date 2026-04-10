package com.smartrent.connect.smartrentconnect.dto;

import com.smartrent.connect.smartrentconnect.entity.GuestPass;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestPassResponse {

    private Long id;
    private String passId;
    private String visitorName;
    private String visitorMobile;
    private String visitorImage;
    private LocalDateTime visitDateTime;
    private Integer numberOfGuests;
    private Long tenantId;
    private String tenantName;
    private String tenantRoomNumber;
    private String status;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private String verifiedBy;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private String qrCodeData; // QR code as base64 image
}
