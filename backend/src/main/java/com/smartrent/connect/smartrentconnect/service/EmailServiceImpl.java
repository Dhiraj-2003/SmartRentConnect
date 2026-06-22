package com.smartrent.connect.smartrentconnect.service;

import com.smartrent.connect.smartrentconnect.entity.TenantPropertyHistory;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${spring.mail.from.name:SmartRentConnect}")
    private String fromName;

    @Override
    public void sendEmail(String to, String subject, String message) {
        try {
            log.info("Sending email to: {} with subject: {}", to, subject);
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom(fromEmail, fromName);
            
            String htmlMessage = convertToHtml(message);
            helper.setText(htmlMessage, true);
            
            mailSender.send(mimeMessage);
            
            log.info("Email sent successfully to: {}", to);
            
        } catch (Exception e) {
            log.error("Failed to send email to: {}. Error: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public CompletableFuture<Void> sendEmailAsync(String to, String subject, String message) {
        sendEmail(to, subject, message);
        return CompletableFuture.completedFuture(null);
    }

    @Override
    @Async("emailTaskExecutor")
    public CompletableFuture<Void> sendRentReminderAsync(TenantPropertyHistory history, int daysUntilDue) {
        try {
            String tenantEmail = history.getTenant().getEmail();
            String subject = buildRentReminderSubject(daysUntilDue);
            String message = buildRentReminderMessage(history, daysUntilDue);
            
            sendEmail(tenantEmail, subject, message);
            log.info("Sent {}-day rent reminder to tenant: {}", daysUntilDue, tenantEmail);
            
        } catch (Exception e) {
            log.error("Failed to send rent reminder to tenant {}: {}", 
                    history.getTenant().getEmail(), e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }

    @Override
    @Async("emailTaskExecutor")
    public CompletableFuture<Void> sendOverdueNoticeAsync(TenantPropertyHistory history) {
        try {
            String tenantEmail = history.getTenant().getEmail();
            String subject = "Rent Payment Overdue - Immediate Action Required";
            String message = buildOverdueMessage(history);
            
            sendEmail(tenantEmail, subject, message);
            log.info("Sent overdue notice to tenant: {}", tenantEmail);
            
        } catch (Exception e) {
            log.error("Failed to send overdue notice to tenant {}: {}", 
                    history.getTenant().getEmail(), e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }

    @Override
    @Async("emailTaskExecutor")
    public CompletableFuture<Void> sendOwnerOverdueAlertAsync(TenantPropertyHistory history) {
        try {
            String ownerEmail = history.getOwner().getEmail();
            String subject = "Rent Overdue Alert - " + history.getTenant().getFullName();
            String message = buildOwnerOverdueMessage(history);
            
            sendEmail(ownerEmail, subject, message);
            log.info("Sent overdue alert to owner: {}", ownerEmail);
            
        } catch (Exception e) {
            log.error("Failed to send overdue alert to owner {}: {}", 
                    history.getOwner().getEmail(), e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            log.info("Sending HTML email to: {} with subject: {}", to, subject);
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom(fromEmail, fromName);
            helper.setText(htmlContent, true);
            
            mailSender.send(mimeMessage);
            
            log.info("HTML email sent successfully to: {}", to);
            
        } catch (Exception e) {
            log.error("Failed to send HTML email to: {}. Error: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send HTML email: " + e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public CompletableFuture<Void> sendHtmlEmailAsync(String to, String subject, String htmlContent) {
        sendHtmlEmail(to, subject, htmlContent);
        return CompletableFuture.completedFuture(null);
    }

    @Override
    public void sendEmailWithAttachment(String to, String subject, String message, String attachmentPath) {
        try {
            log.info("Sending email with attachment to: {} with subject: {}", to, subject);
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom(fromEmail, fromName);
            
            String htmlMessage = convertToHtml(message);
            helper.setText(htmlMessage, true);
            
            helper.addAttachment("document", new java.io.File(attachmentPath));
            
            mailSender.send(mimeMessage);
            
            log.info("Email with attachment sent successfully to: {}", to);
            
        } catch (Exception e) {
            log.error("Failed to send email with attachment to: {}. Error: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email with attachment: " + e.getMessage(), e);
        }
    }

    // Helper methods for rent reminder specific messages

    private String buildRentReminderSubject(int daysUntilDue) {
        return switch (daysUntilDue) {
            case 0 -> "Rent Payment Due Today";
            case 1 -> "Rent Payment Reminder - Due Tomorrow";
            case 3 -> "Rent Payment Reminder - Due in 3 days";
            default -> "Rent Payment Reminder";
        };
    }

    private String buildRentReminderMessage(TenantPropertyHistory history, int daysUntilDue) {
        StringBuilder message = new StringBuilder();
        message.append("Dear ").append(history.getTenant().getFullName()).append(",\n\n");
        
        if (daysUntilDue == 0) {
            message.append("⚠️ **URGENT**: Your rent payment of ₹")
                   .append(history.getMonthlyRent())
                   .append(" is due **TODAY** for your property at ")
                   .append(history.getProperty().getAddress())
                   .append(".\n\n");
        } else {
            message.append("📅 This is a reminder that your rent payment of ₹")
                   .append(history.getMonthlyRent())
                   .append(" will be due in **").append(daysUntilDue).append(" day(s)** for your property at ")
                   .append(history.getProperty().getAddress())
                   .append(".\n\n");
        }
        
        message.append("**Property Details:**\n");
        message.append("- 📍 Address: ").append(history.getProperty().getAddress()).append("\n");
        message.append("- 💰 Monthly Rent: ₹").append(history.getMonthlyRent()).append("\n");
        message.append("- 📅 Due Date: ").append(history.getNextRentDueDate()).append("\n\n");
        
        if (daysUntilDue <= 1) {
            message.append("⚠️ **Please ensure timely payment to avoid any late fees.**\n\n");
        }
        
        message.append("Thank you for your cooperation.\n\n");
        message.append("Best regards,\n");
        message.append(fromName);
        
        return message.toString();
    }

    private String buildOverdueMessage(TenantPropertyHistory history) {
        StringBuilder message = new StringBuilder();
        message.append("Dear ").append(history.getTenant().getFullName()).append(",\n\n");
        message.append("🚨 **URGENT**: Your rent payment of ₹")
               .append(history.getMonthlyRent())
               .append(" is **OVERDUE** for your property at ")
               .append(history.getProperty().getAddress())
               .append(".\n\n");
        
        message.append("**Property Details:**\n");
        message.append("- 📍 Address: ").append(history.getProperty().getAddress()).append("\n");
        message.append("- 💰 Monthly Rent: ₹").append(history.getMonthlyRent()).append("\n");
        message.append("- 📅 Due Date: ").append(history.getNextRentDueDate()).append("\n");
        message.append("- ⏰ Days Overdue: ").append(LocalDate.now().minusDays(history.getNextRentDueDate().toEpochDay())).append("\n\n");
        
        message.append("🚨 **Please make your payment immediately to avoid further action.**\n");
        message.append("Contact your property owner if you have any concerns.\n\n");
        message.append("Best regards,\n");
        message.append(fromName);
        
        return message.toString();
    }

    private String buildOwnerOverdueMessage(TenantPropertyHistory history) {
        StringBuilder message = new StringBuilder();
        message.append("Dear ").append(history.getOwner().getFullName()).append(",\n\n");
        message.append("📊 **NOTICE**: Rent payment is overdue for your tenant:\n\n");
        
        message.append("**Tenant Details:**\n");
        message.append("- 👤 Name: ").append(history.getTenant().getFullName()).append("\n");
        message.append("- 📧 Email: ").append(history.getTenant().getEmail()).append("\n");
        message.append("- 📱 Phone: ").append(history.getTenant().getPhoneNumber()).append("\n\n");
        
        message.append("**Property Details:**\n");
        message.append("- 📍 Address: ").append(history.getProperty().getAddress()).append("\n");
        message.append("- 💰 Monthly Rent: ₹").append(history.getMonthlyRent()).append("\n");
        message.append("- 📅 Due Date: ").append(history.getNextRentDueDate()).append("\n");
        message.append("- ⏰ Days Overdue: ").append(LocalDate.now().minusDays(history.getNextRentDueDate().toEpochDay())).append("\n\n");
        
        message.append("📋 **Action Required:**\n");
        message.append("Please follow up with the tenant for payment collection.\n");
        message.append("Consider sending a formal notice if payment is not received within 7 days.\n\n");
        
        message.append("Best regards,\n");
        message.append(fromName);
        
        return message.toString();
    }

    private String convertToHtml(String plainText) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='UTF-8'>"
                + "<title>" + fromName + "</title>"
                + "<style>"
                + "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }"
                + ".container { max-width: 600px; margin: 0 auto; padding: 20px; }"
                + ".header { background-color: #007bff; color: white; padding: 20px; text-align: center; }"
                + ".content { padding: 20px; background-color: #f9f9f9; }"
                + ".footer { background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; }"
                + ".important { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 10px 0; }"
                + ".urgent { background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 10px; margin: 10px 0; }"
                + "</style>"
                + "</head>"
                + "<body>"
                + "<div class='container'>"
                + "<div class='header'>"
                + "<h2>" + fromName + "</h2>"
                + "</div>"
                + "<div class='content'>"
                + "<pre style='white-space: pre-wrap; font-family: inherit;'>" + escapeHtml(plainText) + "</pre>"
                + "</div>"
                + "<div class='footer'>"
                + "<p>&copy; 2026 " + fromName + ". All rights reserved.</p>"
                + "<p>This is an automated message. Please do not reply to this email.</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                  .replace("<", "&lt;")
                  .replace(">", "&gt;")
                  .replace("\"", "&quot;")
                  .replace("'", "&#x27;");
    }

    @Override
    public void sendWelcomeEmail(String to, String fullName, String role, String username) {
        try {
            String subject = "Welcome to SmartRentConnect - Your Account is Ready!";
            String message = buildWelcomeMessage(fullName, role, username);
            sendEmail(to, subject, message);
            log.info("Welcome email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}. Error: {}", to, e.getMessage(), e);
            // Don't throw exception - registration should succeed even if email fails
        }
    }

    private String buildWelcomeMessage(String fullName, String role, String username) {
        StringBuilder message = new StringBuilder();
        message.append("🎉 Welcome to SmartRentConnect, ").append(fullName).append("!\n\n");
        message.append("Your account has been successfully created and you are now ready to use our platform.\n\n");
        message.append("**Account Details:**\n");
        message.append("- 👤 Name: ").append(fullName).append("\n");
        message.append("- 🔑 Username: ").append(username).append("\n");
        message.append("- 🏷️  Role: ").append(role).append("\n\n");
        message.append("**What's Next?**\n");
        message.append("You can now log in to your account using your username and password.\n");
        message.append("Explore our features and start managing your rental properties with ease.\n\n");
        message.append("**Need Help?**\n");
        message.append("If you have any questions or need assistance, feel free to reach out to our support team.\n\n");
        message.append("Thank you for choosing SmartRentConnect!\n\n");
        message.append("Best regards,\n");
        message.append("The SmartRentConnect Team");
        return message.toString();
    }

    @Override
    public void sendPropertyVerificationOtp(String to, String ownerName, String propertyTitle, String otp) {
        try {
            String subject = "Property Verification OTP - SmartRentConnect";
            String message = buildPropertyVerificationOtpMessage(ownerName, propertyTitle, otp);
            sendEmail(to, subject, message);
            log.info("Property verification OTP sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send property verification OTP to: {}. Error: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send OTP: " + e.getMessage(), e);
        }
    }

    private String buildPropertyVerificationOtpMessage(String ownerName, String propertyTitle, String otp) {
        StringBuilder message = new StringBuilder();
        message.append("🔐 Property Verification OTP\n\n");
        message.append("Dear ").append(ownerName).append(",\n\n");
        message.append("An admin is verifying your property: ").append(propertyTitle).append("\n\n");
        message.append("**Your Verification OTP:**\n");
        message.append("🔢 ").append(otp).append("\n\n");
        message.append("**Important:**\n");
        message.append("- This OTP is valid for 10 minutes only\n");
        message.append("- Do not share this OTP with anyone\n");
        message.append("- The admin will ask you to provide this OTP for verification\n\n");
        message.append("If you did not request this verification, please contact our support team immediately.\n\n");
        message.append("Best regards,\n");
        message.append("The SmartRentConnect Team");
        return message.toString();
    }
}
