package com.smartrent.connect.smartrentconnect.Service;

import com.smartrent.connect.smartrentconnect.dto.OwnerProfileResponseDTO;
import com.smartrent.connect.smartrentconnect.dto.OwnerProfileUpdateDTO;
import com.smartrent.connect.smartrentconnect.entity.Owner;
import com.smartrent.connect.smartrentconnect.entity.User;
import com.smartrent.connect.smartrentconnect.repository.OwnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;

@Service
public class OwnerService {

    @Autowired
    private OwnerRepository ownerRepository;
    
    @Value("${server.port:8080}")
    private String serverPort;
    
    private String generateFileUrl(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return null;
        }
        
        // If it's already a full URL, return as is
        if (filePath.startsWith("http")) {
            return filePath;
        }
        
        // Generate full URL for file serving
        String baseUrl = "http://localhost:" + serverPort;
        if (filePath.startsWith("/uploads/")) {
            return baseUrl + filePath;
        } else if (filePath.startsWith("uploads/")) {
            return baseUrl + "/" + filePath;
        } else {
            return baseUrl + "/uploads/" + filePath;
        }
    }

    public Owner getCurrentOwner() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("Looking for owner with username: " + username);
        Optional<Owner> ownerOpt = ownerRepository.findByUsername(username);
        if (ownerOpt.isPresent()) {
            System.out.println("Owner found: " + ownerOpt.get().getUsername());
            return ownerOpt.get();
        } else {
            System.out.println("No owner found with username: " + username);
            throw new RuntimeException("Owner not found");
        }
    }

    public OwnerProfileResponseDTO getProfile() {
        try {
            Owner owner = getCurrentOwner();
            System.out.println("Found owner: " + owner.getEmail());
            return convertToDTO(owner);
        } catch (RuntimeException e) {
            // If owner not found, return a basic profile with just username
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("Owner not found for username: " + username + ", returning basic profile");
            OwnerProfileResponseDTO dto = new OwnerProfileResponseDTO();
            dto.setUsername(username);
            dto.setIsProfileComplete(false);
            dto.setIsVerified(false);
            dto.setVerificationStatus("PENDING");
            return dto;
        }
    }

    public OwnerProfileResponseDTO updateProfile(OwnerProfileUpdateDTO profileDTO) {
        Owner owner;
        try {
            owner = getCurrentOwner();
        } catch (RuntimeException e) {
            // If owner doesn't exist, create a new one
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("Creating new owner for username: " + username);
            owner = new Owner();
            owner.setUsername(username);
            // We'll need to set email later when we have it
            owner.setIsProfileComplete(false);
            owner.setIsVerified(false);
            owner.setVerificationStatus("PENDING");
        }

        // Update basic profile information
        owner.setFullName(profileDTO.getFullName());
        owner.setPhoneNumber(profileDTO.getPhone());
        owner.setAddress(profileDTO.getAddress());
        owner.setCity(profileDTO.getCity());
        owner.setState(profileDTO.getState());
        owner.setPincode(profileDTO.getPincode());
        owner.setDateOfBirth(profileDTO.getDateOfBirth());

        // Update file URLs if provided
        if (profileDTO.getProfileImageUrl() != null && !profileDTO.getProfileImageUrl().isEmpty()) {
            owner.setProfileImage(profileDTO.getProfileImageUrl());
        }
        if (profileDTO.getAadharCardUrl() != null && !profileDTO.getAadharCardUrl().isEmpty()) {
            owner.setAadharCardImage(profileDTO.getAadharCardUrl());
        }
        if (profileDTO.getPanCardUrl() != null && !profileDTO.getPanCardUrl().isEmpty()) {
            owner.setPanCardImage(profileDTO.getPanCardUrl());
        }

        // Check if profile is complete
        boolean isProfileComplete = isProfileComplete(owner);
        owner.setIsProfileComplete(isProfileComplete);

        // If profile was just completed, set verification status to pending and clear rejection reason
        if (isProfileComplete && !owner.getIsVerified()) {
            owner.setVerificationStatus("PENDING");
            owner.setRejectionReason(null); // Clear any previous rejection reason
        }

        Owner savedOwner = ownerRepository.save(owner);
        return convertToDTO(savedOwner);
    }

    private boolean isProfileComplete(Owner owner) {
        return owner.getFullName() != null && !owner.getFullName().isEmpty() &&
                owner.getPhoneNumber() != null && !owner.getPhoneNumber().isEmpty() &&
                owner.getAddress() != null && !owner.getAddress().isEmpty() &&
                owner.getCity() != null && !owner.getCity().isEmpty() &&
                owner.getState() != null && !owner.getState().isEmpty() &&
                owner.getPincode() != null && !owner.getPincode().isEmpty() &&
                owner.getDateOfBirth() != null && !owner.getDateOfBirth().isEmpty() &&
                owner.getAadharCardImage() != null && !owner.getAadharCardImage().isEmpty() &&
                owner.getPanCardImage() != null && !owner.getPanCardImage().isEmpty();
    }

    private OwnerProfileResponseDTO convertToDTO(Owner owner) {
        OwnerProfileResponseDTO dto = new OwnerProfileResponseDTO();
        dto.setId(owner.getId());
        dto.setUsername(owner.getUsername());
        dto.setEmail(owner.getEmail());
        dto.setFullName(owner.getFullName());
        dto.setPhoneNumber(owner.getPhoneNumber());
        dto.setBusinessName(owner.getBusinessName());
        dto.setGstNumber(owner.getGstNumber());
        dto.setAddress(owner.getAddress());
        dto.setCity(owner.getCity());
        dto.setState(owner.getState());
        dto.setPincode(owner.getPincode());
        dto.setDateOfBirth(owner.getDateOfBirth());
        
        // Generate full URLs for file paths
        dto.setProfileImage(generateFileUrl(owner.getProfileImage()));
        dto.setAadharCardImage(generateFileUrl(owner.getAadharCardImage()));
        dto.setPanCardImage(generateFileUrl(owner.getPanCardImage()));
        
        dto.setIsProfileComplete(owner.getIsProfileComplete());
        dto.setIsVerified(owner.getIsVerified());
        dto.setVerificationStatus(owner.getVerificationStatus());
        dto.setRejectionReason(owner.getRejectionReason());
        
        System.out.println("Generated URLs - Profile: " + dto.getProfileImage() + 
                          ", Aadhar: " + dto.getAadharCardImage() + 
                          ", PAN: " + dto.getPanCardImage());
        
        return dto;
    }
}