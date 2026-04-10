package com.smartrent.connect.smartrentconnect.service;

import com.smartrent.connect.smartrentconnect.entity.Booking;
import com.smartrent.connect.smartrentconnect.entity.FlatDetails;
import com.smartrent.connect.smartrentconnect.entity.PGBed;
import com.smartrent.connect.smartrentconnect.entity.Payment;
import com.smartrent.connect.smartrentconnect.entity.TenantPropertyHistory;
import com.smartrent.connect.smartrentconnect.enums.PaymentMethod;
import com.smartrent.connect.smartrentconnect.enums.PaymentStatus;
import com.smartrent.connect.smartrentconnect.repository.BookingRepository;
import com.smartrent.connect.smartrentconnect.repository.FlatDetailsRepository;
import com.smartrent.connect.smartrentconnect.repository.PGBedRepository;
import com.smartrent.connect.smartrentconnect.repository.PaymentRepository;
import com.smartrent.connect.smartrentconnect.repository.TenantPropertyHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PGBedRepository pgBedRepository;

    @Autowired
    private FlatDetailsRepository flatDetailsRepository;
    
    @Autowired
    private TenantPropertyHistoryRepository tenantPropertyHistoryRepository;
    
    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }
    
    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }
    
    public List<Payment> getPaymentsByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }
    
    public Payment createOnlinePayment(Long bookingId, Double amount, String razorpayOrderId) {
        Payment payment = new Payment();
        
        // Fetch and set booking
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Handle flat booking
        if (booking.getFlatDetails() != null) {
            Optional<FlatDetails> flatDetails = flatDetailsRepository.findById(booking.getFlatDetails().getId());
            flatDetails.get().setIsOccupied(true);
            flatDetailsRepository.save(flatDetails.get());
        }
        // Handle PG booking - occupy the bed
        else if (booking.getPgBedId() != null) {
            PGBed pgBed = pgBedRepository.findById(booking.getPgBedId())
                .orElseThrow(() -> new RuntimeException("PG bed not found"));
            pgBed.setIsOccupied(true);
            pgBedRepository.save(pgBed);
        }

        payment.setBooking(booking);
        payment.setAmount(amount);
        payment.setPaymentMethod(PaymentMethod.ONLINE);
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setRazorpayOrderId(razorpayOrderId);
        
        return paymentRepository.save(payment);
    }
    
    public Payment createCashPayment(Long bookingId, Double amount) {
        Payment payment = new Payment();
        
        // Fetch and set booking
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // For PG bookings with cash payment, occupy bed immediately
        if (booking.getPgBedId() != null) {
            System.out.println("Occupying PG bed for cash payment: " + booking.getPgBedId());
            PGBed pgBed = pgBedRepository.findById(booking.getPgBedId()).orElseThrow(null);
            pgBed.setIsOccupied(true);
            pgBedRepository.save(pgBed);
        }else if(booking.getFlatDetails().getId()!=null){
            Optional<FlatDetails> flatDetails = flatDetailsRepository.findById(booking.getFlatDetails().getId());
            flatDetails.get().setIsOccupied(true);
            flatDetailsRepository.save(flatDetails.get());
        }else{
            throw new RuntimeException("Booking is Already Done");
        }

        payment.setBooking(booking);
        payment.setAmount(amount);
        payment.setPaymentMethod(PaymentMethod.CASH);
        payment.setPaymentStatus(PaymentStatus.PENDING);
        
        return paymentRepository.save(payment);
    }
    
    public void confirmPayment(Long paymentId) {
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isEmpty()) {
            throw new RuntimeException("Payment not found");
        }
        
        Payment payment = paymentOpt.get();
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);
        
        // Update TenantPropertyHistory after successful payment
        updateTenantPropertyHistoryAfterPayment(payment);
    }
    
    /**
     * Update TenantPropertyHistory after successful rent payment
     */
    private void updateTenantPropertyHistoryAfterPayment(Payment payment) {
        try {
            // Find the active TenantPropertyHistory for this booking
            List<TenantPropertyHistory> histories = tenantPropertyHistoryRepository
                    .findByTenantIdAndPropertyId(
                            payment.getBooking().getTenant().getId(),
                            payment.getBooking().getPropertyId()
                    );
            
            // Find the active history
            TenantPropertyHistory activeHistory = histories.stream()
                    .filter(history -> history.getIsActive())
                    .findFirst()
                    .orElse(null);
            
            if (activeHistory != null) {
                // Update the history record
                activeHistory.setLastPaidDate(LocalDate.now());
                activeHistory.setNextRentDueDate(activeHistory.getNextRentDueDate().plusMonths(1));
                activeHistory.setStatus(com.smartrent.connect.smartrentconnect.enums.OccupancyStatus.ACTIVE);
                
                tenantPropertyHistoryRepository.save(activeHistory);
                
                System.out.println("Updated TenantPropertyHistory after payment for tenant: " + 
                        payment.getBooking().getTenant().getUsername() +
                        ", Next due date: " + activeHistory.getNextRentDueDate());
            } else {
                System.err.println("No active TenantPropertyHistory found for payment ID: " + payment.getId());
            }
        } catch (Exception e) {
            System.err.println("Error updating TenantPropertyHistory after payment: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public Optional<Payment> findByRazorpayOrderId(String razorpayOrderId) {
        return paymentRepository.findByRazorpayOrderId(razorpayOrderId);
    }
}
