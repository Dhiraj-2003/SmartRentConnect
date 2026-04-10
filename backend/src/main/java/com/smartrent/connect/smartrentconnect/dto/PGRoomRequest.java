package com.smartrent.connect.smartrentconnect.dto;

import com.smartrent.connect.smartrentconnect.enums.SharingType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PGRoomRequest {

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotNull(message = "Sharing type is required")
    private SharingType sharingType;

    @NotNull(message = "Bathrooms is required")
    private Integer bathrooms;

    @NotNull(message = "Price per bed is required")
    @Positive(message = "Price must be positive")
    private Double pricePerBed;
}
