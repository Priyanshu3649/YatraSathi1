package com.yatrasathi.auth.dto;

import com.yatrasathi.common.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AuthDtos {
    public static class SignupRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String phone;
        @NotBlank @Size(min = 12, max = 12)
        private String aadhaar;
        @NotBlank
        private String password;
        @NotNull
        private Role role; // CUSTOMER by default; ADMIN can create EMPLOYEE

        // Getters and Setters for SignupRequest
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getAadhaar() { return aadhaar; }
        public void setAadhaar(String aadhaar) { this.aadhaar = aadhaar; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
    }

    public static class LoginRequest {
        @NotBlank
        private String username; // email or phone
        @NotBlank
        private String password;

        // Getters and Setters for LoginRequest
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private String role;
        private Long userId;
        private String email;

        // Getters and Setters for AuthResponse
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
}


