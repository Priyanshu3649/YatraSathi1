package com.yatrasathi.payment;

import com.yatrasathi.common.TicketEnums.PaymentStatus;
import com.yatrasathi.ticket.TicketRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByTicketRequest(TicketRequest request);
    List<Payment> findByStatus(PaymentStatus status);
    List<Payment> findByUserId(Long userId);
}



