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

@Service
public class OwnerService {

    @Autowired
    private OwnerRepository ownerRepository;

    public Owner getCurrentOwner() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ownerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
    }

    public OwnerProfileResponseDTO getProfile() {
        Owner owner = getCurrentOwner();
        return convertToDTO(owner);
    }

    public OwnerProfileResponseDTO updateProfile(OwnerProfileUpdateDTO profileDTO) {
        Owner owner = getCurrentOwner();

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

        // If profile was just completed, set verification status to pending
        if (isProfileComplete && !owner.getIsVerified()) {
            owner.setVerificationStatus("PENDING");
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
        dto.setProfileImage(owner.getProfileImage());
        dto.setAadharCardImage(owner.getAadharCardImage());
        dto.setPanCardImage(owner.getPanCardImage());
        dto.setIsProfileComplete(owner.getIsProfileComplete());
        dto.setIsVerified(owner.getIsVerified());
        dto.setVerificationStatus(owner.getVerificationStatus());
        return dto;
    }
}