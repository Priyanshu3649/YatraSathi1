package com.yatrasathi.admin;

import com.yatrasathi.common.AuditService;
import com.yatrasathi.employee.Employee;
import com.yatrasathi.employee.EmployeeRepository;
import com.yatrasathi.user.User;
import com.yatrasathi.user.UserRepository;
import com.yatrasathi.ticket.TicketRequest;
import com.yatrasathi.ticket.TicketRequestRepository;
import com.yatrasathi.payment.Payment;
import com.yatrasathi.payment.PaymentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final TicketRequestRepository ticketRequestRepository;
    private final PaymentRepository paymentRepository;

    public AdminController(EmployeeRepository employeeRepository, UserRepository userRepository, AuditService auditService, TicketRequestRepository ticketRequestRepository, PaymentRepository paymentRepository) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.ticketRequestRepository = ticketRequestRepository;
        this.paymentRepository = paymentRepository;
    }

    @GetMapping("/employees")
    public ResponseEntity<List<Employee>> listEmployees() {
        return ResponseEntity.ok(employeeRepository.findAll());
    }

    @PostMapping("/employees")
    public ResponseEntity<Employee> addEmployee(@RequestBody Employee employee) {
        Employee saved = employeeRepository.save(employee);
        auditService.log("system", "ADD_EMPLOYEE", "EmployeeId=" + saved.getId());
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeRepository.deleteById(id);
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


