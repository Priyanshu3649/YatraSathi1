package com.yatrasathi.bootstrap;

import com.yatrasathi.common.Role;
import com.yatrasathi.employee.Employee;
import com.yatrasathi.employee.EmployeeRepository;
import com.yatrasathi.user.User;
import com.yatrasathi.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedDefaults(UserRepository users, EmployeeRepository employees, PasswordEncoder encoder) {
        return args -> {
            // Admin
            if (!users.existsByEmail("admin@yatrasathi.com")) {
                User admin = new User();
                admin.setName("Admin User");
                admin.setEmail("admin@yatrasathi.com");
                admin.setPhone("9999999999");
                admin.setAadhaar("999999999999");
                admin.setPasswordHash(encoder.encode("Admin@123"));
                admin.setRole(Role.ADMIN);
                users.save(admin);
            }

            // Employee
            if (!users.existsByEmail("employee1@yatrasathi.com")) {
                User empUser = new User();
                empUser.setName("Employee One");
                empUser.setEmail("employee1@yatrasathi.com");
                empUser.setPhone("8888888888");
                empUser.setAadhaar("888888888888");
                empUser.setPasswordHash(encoder.encode("Emp@123"));
                empUser.setRole(Role.EMPLOYEE);
                empUser = users.save(empUser);

                Employee employee = new Employee();
                employee.setUser(empUser);
                employee.setDesignation("Ticket Agent");
                employees.save(employee);
            }

            // Customer
            if (!users.existsByEmail("customer1@yatrasathi.com")) {
                User customer = new User();
                customer.setName("Customer One");
                customer.setEmail("customer1@yatrasathi.com");
                customer.setPhone("7777777777");
                customer.setAadhaar("777777777777");
                customer.setPasswordHash(encoder.encode("Cust@123"));
                customer.setRole(Role.CUSTOMER);
                users.save(customer);
            }
        };
    }
}

