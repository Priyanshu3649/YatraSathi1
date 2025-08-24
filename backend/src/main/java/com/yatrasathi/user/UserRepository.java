package com.yatrasathi.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByAadhaar(String aadhaar);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByAadhaar(String aadhaar);
}

