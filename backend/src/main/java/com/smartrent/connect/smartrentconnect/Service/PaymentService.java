package com.smartrent.connect.smartrentconnect.Service;

import com.smartrent.connect.smartrentconnect.entity.Booking;
import com.smartrent.connect.smartrentconnect.entity.FlatDetails;
import com.smartrent.connect.smartrentconnect.entity.PGBed;
import com.smartrent.connect.smartrentconnect.entity.Payment;
import com.smartrent.connect.smartrentconnect.enums.PaymentMethod;
import com.smartrent.connect.smartrentconnect.enums.PaymentStatus;
import com.smartrent.connect.smartrentconnect.repository.BookingRepository;
import com.smartrent.connect.smartrentconnect.repository.FlatDetailsRepository;
import com.smartrent.connect.smartrentconnect.repository.PGBedRepository;
import com.smartrent.connect.smartrentconnect.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        Optional<FlatDetails> flatDetails= flatDetailsRepository.findById(booking.getFlatDetails().getId());
        flatDetails.get().setIsOccupied(true);
        flatDetailsRepository.save(flatDetails.get());

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
        
        // For PG bookings with cash payment, occupy the bed immediately
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
    }
    
    public Optional<Payment> findByRazorpayOrderId(String razorpayOrderId) {
        return paymentRepository.findByRazorpayOrderId(razorpayOrderId);
    }
}
