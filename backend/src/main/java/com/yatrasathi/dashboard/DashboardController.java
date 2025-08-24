package com.yatrasathi.dashboard;

import com.yatrasathi.common.TicketEnums.TicketStatus;
import com.yatrasathi.payment.Payment;
import com.yatrasathi.payment.PaymentRepository;
import com.yatrasathi.ticket.TicketRequest;
import com.yatrasathi.ticket.TicketRequestRepository;
import com.yatrasathi.user.User;
import com.yatrasathi.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final TicketRequestRepository ticketRepo;
    private final PaymentRepository paymentRepo;
    private final UserRepository userRepo;

    public DashboardController(TicketRequestRepository ticketRepo, PaymentRepository paymentRepo, UserRepository userRepo) {
        this.ticketRepo = ticketRepo;
        this.paymentRepo = paymentRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> adminSummary() {
        Map<String, Object> data = new HashMap<>();
        data.put("pendingTickets", ticketRepo.findByStatus(TicketStatus.PENDING).size());
        data.put("approvedTickets", ticketRepo.findByStatus(TicketStatus.APPROVED).size());
        data.put("confirmedTickets", ticketRepo.findByStatus(TicketStatus.CONFIRMED).size());
        List<Payment> payments = paymentRepo.findAll();
        BigDecimal total = payments.stream().map(Payment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        data.put("totalPayments", total);
        data.put("customers", userRepo.count());
        return ResponseEntity.ok(data);
    }

    @GetMapping("/employee")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<Map<String, Object>> employeeSummary() {
        Map<String, Object> data = new HashMap<>();
        data.put("pendingTickets", ticketRepo.findByStatus(TicketStatus.PENDING).size());
        data.put("upcomingTatkal", ticketRepo.findByStatus(TicketStatus.APPROVED).size());
        return ResponseEntity.ok(data);
    }
}



