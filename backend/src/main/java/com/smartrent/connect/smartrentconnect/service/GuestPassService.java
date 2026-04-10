package com.smartrent.connect.smartrentconnect.service;

import com.smartrent.connect.smartrentconnect.dto.GuestPassRequest;
import com.smartrent.connect.smartrentconnect.dto.GuestPassResponse;
import com.smartrent.connect.smartrentconnect.entity.GuestPass;
import com.smartrent.connect.smartrentconnect.entity.Tenant;
import com.smartrent.connect.smartrentconnect.repository.GuestPassRepository;
import com.smartrent.connect.smartrentconnect.repository.TenantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GuestPassService {

    private final GuestPassRepository guestPassRepository;
    private final TenantRepository tenantRepository;
    private final QRCodeService qrCodeService;

    public GuestPassService(GuestPassRepository guestPassRepository, 
                           TenantRepository tenantRepository,
                           QRCodeService qrCodeService) {
        this.guestPassRepository = guestPassRepository;
        this.tenantRepository = tenantRepository;
        this.qrCodeService = qrCodeService;
    }

    public GuestPassResponse createGuestPass(GuestPassRequest request, String tenantUsername) {
        Tenant tenant = tenantRepository.findByUsername(tenantUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

        GuestPass guestPass = new GuestPass();
        guestPass.setVisitorName(request.getVisitorName());
        guestPass.setVisitorMobile(request.getVisitorMobile());
        guestPass.setVisitorImage(request.getVisitorImage());
        guestPass.setVisitDateTime(request.getVisitDateTime());
        guestPass.setNumberOfGuests(request.getNumberOfGuests());
        guestPass.setTenant(tenant);

        GuestPass savedGuestPass = guestPassRepository.save(guestPass);
        return mapToResponse(savedGuestPass);
    }

    public List<GuestPassResponse> getGuestPassesByTenant(String tenantUsername) {
        Tenant tenant = tenantRepository.findByUsername(tenantUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

        return guestPassRepository.findByTenantOrderByCreatedAtDesc(tenant)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public GuestPassResponse getGuestPassByPassId(String passId) {
        GuestPass guestPass = guestPassRepository.findByPassId(passId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guest pass not found"));

        return mapToResponse(guestPass);
    }

    public GuestPassResponse verifyGuestPass(String passId, String watchmanUsername) {
        GuestPass guestPass = guestPassRepository.findByPassId(passId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guest pass not found"));

        // Check if pass is expired
        if (guestPass.getExpiresAt().isBefore(LocalDateTime.now())) {
            guestPass.setStatus(GuestPass.GuestPassStatus.EXPIRED);
            guestPassRepository.save(guestPass);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guest pass has expired");
        }

        // Check if pass is already used
        if (guestPass.getStatus() == GuestPass.GuestPassStatus.USED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guest pass has already been used");
        }

        // Mark as used and record entry
        guestPass.setStatus(GuestPass.GuestPassStatus.USED);
        guestPass.setEntryTime(LocalDateTime.now());
        guestPass.setVerifiedBy(watchmanUsername);

        GuestPass updatedGuestPass = guestPassRepository.save(guestPass);
        return mapToResponse(updatedGuestPass);
    }

    public GuestPassResponse recordExit(String passId, String watchmanUsername) {
        GuestPass guestPass = guestPassRepository.findByPassId(passId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guest pass not found"));

        if (guestPass.getEntryTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guest has not entered yet");
        }

        if (guestPass.getExitTime() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exit already recorded");
        }

        guestPass.setExitTime(LocalDateTime.now());
        GuestPass updatedGuestPass = guestPassRepository.save(guestPass);

        return mapToResponse(updatedGuestPass);
    }

    public void cancelGuestPass(Long guestPassId, String tenantUsername) {
        GuestPass guestPass = guestPassRepository.findById(guestPassId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guest pass not found"));

        // Check if the tenant is authorized to cancel this pass
        if (!guestPass.getTenant().getUsername().equals(tenantUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to cancel this guest pass");
        }

        if (guestPass.getStatus() == GuestPass.GuestPassStatus.USED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel a used guest pass");
        }

        guestPass.setStatus(GuestPass.GuestPassStatus.CANCELLED);
        guestPassRepository.save(guestPass);
    }

    public List<GuestPassResponse> getAllActiveGuestPasses() {
        return guestPassRepository.findByStatus(GuestPass.GuestPassStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private GuestPassResponse mapToResponse(GuestPass guestPass) {
        // Generate QR code data
        String qrData = qrCodeService.generateGuestPassQRData(
                guestPass.getPassId(),
                guestPass.getVisitorName(),
                guestPass.getVisitorMobile(),
                guestPass.getTenant().getFullName()
                //guestPass.getTenant().getRoomNumber()
        );

        String qrCodeBase64 = qrCodeService.generateQRCodeBase64(qrData);

        GuestPassResponse response = new GuestPassResponse();
        response.setId(guestPass.getId());
        response.setPassId(guestPass.getPassId());
        response.setVisitorName(guestPass.getVisitorName());
        response.setVisitorMobile(guestPass.getVisitorMobile());
        response.setVisitorImage(guestPass.getVisitorImage());
        response.setVisitDateTime(guestPass.getVisitDateTime());
        response.setNumberOfGuests(guestPass.getNumberOfGuests());
        response.setTenantId(guestPass.getTenant().getId());
        response.setTenantName(guestPass.getTenant().getFullName());
        //response.setTenantRoomNumber(guestPass.getTenant().getRoomNumber());
        response.setStatus(guestPass.getStatus().name());
        response.setEntryTime(guestPass.getEntryTime());
        response.setExitTime(guestPass.getExitTime());
        response.setVerifiedBy(guestPass.getVerifiedBy());
        response.setCreatedAt(guestPass.getCreatedAt());
        response.setExpiresAt(guestPass.getExpiresAt());
        response.setQrCodeData(qrCodeBase64);
        return response;
    }
}
