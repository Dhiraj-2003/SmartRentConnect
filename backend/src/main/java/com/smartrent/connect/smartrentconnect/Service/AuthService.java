package com.smartrent.connect.smartrentconnect.Service;


import com.smartrent.connect.smartrentconnect.dto.*;
import com.smartrent.connect.smartrentconnect.entity.*;
import com.smartrent.connect.smartrentconnect.repository.*;
import com.smartrent.connect.smartrentconnect.security.JwtUtils;
import com.smartrent.connect.smartrentconnect.enums.Role;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final OwnerRepository ownerRepository;
    private final AdminRepository adminRepository;
    private final WatchmanRepository watchmanRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, TenantRepository tenantRepository, 
                      OwnerRepository ownerRepository, AdminRepository adminRepository,
                      WatchmanRepository watchmanRepository, PasswordEncoder passwordEncoder, 
                      JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.ownerRepository = ownerRepository;
        this.adminRepository = adminRepository;
        this.watchmanRepository = watchmanRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    // ================= REGISTER TENANT =================
    public String registerTenant(TenantRegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }


        Tenant tenant = new Tenant();
        tenant.setUsername(request.getUsername());
        tenant.setEmail(request.getEmail());
        tenant.setFullName(request.getFullName());
        tenant.setPhoneNumber(request.getPhoneNumber());
        tenant.setRoomNumber(request.getRoomNumber());
        tenant.setAddress(request.getAddress());
        tenant.setProfileImage(request.getProfileImage());
        tenant.setPassword(passwordEncoder.encode(request.getPassword()));
        tenant.setRole(Role.TENANT);

        tenantRepository.save(tenant);

        return "Tenant registered successfully!";
    }

    // ================= REGISTER OWNER =================
    public String registerOwner(@Valid OwnerRegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        Owner owner = new Owner();
        owner.setUsername(request.getUsername());
        owner.setEmail(request.getEmail());
        owner.setFullName(request.getFullName());
        owner.setPhoneNumber(request.getPhoneNumber());
        owner.setBusinessName(request.getBusinessName());
        owner.setGstNumber(request.getGstNumber());
        owner.setAddress(request.getAddress());
        owner.setPassword(passwordEncoder.encode(request.getPassword()));
        owner.setRole(Role.OWNER);

        ownerRepository.save(owner);

        return "Owner registered successfully!";
    }

    // ================= REGISTER ADMIN =================
    public String registerAdmin(AdminRegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        Admin admin = new Admin();
        admin.setUsername(request.getUsername());
        admin.setEmail(request.getEmail());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setDesignation(request.getDesignation());
        admin.setRole(Role.ADMIN);

        adminRepository.save(admin);

        return "Admin registered successfully!";
    }

    // ================= REGISTER WATCHMAN =================
    public String registerWatchman(WatchmanRegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        Watchman watchman = new Watchman();
        watchman.setUsername(request.getUsername());
        watchman.setEmail(request.getEmail());
        watchman.setFullName(request.getFullName());
        watchman.setPhoneNumber(request.getPhoneNumber());
        watchman.setShiftTiming(request.getShiftTiming());
        watchman.setAssignedBuilding(request.getAssignedBuilding());
        watchman.setPassword(passwordEncoder.encode(request.getPassword()));
        watchman.setRole(Role.WATCHMAN);

        watchmanRepository.save(watchman);

        return "Watchman registered successfully!";
    }

    // ================= LOGIN =================
    public LoginResponse login(LoginRequest request) {
        // Find user by username or email
        User user = userRepository.findByUsername(request.getIdentifier())
                .or(() -> userRepository.findByEmail(request.getIdentifier()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found with username/email: " + request.getIdentifier()
                ));

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password");
        }

        // Generate JWT token
        String token = jwtUtils.generateJwtToken(user.getUsername(), user.getRole().getName());

        // Return login response
        return new LoginResponse(token, user.getUsername(), user.getEmail(), user.getRole().getName());
    }

}
