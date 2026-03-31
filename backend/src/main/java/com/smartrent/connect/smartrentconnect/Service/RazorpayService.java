package com.smartrent.connect.smartrentconnect.Service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Order;
import com.smartrent.connect.smartrentconnect.entity.Owner;
import com.smartrent.connect.smartrentconnect.entity.User;
import com.smartrent.connect.smartrentconnect.repository.OwnerRepository;
import com.smartrent.connect.smartrentconnect.repository.PaymentRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class RazorpayService {
    
    @Value("${razorpay.test.key}")
    private String razorpayTestKey;
    
    @Value("${razorpay.test.secret}")
    private String razorpayTestSecret;
    
    @Value("${razorpay.mode}")
    private String razorpayMode;
    
    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OwnerRepository ownerRepository;
    
    private RazorpayClient getRazorpayClient() throws RazorpayException {
        return new RazorpayClient(razorpayTestKey, razorpayTestSecret);
    }
    
    public Map<String, Object> createTransferOrder(Double amount) throws RazorpayException {
        RazorpayClient razorpay = getRazorpayClient();
        
        // Convert amount to paise
        int amountInPaise = (int) (amount * 100);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "order_" + System.currentTimeMillis());
        
        // Add 5-minute expiry (300 seconds from now)
        //orderRequest.put("expire_by", (System.currentTimeMillis() / 1000) + 300);
        
        // Remove transfers for now - simplify to basic order
        // TODO: Add transfers later when owner accounts are properly set up
        
        Order order = razorpay.orders.create(orderRequest);
        
        Map<String, Object> response = new HashMap<>();
        response.put("order_id", order.get("id"));
        response.put("amount", order.get("amount"));
        response.put("currency", order.get("currency"));
        response.put("key", razorpayTestKey);
        
        return response;
    }

    public boolean verifyPaymentSignature(String razorpayOrderId,
                                          String razorpayPaymentId,
                                          String razorpaySignature) {
        try {

            String payload = razorpayOrderId + "|" + razorpayPaymentId;

            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");

            SecretKeySpec secret_key = new SecretKeySpec(razorpayTestSecret.getBytes("UTF-8"), "HmacSHA256");

            sha256_HMAC.init(secret_key);

            byte[] hash = sha256_HMAC.doFinal(payload.getBytes("UTF-8"));

            // Convert to HEX (IMPORTANT - NOT Base64)
            String generatedSignature = bytesToHex(hash);

            // Constant time comparison
            return MessageDigest.isEqual(
                    generatedSignature.getBytes("UTF-8"),
                    razorpaySignature.getBytes("UTF-8")
            );

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
    
    public Map<String, Object> createOwnerAccount(User user, String accountNumber, String ifsc) throws RazorpayException {
        RazorpayClient razorpay = getRazorpayClient();
        Optional<Owner> owner = ownerRepository.findByEmail(user.getEmail());
        Map<String, Object> accountRequest = new HashMap<>();
        accountRequest.put("email", owner.get().getEmail());
        accountRequest.put("phone", owner.get().getPhoneNumber());
        accountRequest.put("type", "route");
        accountRequest.put("reference_id", "owner_" + owner.get().getId());
        accountRequest.put("legal_business_name", owner.get().getFullName());
        accountRequest.put("business_type", "individual");
        accountRequest.put("contact_name", owner.get().getFullName());
        
        Map<String, Object> profile = new HashMap<>();
        profile.put("category", "real_estate");
        accountRequest.put("profile", profile);
        
        com.razorpay.Account account = razorpay.account.create(new JSONObject(accountRequest));
        
        // Attach bank account
        Map<String, Object> bankAccountRequest = new HashMap<>();
        bankAccountRequest.put("account_number", accountNumber);
        bankAccountRequest.put("ifsc", ifsc);
        
        // Note: Bank account attachment would need to be done through separate API call
        // razorpay.account.transfer() method may not exist in current version
        
        // Return basic account info for now
        Map<String, Object> accountMap = new HashMap<>();
        accountMap.put("id", account.get("id"));
        accountMap.put("email", owner.get().getEmail());
        accountMap.put("status", "created");
        
        return accountMap;
    }
}
