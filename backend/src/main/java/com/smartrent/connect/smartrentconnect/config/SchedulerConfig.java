package com.smartrent.connect.smartrentconnect.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Configuration
@EnableScheduling
public class SchedulerConfig {
    
    /**
     * Configure a custom task scheduler for better control over scheduled tasks
     */
    @Bean
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(5); // Number of threads for scheduled tasks
        scheduler.setThreadNamePrefix("scheduled-task-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(60);
        scheduler.initialize();
        return scheduler;
    }
    
    /**
     * Separate executor for email sending to avoid blocking scheduled tasks
     */
    @Bean
    public Executor emailTaskExecutor() {
        return Executors.newFixedThreadPool(3, r -> {
            Thread t = new Thread(r, "email-sender-");
            t.setDaemon(true);
            return t;
        });
    }
}
