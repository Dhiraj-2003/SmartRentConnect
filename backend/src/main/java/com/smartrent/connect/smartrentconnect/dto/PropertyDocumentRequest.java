package com.smartrent.connect.smartrentconnect.dto;

import com.smartrent.connect.smartrentconnect.enums.DocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDocumentRequest {
    @NotNull(message = "Property ID is required")
    private Long propertyId;

    @NotNull(message = "Document type is required")
    private DocumentType documentType;

    @NotBlank(message = "Document URL is required")
    private String documentUrl;

    @NotBlank(message = "Document name is required")
    private String documentName;
}
