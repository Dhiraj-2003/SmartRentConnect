package com.smartrent.connect.smartrentconnect.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Admin extends User {

    private String designation; // optional
    
    // Note: profileImage is inherited from User entity
    // Additional admin-specific fields can be added here if needed
}

