package com.yatrasathi.payment;

import com.yatrasathi.common.TicketEnums;
import com.yatrasathi.ticket.TicketRequest;
import com.yatrasathi.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ticket_request_id", nullable = false)
    private TicketRequest ticketRequest;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketEnums.PaymentMode mode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketEnums.PaymentStatus status = TicketEnums.PaymentStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private String reference;

    @Column
    private String remarks;

    // Getters
    public Long getId() { return id; }
    public TicketRequest getTicketRequest() { return ticketRequest; }
    public User getUser() { return user; }
    public BigDecimal getAmount() { return amount; }
    public TicketEnums.PaymentMode getMode() { return mode; }
    public TicketEnums.PaymentStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getReference() { return reference; }
    public String getRemarks() { return remarks; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setTicketRequest(TicketRequest ticketRequest) { this.ticketRequest = ticketRequest; }
    public void setUser(User user) { this.user = user; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setMode(TicketEnums.PaymentMode mode) { this.mode = mode; }
    public void setStatus(TicketEnums.PaymentStatus status) { this.status = status; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setReference(String reference) { this.reference = reference; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
