package com.smartrent.connect.smartrentconnect.service;

import com.smartrent.connect.smartrentconnect.entity.TenantPropertyHistory;
import com.smartrent.connect.smartrentconnect.enums.OccupancyStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RentReminderScheduler {

    private final TenantPropertyHistoryService tenantPropertyHistoryService;
    private final EmailService emailService; // You'll need to create this

    /**
     * Run daily at 9:00 AM to update rent status and send reminders
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void dailyRentStatusUpdate() {
        log.info("Starting daily rent status update and reminder process");
        
        try {
            // Update rent due status
            tenantPropertyHistoryService.updateRentDueStatus();
            
            // Send reminders for different scenarios
            sendThreeDayReminders();
            sendOneDayReminders();
            sendDueDateReminders();
            sendOverdueReminders();
            
            log.info("Completed daily rent status update and reminder process");
        } catch (Exception e) {
            log.error("Error in daily rent status update: {}", e.getMessage(), e);
        }
    }

    /**
     * Send reminders 3 days before due date
     */
    private void sendThreeDayReminders() {
        List<TenantPropertyHistory> tenants = tenantPropertyHistoryService.getTenantsWithRentDueInDays(3);
        
        for (TenantPropertyHistory history : tenants) {
            if (history.getStatus() == OccupancyStatus.ACTIVE) {
                try {
                    String subject = "Rent Payment Reminder - Due in 3 days";
                    String message = buildReminderMessage(history, 3);
                    emailService.sendEmail(history.getTenant().getEmail(), subject, message);
                    log.info("Sent 3-day rent reminder to tenant: {}", history.getTenant().getEmail());
                } catch (Exception e) {
                    log.error("Failed to send 3-day reminder to tenant {}: {}", 
                            history.getTenant().getEmail(), e.getMessage());
                }
            }
        }
    }

    /**
     * Send reminders 1 day before due date
     */
    private void sendOneDayReminders() {
        List<TenantPropertyHistory> tenants = tenantPropertyHistoryService.getTenantsWithRentDueInDays(1);
        
        for (TenantPropertyHistory history : tenants) {
            if (history.getStatus() == OccupancyStatus.ACTIVE) {
                try {
                    String subject = "Rent Payment Reminder - Due Tomorrow";
                    String message = buildReminderMessage(history, 1);
                    emailService.sendEmail(history.getTenant().getEmail(), subject, message);
                    log.info("Sent 1-day rent reminder to tenant: {}", history.getTenant().getEmail());
                } catch (Exception e) {
                    log.error("Failed to send 1-day reminder to tenant {}: {}", 
                            history.getTenant().getEmail(), e.getMessage());
                }
            }
        }
    }

    /**
     * Send reminders on due date
     */
    private void sendDueDateReminders() {
        List<TenantPropertyHistory> tenants = tenantPropertyHistoryService.getTenantsWithRentDueInDays(0);
        
        for (TenantPropertyHistory history : tenants) {
            if (history.getStatus() == OccupancyStatus.RENT_DUE) {
                try {
                    String subject = "Rent Payment Due Today";
                    String message = buildReminderMessage(history, 0);
                    emailService.sendEmail(history.getTenant().getEmail(), subject, message);
                    log.info("Sent due date reminder to tenant: {}", history.getTenant().getEmail());
                } catch (Exception e) {
                    log.error("Failed to send due date reminder to tenant {}: {}", 
                            history.getTenant().getEmail(), e.getMessage());
                }
            }
        }
    }

    /**
     * Send overdue reminders (3 days after due date)
     */
    private void sendOverdueReminders() {
        List<TenantPropertyHistory> activeTenancies = tenantPropertyHistoryService.getAllActiveTenancies();
        LocalDate threeDaysAgo = LocalDate.now().minusDays(3);
        
        for (TenantPropertyHistory history : activeTenancies) {
            if (history.getStatus() == OccupancyStatus.OVERDUE && 
                history.getNextRentDueDate().isBefore(threeDaysAgo)) {
                try {
                    String subject = "Rent Payment Overdue - Immediate Action Required";
                    String message = buildOverdueMessage(history);
                    emailService.sendEmail(history.getTenant().getEmail(), subject, message);
                    
                    // Also notify owner
                    emailService.sendEmail(history.getOwner().getEmail(), 
                            "Rent Overdue Alert - " + history.getTenant().getFullName(), 
                            buildOwnerOverdueMessage(history));
                    
                    log.info("Sent overdue reminder to tenant: {} and owner: {}", 
                            history.getTenant().getEmail(), history.getOwner().getEmail());
                } catch (Exception e) {
                    log.error("Failed to send overdue reminder: {}", e.getMessage());
                }
            }
        }
    }

    /**
     * Build reminder message for tenant
     */
    private String buildReminderMessage(TenantPropertyHistory history, int daysUntilDue) {
        StringBuilder message = new StringBuilder();
        message.append("Dear ").append(history.getTenant().getFullName()).append(",\n\n");
        
        if (daysUntilDue == 0) {
            message.append("This is a reminder that your rent payment of ₹")
                   .append(history.getMonthlyRent())
                   .append(" is due TODAY for your property at ")
                   .append(history.getProperty().getAddress())
                   .append(".\n\n");
        } else {
            message.append("This is a reminder that your rent payment of ₹")
                   .append(history.getMonthlyRent())
                   .append(" will be due in ").append(daysUntilDue).append(" day(s) for your property at ")
                   .append(history.getProperty().getAddress())
                   .append(".\n\n");
        }
        
        message.append("Property Details:\n");
        message.append("- Address: ").append(history.getProperty().getAddress()).append("\n");
        message.append("- Monthly Rent: ₹").append(history.getMonthlyRent()).append("\n");
        message.append("- Due Date: ").append(history.getNextRentDueDate()).append("\n\n");
        
        message.append("Please ensure timely payment to avoid any late fees.\n");
        message.append("Thank you for your cooperation.\n\n");
        message.append("Best regards,\n");
        message.append("SmartRentConnect Team");
        
        return message.toString();
    }

    /**
     * Build overdue message for tenant
     */
    private String buildOverdueMessage(TenantPropertyHistory history) {
        StringBuilder message = new StringBuilder();
        message.append("Dear ").append(history.getTenant().getFullName()).append(",\n\n");
        message.append("URGENT: Your rent payment of ₹")
               .append(history.getMonthlyRent())
               .append(" is OVERDUE for your property at ")
               .append(history.getProperty().getAddress())
               .append(".\n\n");
        
        message.append("Property Details:\n");
        message.append("- Address: ").append(history.getProperty().getAddress()).append("\n");
        message.append("- Monthly Rent: ₹").append(history.getMonthlyRent()).append("\n");
        message.append("- Due Date: ").append(history.getNextRentDueDate()).append("\n");
        message.append("- Days Overdue: ").append(LocalDate.now().minusDays(history.getNextRentDueDate().toEpochDay())).append("\n\n");
        
        message.append("Please make your payment immediately to avoid further action.\n");
        message.append("Contact your property owner if you have any concerns.\n\n");
        message.append("Best regards,\n");
        message.append("SmartRentConnect Team");
        
        return message.toString();
    }

    /**
     * Build overdue message for owner
     */
    private String buildOwnerOverdueMessage(TenantPropertyHistory history) {
        StringBuilder message = new StringBuilder();
        message.append("Dear ").append(history.getOwner().getFullName()).append(",\n\n");
        message.append("NOTICE: Rent payment is overdue for your tenant:\n\n");
        
        message.append("Tenant Details:\n");
        message.append("- Name: ").append(history.getTenant().getFullName()).append("\n");
        message.append("- Email: ").append(history.getTenant().getEmail()).append("\n");
        message.append("- Property: ").append(history.getProperty().getAddress()).append("\n");
        message.append("- Monthly Rent: ₹").append(history.getMonthlyRent()).append("\n");
        message.append("- Due Date: ").append(history.getNextRentDueDate()).append("\n");
        message.append("- Days Overdue: ").append(LocalDate.now().minusDays(history.getNextRentDueDate().toEpochDay())).append("\n\n");
        
        message.append("Please follow up with the tenant for payment collection.\n\n");
        message.append("Best regards,\n");
        message.append("SmartRentConnect Team");
        
        return message.toString();
    }
}
