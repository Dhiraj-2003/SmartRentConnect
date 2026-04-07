package com.smartrent.connect.smartrentconnect.service;

import com.smartrent.connect.smartrentconnect.entity.*;
import com.smartrent.connect.smartrentconnect.enums.BookingType;
import com.smartrent.connect.smartrentconnect.enums.OccupancyStatus;
import com.smartrent.connect.smartrentconnect.repository.PGBedRepository;
import com.smartrent.connect.smartrentconnect.repository.PGDetailsRepository;
import com.smartrent.connect.smartrentconnect.repository.PGRoomRepository;
import com.smartrent.connect.smartrentconnect.repository.TenantPropertyHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TenantPropertyHistoryService {

    private final TenantPropertyHistoryRepository tenantPropertyHistoryRepository;

    private final PGBedRepository pgBedRepository;
    private final PGRoomRepository pgRoomRepository;
    private final PGDetailsRepository pgDetailsRepository;
    /**
     * Create TenantPropertyHistory entry when booking is confirmed
     */
    public TenantPropertyHistory createFromBooking(Booking booking) {
        log.info("Creating TenantPropertyHistory for booking ID: {}", booking.getId());

        // Fetch PG bed if it's a PG booking
        PGBed pgBed = null;
        if (booking.getPgBedId() != null) {
            pgBed = pgBedRepository.findById(booking.getPgBedId()).orElse(null);
        }

        TenantPropertyHistory history = TenantPropertyHistory.builder()
                .tenant((Tenant) booking.getTenant())
                .owner(booking.getFlatDetails() != null ? 
                        booking.getFlatDetails().getProperty().getOwner() : 
                        (pgBed != null ? pgBed.getPgRoom().getPgDetails().getProperty().getOwner() : null))
                .property(booking.getFlatDetails() != null ? 
                        booking.getFlatDetails().getProperty() : 
                        (pgBed != null ? pgBed.getPgRoom().getPgDetails().getProperty() : null))
                .flatDetails(booking.getFlatDetails())
                .pgBed(pgBed)
                .bookingType(booking.getFlatDetails() != null ? BookingType.FLAT : BookingType.PG)
                .depositAmount(booking.getFlatDetails() != null ? 
                        booking.getFlatDetails().getProperty().getDeposit() :
                        (pgBed != null ? pgBed.getPgRoom().getPgDetails().getProperty().getDeposit() : booking.getDepositAmount()))
                .monthlyRent(booking.getFlatDetails() != null ? 
                        booking.getFlatDetails().getRentPerMonth() : 
                        (pgBed != null ? pgBed.getPgRoom().getPricePerBed() : 0.0))
                .bookingDate(booking.getBookingDate().toLocalDate())
                .occupancyStartDate(booking.getMoveInDate().toLocalDate())
                .nextRentDueDate(calculateNextRentDueDate(booking.getMoveInDate().toLocalDate()))
                .lastPaidDate(null) // First payment not made yet
                .status(OccupancyStatus.ACTIVE)
                .isActive(true)
                .build();

        TenantPropertyHistory saved = tenantPropertyHistoryRepository.save(history);
        log.info("Created TenantPropertyHistory with ID: {}", saved.getId());
        return saved;
    }

    /**
     * Update history after rent payment
     */
    public TenantPropertyHistory updateAfterPayment(Long historyId, LocalDate paymentDate) {
        TenantPropertyHistory history = tenantPropertyHistoryRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("TenantPropertyHistory not found with ID: " + historyId));

        history.setLastPaidDate(paymentDate);
        history.setNextRentDueDate(paymentDate.plusMonths(1));
        history.setStatus(OccupancyStatus.ACTIVE);

        TenantPropertyHistory updated = tenantPropertyHistoryRepository.save(history);
        log.info("Updated TenantPropertyHistory after payment - ID: {}, Next due date: {}", 
                updated.getId(), updated.getNextRentDueDate());
        return updated;
    }

    /**
     * Release tenant from property
     */
    public TenantPropertyHistory releaseTenant(Long historyId, String releaseReason) {
        TenantPropertyHistory history = tenantPropertyHistoryRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("TenantPropertyHistory not found with ID: " + historyId));

        history.setStatus(OccupancyStatus.RELEASED);
        history.setReleaseDate(LocalDate.now());
        history.setReleaseReason(releaseReason);
        history.setIsActive(false);

        // Mark flat/bed as available
        if (history.getFlatDetails() != null) {
            history.getFlatDetails().setIsOccupied(false);
        }
        if (history.getPgBed() != null) {
            history.getPgBed().setIsOccupied(false);
        }

        TenantPropertyHistory updated = tenantPropertyHistoryRepository.save(history);
        log.info("Released tenant from property - History ID: {}, Reason: {}", updated.getId(), releaseReason);
        return updated;
    }

    /**
     * Cancel tenancy
     */
    public TenantPropertyHistory cancelTenancy(Long historyId, String cancelReason) {
        TenantPropertyHistory history = tenantPropertyHistoryRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("TenantPropertyHistory not found with ID: " + historyId));

        history.setStatus(OccupancyStatus.CANCELLED);
        history.setReleaseDate(LocalDate.now());
        history.setReleaseReason(cancelReason);
        history.setIsActive(false);

        TenantPropertyHistory updated = tenantPropertyHistoryRepository.save(history);
        log.info("Cancelled tenancy - History ID: {}, Reason: {}", updated.getId(), cancelReason);
        return updated;
    }

    /**
     * Update rent due status (for scheduler)
     */
    public void updateRentDueStatus() {
        LocalDate today = LocalDate.now();
        List<TenantPropertyHistory> activeTenancies = tenantPropertyHistoryRepository.findAllActive();

        for (TenantPropertyHistory history : activeTenancies) {
            if (history.getNextRentDueDate().isEqual(today)) {
                history.setStatus(OccupancyStatus.RENT_DUE);
                tenantPropertyHistoryRepository.save(history);
                log.info("Updated status to RENT_DUE for history ID: {}", history.getId());
            } else if (history.getNextRentDueDate().isBefore(today)) {
                history.setStatus(OccupancyStatus.OVERDUE);
                tenantPropertyHistoryRepository.save(history);
                log.info("Updated status to OVERDUE for history ID: {}", history.getId());
            }
        }
    }

    /**
     * Get tenants with rent due in next N days
     */
    public List<TenantPropertyHistory> getTenantsWithRentDueInDays(int days) {
        LocalDate targetDate = LocalDate.now().plusDays(days);
        return tenantPropertyHistoryRepository.findRentDueByDate(targetDate);
    }

    /**
     * Get active tenancies for a tenant
     */
    public List<TenantPropertyHistory> getActiveTenanciesByTenantId(Long tenantId) {
        return tenantPropertyHistoryRepository.findActiveTenanciesByTenantId(tenantId);
    }

    /**
     * Get all active tenancies
     */
    public List<TenantPropertyHistory> getAllActiveTenancies() {
        return tenantPropertyHistoryRepository.findAllActive();
    }

    /**
     * Calculate next rent due date based on move-in date
     */
    private LocalDate calculateNextRentDueDate(LocalDate moveInDate) {
        // If move-in is on 1st-15th of month, next due is next month 1st
        // If move-in is on 16th-31st, next due is next month after next 1st
        if (moveInDate.getDayOfMonth() <= 15) {
            return moveInDate.plusMonths(1).withDayOfMonth(1);
        } else {
            return moveInDate.plusMonths(2).withDayOfMonth(1);
        }
    }

    /**
     * Find TenantPropertyHistory by booking ID
     */
    public TenantPropertyHistory findByBookingId(Long bookingId) {
        // This would need a custom query or relationship to booking
        // For now, returning null - you may need to add booking reference to TenantPropertyHistory
        return null;
    }

    /**
     * Get all tenant histories (for owner dashboard)
     */
    public List<TenantPropertyHistory> getAllTenantHistories() {
        return tenantPropertyHistoryRepository.findAll();
    }

    /**
     * Get tenant histories by owner ID
     */
    public List<TenantPropertyHistory> getTenantHistoriesByOwnerId(Long ownerId) {
        return tenantPropertyHistoryRepository.findByPropertyOwnerId(ownerId);
    }

    /**
     * Get tenant history by ID
     */
    public TenantPropertyHistory getTenantHistoryById(Long id) {
        return tenantPropertyHistoryRepository.findById(id).orElse(null);
    }

    /**
     * Save tenant history
     */
    public TenantPropertyHistory saveTenantHistory(TenantPropertyHistory history) {
        return tenantPropertyHistoryRepository.save(history);
    }
}
