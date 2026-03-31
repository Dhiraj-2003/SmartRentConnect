package com.smartrent.connect.smartrentconnect.repository;

import com.smartrent.connect.smartrentconnect.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByBookingId(Long bookingId);
    
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    
    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);
    
    @Query("SELECT p FROM Payment p WHERE p.booking.id = :bookingId AND p.paymentStatus = 'PENDING'")
    Optional<Payment> findPendingPaymentByBookingId(Long bookingId);
    
    @Query("SELECT p FROM Payment p WHERE p.booking.id = :bookingId AND p.paymentStatus = 'SUCCESS'")
    Optional<Payment> findSuccessfulPaymentByBookingId(Long bookingId);
}
