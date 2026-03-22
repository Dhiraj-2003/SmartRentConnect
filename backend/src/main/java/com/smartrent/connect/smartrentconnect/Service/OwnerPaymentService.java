package com.smartrent.connect.smartrentconnect.Service;

import com.smartrent.connect.smartrentconnect.entity.Owner;
import com.smartrent.connect.smartrentconnect.entity.User;
import com.smartrent.connect.smartrentconnect.repository.OwnerRepository;
import com.smartrent.connect.smartrentconnect.Service.RazorpayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional
public class OwnerPaymentService {
    
    @Autowired
    private OwnerRepository ownerRepository;
    
    @Autowired
    private RazorpayService razorpayService;
    
    public Map<String, Object> onboardOwnerForPayments(Long Id, String accountHolderName, String accountNumber, String ifsc) {
        Owner owner = ownerRepository.findById(Id)
            .orElseThrow(() -> new RuntimeException("Owner not found"));
        
        try {
            //Map<String, Object> razorpayAccount = razorpayService.createOwnerAccount(owner, accountNumber, ifsc);
            
            // Update owner with Razorpay details
            Owner ownerEntity = (Owner) owner;
            //ownerEntity.setRazorpayAccountId((String) razorpayAccount.get("id"));
            ownerEntity.setIsOnlinePaymentEnabled(true);
            ownerEntity.setRazorpayOnboardingStatus("CREATED");
            
            ownerRepository.save(ownerEntity);
            
            return Map.of(
                "success", true,
                "message", "Owner successfully onboarded for online payments"
                //"razorpayAccountId", razorpayAccount.get("id")
            );
            
        } catch (Exception e) {
            Owner ownerEntity = (Owner) owner;
            ownerEntity.setRazorpayOnboardingStatus("FAILED");
            ownerRepository.save(ownerEntity);
            
            return Map.of(
                "success", false,
                "message", "Failed to onboard owner: " + e.getMessage()
            );
        }
    }
    
    public boolean isOwnerPaymentEnabled(Long ownerId) {
        Owner owner = ownerRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("Owner not found"));
        
        return owner.getIsOnlinePaymentEnabled() != null && owner.getIsOnlinePaymentEnabled();
    }
}
