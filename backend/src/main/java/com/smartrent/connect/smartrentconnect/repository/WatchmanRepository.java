package com.smartrent.connect.smartrentconnect.repository;


import com.smartrent.connect.smartrentconnect.entity.Watchman;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WatchmanRepository extends JpaRepository<Watchman, Long> {
    
    Optional<Watchman> findByUsername(String username);
    
    Optional<Watchman> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
}

