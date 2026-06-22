package com.smartrent.connect.smartrentconnect.entity;

import com.smartrent.connect.smartrentconnect.enums.PaymentMethod;
import com.smartrent.connect.smartrentconnect.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_property_history_id")
    private TenantPropertyHistory tenantPropertyHistory;
    
    @Column(name = "amount", nullable = false)
    private Double amount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;
    
    @Column(name = "razorpay_order_id", length = 255)
    private String razorpayOrderId;
    
    @Column(name = "razorpay_payment_id", length = 255)
    private String razorpayPaymentId;
    
    @Column(name = "razorpay_signature", length = 255)
    private String razorpaySignature;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;

    public Payment(Booking booking, Double amount, PaymentMethod paymentMethod, PaymentStatus paymentStatus) {
        this.booking = booking;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.transactionDate = LocalDateTime.now();
    }

}
