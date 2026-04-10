package com.smartrent.connect.smartrentconnect.entity;

import com.smartrent.connect.smartrentconnect.enums.DocumentType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "property_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Enumerated(EnumType.STRING)
    @Column(name = "documentType", nullable = false, length = 50)
    private DocumentType documentType; // e.g., OWNERSHIP_PROOF, TAX_RECEIPT, NOC, etc.

    @NotBlank(message = "Document URL is required")
    @Column(name = "documentUrl", nullable = false, length = 500)
    private String documentUrl;

    @NotBlank(message = "Document name is required")
    @Column(name = "documentName", nullable = false, length = 255)
    private String documentName;

    @Column(name = "uploadedAt")
    @Builder.Default
    private java.time.LocalDateTime uploadedAt = java.time.LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (uploadedAt == null) {
            uploadedAt = java.time.LocalDateTime.now();
        }
    }
}
