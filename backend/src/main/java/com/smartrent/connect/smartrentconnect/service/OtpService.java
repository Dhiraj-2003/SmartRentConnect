package com.smartrent.connect.smartrentconnect.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;
    private final SecureRandom secureRandom = new SecureRandom();

    // Store OTPs with property ID as key and OTP details as value
    private final Map<String, OtpDetails> otpStore = new ConcurrentHashMap<>();

    public String generateOtp() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(secureRandom.nextInt(10));
        }
        return otp.toString();
    }

    public void storeOtp(String propertyId, String otp, String ownerEmail) {
        OtpDetails details = new OtpDetails(
                otp,
                ownerEmail,
                LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)
        );
        otpStore.put(propertyId, details);
        log.info("OTP stored for property ID: {}, owner email: {}, expires at: {}",
                propertyId, ownerEmail, details.expiryTime);
    }

    public boolean verifyOtp(String propertyId, String enteredOtp) {
        OtpDetails details = otpStore.get(propertyId);
        if (details == null) {
            log.warn("No OTP found for property ID: {}", propertyId);
            return false;
        }

        if (LocalDateTime.now().isAfter(details.expiryTime)) {
            log.warn("OTP expired for property ID: {}", propertyId);
            otpStore.remove(propertyId);
            return false;
        }

        if (!details.otp.equals(enteredOtp)) {
            log.warn("Invalid OTP entered for property ID: {}", propertyId);
            return false;
        }

        log.info("OTP verified successfully for property ID: {}", propertyId);
        otpStore.remove(propertyId); // Remove OTP after successful verification
        return true;
    }

    public String getOwnerEmail(String propertyId) {
        OtpDetails details = otpStore.get(propertyId);
        return details != null ? details.ownerEmail : null;
    }

    private static class OtpDetails {
        final String otp;
        final String ownerEmail;
        final LocalDateTime expiryTime;

        OtpDetails(String otp, String ownerEmail, LocalDateTime expiryTime) {
            this.otp = otp;
            this.ownerEmail = ownerEmail;
            this.expiryTime = expiryTime;
        }
    }
}
