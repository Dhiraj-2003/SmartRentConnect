package com.smartrent.connect.smartrentconnect.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Entity
@Table(name = "tenants")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Tenant extends User {

    @NotBlank(message = "Full name is required")
    @Column(name = "full_name")
    private String fullName;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    @Column(name = "phone_number")
    private String phoneNumber;

    @NotBlank(message = "Address is required")
    @Column(name = "address")
    private String address;

}
