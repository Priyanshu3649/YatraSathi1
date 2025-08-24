package com.yatrasathi.payment;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;

import com.yatrasathi.common.TicketEnums.PaymentStatus;
import com.yatrasathi.user.User;
import com.yatrasathi.user.UserRepository;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    public PaymentController(PaymentService paymentService, UserRepository userRepository) {
        this.paymentService = paymentService;
        this.userRepository = userRepository;
    }

    @PostMapping("/ticket/{ticketId}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<Payment> add(@PathVariable Long ticketId, @Valid @RequestBody Payment payment) {
        return ResponseEntity.ok(paymentService.addPayment(ticketId, payment));
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<Payment>> list(@PathVariable Long ticketId) {
        return ResponseEntity.ok(paymentService.listPayments(ticketId));
    }

    @PostMapping("/{paymentId}/complete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> complete(@PathVariable Long paymentId) {
        paymentService.markCompleted(paymentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/ticket/{ticketId}/total")
    public ResponseEntity<BigDecimal> total(@PathVariable Long ticketId) {
        return ResponseEntity.ok(paymentService.totalPaid(ticketId));
    }

    @PostMapping("/ticket/{ticketId}/make-payment")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Payment> makePayment(@PathVariable Long ticketId, @Valid @RequestBody Payment payment, Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        return ResponseEntity.ok(paymentService.makePayment(ticketId, userId, payment));
    }

    @PostMapping("/{paymentId}/update-status")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<Payment> updateStatus(@PathVariable Long paymentId, @RequestParam String status) {
        PaymentStatus paymentStatus = PaymentStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(paymentService.updatePaymentStatus(paymentId, paymentStatus));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Payment>> getMyPayments(Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        return ResponseEntity.ok(paymentService.getMyPayments(userId));
    }

    private Long getUserIdFromPrincipal(Principal principal) {
        if (principal == null) return null;
        String username = principal.getName();
        User user = userRepository.findByEmail(username).orElseGet(() -> userRepository.findByPhone(username).orElseThrow());
        return user.getId();
    }
}



