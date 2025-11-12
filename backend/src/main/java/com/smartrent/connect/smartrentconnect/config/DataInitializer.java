package com.smartrent.connect.smartrentconnect.config;

import com.smartrent.connect.smartrentconnect.entity.*;
import com.smartrent.connect.smartrentconnect.enums.Role;
import com.smartrent.connect.smartrentconnect.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final OwnerRepository ownerRepository;
    private final AdminRepository adminRepository;
    private final WatchmanRepository watchmanRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           TenantRepository tenantRepository,
                           OwnerRepository ownerRepository,
                           AdminRepository adminRepository,
                           WatchmanRepository watchmanRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.ownerRepository = ownerRepository;
        this.adminRepository = adminRepository;
        this.watchmanRepository = watchmanRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        createDemoAccounts();
    }

    private void createDemoAccounts() {

        // Tenant Demo Account
        if (!userRepository.existsByEmail("tenant@test.com")) {
            Tenant tenant = new Tenant();
            tenant.setUsername("tenant"); // Added username to avoid ConstraintViolationException
            tenant.setEmail("tenant@test.com");
            tenant.setPassword(passwordEncoder.encode("password"));
            tenant.setFullName("Demo Tenant");
            tenant.setPhoneNumber("1234567890");
            tenant.setRoomNumber("101");
            tenant.setAddress("Demo Address, City");
            tenant.setRole(Role.TENANT);

            tenantRepository.save(tenant);
            System.out.println("Demo tenant created: tenant@test.com / password");
        }

        // Owner Demo Account
        if (!userRepository.existsByEmail("owner@test.com")) {
            Owner owner = new Owner();
            owner.setUsername("owner"); // Added username for consistency
            owner.setEmail("owner@test.com");
            owner.setPassword(passwordEncoder.encode("password"));
            owner.setFullName("Demo Owner");
            owner.setPhoneNumber("1234567891");
            owner.setBusinessName("Demo Properties Ltd");
            owner.setGstNumber("GST123456789");
            owner.setAddress("Demo Business Address, City");
            owner.setRole(Role.OWNER);

            ownerRepository.save(owner);
            System.out.println("Demo owner created: owner@test.com / password");
        }

        // Admin Demo Account
        if (!userRepository.existsByEmail("admin@test.com")) {
            Admin admin = new Admin();
            admin.setUsername("admin"); // Added username
            admin.setEmail("admin@test.com");
            admin.setPassword(passwordEncoder.encode("password"));
            admin.setDesignation("System Administrator");
            admin.setRole(Role.ADMIN);

            adminRepository.save(admin);
            System.out.println("Demo admin created: admin@test.com / password");
        }

        // Watchman Demo Account
        if (!userRepository.existsByEmail("watchman@test.com")) {
            Watchman watchman = new Watchman();
            watchman.setUsername("watchman");
            watchman.setEmail("watchman@test.com");
            watchman.setPassword(passwordEncoder.encode("password"));
            watchman.setFullName("Demo Watchman");
            watchman.setPhoneNumber("1234567892");
            watchman.setShiftTiming("Night");
            watchman.setAssignedBuilding("Building A");
            watchman.setRole(Role.WATCHMAN);

            watchmanRepository.save(watchman);
            System.out.println("Demo watchman created: watchman@test.com / password");
        }
    }
}
