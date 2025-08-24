package com.yatrasathi.payment;

import com.yatrasathi.common.AuditService;
import com.yatrasathi.common.TicketEnums.PaymentStatus;
import com.yatrasathi.ticket.TicketRequest;
import com.yatrasathi.ticket.TicketRequestRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final TicketRequestRepository ticketRequestRepository;
    private final AuditService auditService;

    public PaymentService(PaymentRepository paymentRepository, TicketRequestRepository ticketRequestRepository, AuditService auditService) {
        this.paymentRepository = paymentRepository;
        this.ticketRequestRepository = ticketRequestRepository;
        this.auditService = auditService;
    }

    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public Payment addPayment(Long ticketRequestId, Payment payment) {
        TicketRequest request = ticketRequestRepository.findById(ticketRequestId).orElseThrow();
        payment.setTicketRequest(request);
        Payment saved = paymentRepository.save(payment);
        auditService.log("system", "ADD_PAYMENT", "TicketRequestId=" + ticketRequestId + ", PaymentId=" + saved.getId());
        return saved;
    }

    public List<Payment> listPayments(Long ticketRequestId) {
        TicketRequest request = ticketRequestRepository.findById(ticketRequestId).orElseThrow();
        return paymentRepository.findByTicketRequest(request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void markCompleted(Long paymentId) {
        Payment p = paymentRepository.findById(paymentId).orElseThrow();
        p.setStatus(PaymentStatus.COMPLETED);
        paymentRepository.save(p);
        auditService.log("system", "COMPLETE_PAYMENT", "PaymentId=" + paymentId);
    }

    public BigDecimal totalPaid(Long ticketRequestId) {
        return listPayments(ticketRequestId).stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Payment makePayment(Long ticketRequestId, Long userId, Payment payment) {
        TicketRequest request = ticketRequestRepository.findById(ticketRequestId).orElseThrow();
        payment.setTicketRequest(request);
        payment.setStatus(PaymentStatus.PENDING);
        Payment saved = paymentRepository.save(payment);
        auditService.log("customer", "MAKE_PAYMENT", "TicketRequestId=" + ticketRequestId + ", PaymentId=" + saved.getId());
        return saved;
    }

    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public Payment updatePaymentStatus(Long paymentId, PaymentStatus status) {
        Payment payment = paymentRepository.findById(paymentId).orElseThrow();
        payment.setStatus(status);
        Payment saved = paymentRepository.save(payment);
        auditService.log("system", "UPDATE_PAYMENT_STATUS", "PaymentId=" + paymentId + ", Status=" + status);
        return saved;
    }

    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getMyPayments(Long userId) {
        return paymentRepository.findByUserId(userId);
    }
}


