package com.smartrent.connect.smartrentconnect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "property_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @NotBlank(message = "Image URL is required")
    @Column(name = "imageUrl", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "isPrimary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = false; // To mark the primary/cover image

    @Column(name = "displayOrder")
    @Builder.Default
    private Integer displayOrder = 0; // For ordering images in display

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
