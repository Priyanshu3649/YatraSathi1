package com.yatrasathi.auth;

import com.yatrasathi.auth.dto.AuthDtos.AuthResponse;
import com.yatrasathi.auth.dto.AuthDtos.LoginRequest;
import com.yatrasathi.auth.dto.AuthDtos.SignupRequest;
import com.yatrasathi.common.Role;
import com.yatrasathi.security.JwtService;
import com.yatrasathi.user.User;
import com.yatrasathi.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail()) || userRepository.existsByPhone(request.getPhone()) || userRepository.existsByAadhaar(request.getAadhaar())) {
            throw new IllegalArgumentException("User already exists with provided details");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAadhaar(request.getAadhaar());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        Role role = request.getRole() == null ? Role.CUSTOMER : request.getRole();
        user.setRole(role);
        userRepository.save(user);

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role.name());
        claims.put("userId", user.getId());
        String token = jwtService.generateToken(user.getEmail(), claims);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setRole(role.name());
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        return response;
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (AuthenticationException e) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        User user = userRepository.findByEmail(request.getUsername()).orElseGet(() -> userRepository.findByPhone(request.getUsername()).orElseThrow());
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());
        String token = jwtService.generateToken(user.getEmail(), claims);
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setRole(user.getRole().name());
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        return response;
    }
}


