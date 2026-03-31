package com.smartrent.connect.smartrentconnect.dto;

import com.smartrent.connect.smartrentconnect.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDocumentResponse {
    private Long id;
    private Long propertyId;
    private DocumentType documentType;
    private String documentTypeDisplayName;
    private String documentUrl;
    private String documentName;
    private LocalDateTime uploadedAt;
}
