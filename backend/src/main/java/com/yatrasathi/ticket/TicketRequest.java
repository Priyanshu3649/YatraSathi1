package com.yatrasathi.ticket;

import com.yatrasathi.common.TicketEnums.TicketStatus;
import com.yatrasathi.common.TicketEnums.TravelClass;
import com.yatrasathi.employee.Employee;
import com.yatrasathi.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@NoArgsConstructor
@Entity
@Table(name = "bookings")
public class TicketRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id")
    private User customer;
    
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private User employee;
    
    public void setAssignedEmployee(Employee employee) {
        this.employee = employee.getUser();
    }
    
    @Column(name = "train_id")
    private Long trainId;
    
    @Column(name = "origin")
    private String origin;
    
    @Column(name = "destination")
    private String destination;
    
    @Column(name = "approved_ticket_count")
    private Integer approvedTicketCount = 0;
    
    @Column(name = "payment_amount")
    private BigDecimal paymentAmount = BigDecimal.ZERO;

    @NotBlank
    @Column(name = "pnr", unique = true)
    private String assignedPnr;

    @NotNull
    @Column(name = "travel_date")
    private LocalDate travelDate;
    
    @Column(name = "booking_date")
    private LocalDateTime bookingDate = LocalDateTime.now();

    @Column(name = "class")
    private String travelClass;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private TicketStatus status = TicketStatus.PENDING;

    @Column(name = "total_tickets")
    private Integer passengerCount = 1;
    
    @Column(name = "cancelled_on")
    private LocalDateTime cancelledOn;
    
    @Column(name = "cancellation_reason")
    private String cancellationReason;

    // Getters
    public Long getId() { return id; }
    public User getCustomer() { return customer; }
    public User getEmployee() { return employee; }
    public Long getTrainId() { return trainId; }
    public String getOrigin() { return origin; }
    public String getDestination() { return destination; }
    public Integer getApprovedTicketCount() { return approvedTicketCount; }
    public BigDecimal getPaymentAmount() { return paymentAmount; }
    public String getAssignedPnr() { return assignedPnr; }
    public LocalDate getTravelDate() { return travelDate; }
    public LocalDateTime getBookingDate() { return bookingDate; }
    public String getTravelClass() { return travelClass; }
    public TicketStatus getStatus() { return status; }
    public Integer getPassengerCount() { return passengerCount; }
    public LocalDateTime getCancelledOn() { return cancelledOn; }
    public String getCancellationReason() { return cancellationReason; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setCustomer(User customer) { this.customer = customer; }
    public void setEmployee(User employee) { this.employee = employee; }
    public void setTrainId(Long trainId) { this.trainId = trainId; }
    public void setOrigin(String origin) { this.origin = origin; }
    public void setDestination(String destination) { this.destination = destination; }
    public void setApprovedTicketCount(Integer approvedTicketCount) { this.approvedTicketCount = approvedTicketCount; }
    public void setPaymentAmount(BigDecimal paymentAmount) { this.paymentAmount = paymentAmount; }
    public void setAssignedPnr(String assignedPnr) { this.assignedPnr = assignedPnr; }
    public void setTravelDate(LocalDate travelDate) { this.travelDate = travelDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }
    public void setTravelClass(String travelClass) { this.travelClass = travelClass; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public void setPassengerCount(Integer passengerCount) { this.passengerCount = passengerCount; }
    public void setCancelledOn(LocalDateTime cancelledOn) { this.cancelledOn = cancelledOn; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
}


