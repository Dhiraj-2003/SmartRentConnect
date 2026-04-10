package com.smartrent.connect.smartrentconnect.service;

import com.smartrent.connect.smartrentconnect.entity.TenantPropertyHistory;

import java.util.concurrent.CompletableFuture;

public interface EmailService {
    void sendEmail(String to, String subject, String message);
    
    // Async methods for scheduler
    CompletableFuture<Void> sendEmailAsync(String to, String subject, String message);
    
    // Rent reminder specific methods
    CompletableFuture<Void> sendRentReminderAsync(TenantPropertyHistory history, int daysUntilDue);
    CompletableFuture<Void> sendOverdueNoticeAsync(TenantPropertyHistory history);
    CompletableFuture<Void> sendOwnerOverdueAlertAsync(TenantPropertyHistory history);
    
    // HTML email methods
    void sendHtmlEmail(String to, String subject, String htmlContent);
    CompletableFuture<Void> sendHtmlEmailAsync(String to, String subject, String htmlContent);
    
    // Email with attachment
    void sendEmailWithAttachment(String to, String subject, String message, String attachmentPath);
}
