package com.smartrent.connect.smartrentconnect.dto;

import com.smartrent.connect.smartrentconnect.enums.DocumentType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDocumentUploadRequest {
    
    @NotNull(message = "Document type is required")
    private DocumentType documentType;
    
    @NotNull(message = "Document file is required")
    private MultipartFile file;
}
