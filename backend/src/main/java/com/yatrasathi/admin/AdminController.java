package com.yatrasathi.admin;

import com.yatrasathi.common.AuditService;
import com.yatrasathi.common.Role;
import com.yatrasathi.employee.Employee;
import com.yatrasathi.employee.EmployeeRepository;
import com.yatrasathi.payment.Payment;
import com.yatrasathi.payment.PaymentRepository;
import com.yatrasathi.ticket.TicketRequest;
import com.yatrasathi.ticket.TicketRequestRepository;
import com.yatrasathi.user.User;
import com.yatrasathi.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final TicketRequestRepository ticketRequestRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(EmployeeRepository employeeRepository, UserRepository userRepository, 
                          AuditService auditService, TicketRequestRepository ticketRequestRepository, 
                          PaymentRepository paymentRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.ticketRequestRepository = ticketRequestRepository;
        this.paymentRepository = paymentRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @GetMapping("/employees")
    public ResponseEntity<List<User>> getAllEmployees() {
        List<User> employees = userRepository.findByRoleIn(List.of(Role.EMPLOYEE, Role.ADMIN));
        return ResponseEntity.ok(employees);
    }
    
    @PostMapping("/employees")
    public ResponseEntity<?> createEmployee(@RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            String email = request.get("email");
            String phone = request.get("phone");
            String password = request.get("password");
            String role = request.get("role");
            
            if (name == null || email == null || phone == null || password == null || role == null) {
                return ResponseEntity.badRequest().body("Missing required fields");
            }
            
            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body("Email already exists");
            }
            
            if (userRepository.findByPhone(phone).isPresent()) {
                return ResponseEntity.badRequest().body("Phone number already exists");
            }
            
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPhone(phone);
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setRole(Role.valueOf(role));
            user.setActive(true);
            
            User savedUser = userRepository.save(user);
            auditService.log("system", "EMPLOYEE_CREATED", "Admin created employee: " + email);
            
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating employee: " + e.getMessage());
        }
    }
    
    @PutMapping("/employees/{id}/status")
    public ResponseEntity<?> updateEmployeeStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> request) {
        try {
            Boolean active = request.get("active");
            if (active == null) {
                return ResponseEntity.badRequest().body("Missing 'active' field");
            }
            
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            user.setActive(active);
            userRepository.save(user);
            
            auditService.log("system", "EMPLOYEE_STATUS_UPDATED", 
                "Admin " + (active ? "activated" : "deactivated") + " employee: " + user.getEmail());
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating employee status: " + e.getMessage());
        }
    }
    
    @PutMapping("/employees/{id}/reset-password")
    public ResponseEntity<?> resetEmployeePassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String password = request.get("password");
            if (password == null) {
                return ResponseEntity.badRequest().body("Missing 'password' field");
            }
            
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            user.setPasswordHash(passwordEncoder.encode(password));
            userRepository.save(user);
            
            auditService.log("system", "EMPLOYEE_PASSWORD_RESET", "Admin reset password for employee: " + user.getEmail());
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error resetting employee password: " + e.getMessage());
        }
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        userRepository.deleteById(id);
        auditService.log("system", "DELETE_EMPLOYEE", "EmployeeId=" + id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/customers")
    public ResponseEntity<List<User>> customers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/customers/{id}/activate")
    public ResponseEntity<Void> activate(@PathVariable Long id, @RequestParam boolean active) {
        User user = userRepository.findById(id).orElseThrow();
        user.setActive(active);
        userRepository.save(user);
        auditService.log("system", "SET_CUSTOMER_ACTIVE", "UserId=" + id + ", active=" + active);
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/export/tickets.csv")
    public ResponseEntity<byte[]> exportTicketsCsv() {
        StringBuilder sb = new StringBuilder();
        sb.append("id,customerId,origin,destination,travelDate,status,approvedCount,pnr\n");
        for (TicketRequest t : ticketRequestRepository.findAll()) {
            sb.append(t.getId()).append(',')
              .append(t.getCustomer() != null ? t.getCustomer().getId() : "").append(',')
              .append(safe(t.getOrigin())).append(',')
              .append(safe(t.getDestination())).append(',')
              .append(t.getTravelDate() != null ? t.getTravelDate() : "").append(',')
              .append(t.getStatus() != null ? t.getStatus().name() : "").append(',')
              .append(t.getApprovedTicketCount() != null ? t.getApprovedTicketCount() : "").append(',')
              .append(safe(t.getAssignedPnr()))
              .append('\n');
        }
        byte[] out = sb.toString().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=tickets.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(out);
    }

    @GetMapping(value = "/export/payments.csv")
    public ResponseEntity<byte[]> exportPaymentsCsv() {
        StringBuilder sb = new StringBuilder();
        sb.append("id,ticketRequestId,amount,mode,status,reference,createdAt\n");
        for (Payment p : paymentRepository.findAll()) {
            sb.append(p.getId()).append(',')
              .append(p.getTicketRequest() != null ? p.getTicketRequest().getId() : "").append(',')
              .append(p.getAmount() != null ? p.getAmount() : "").append(',')
              .append(p.getMode() != null ? p.getMode().name() : "").append(',')
              .append(p.getStatus() != null ? p.getStatus().name() : "").append(',')
              .append(safe(p.getReference())).append(',')
              .append(p.getCreatedAt() != null ? p.getCreatedAt() : "")
              .append('\n');
        }
        byte[] out = sb.toString().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=payments.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(out);
    }

    private String safe(String s) {
        if (s == null) return "";
        String escaped = s.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n")) {
            return '"' + escaped + '"';
        }
        return escaped;
    }
}


