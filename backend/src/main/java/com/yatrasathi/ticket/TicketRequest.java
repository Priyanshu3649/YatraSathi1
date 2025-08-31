package com.yatrasathi.ticket;

import com.yatrasathi.common.TicketEnums.BerthPreference;
import com.yatrasathi.common.TicketEnums.TicketStatus;
import com.yatrasathi.common.TicketEnums.TravelClass;
import com.yatrasathi.user.User;
import com.yatrasathi.employee.Employee;
import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.math.BigDecimal;

@NoArgsConstructor
@Entity
@Table(name = "ticket_requests")
public class TicketRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User customer;

    @NotBlank
    private String origin;

    @NotBlank
    private String destination;

    @NotNull
    private LocalDate travelDate;

    @Enumerated(EnumType.STRING)
    private TravelClass travelClass;

    @Enumerated(EnumType.STRING)
    private BerthPreference berthPreference;

    private String specialRequirements;

    @Enumerated(EnumType.STRING)
    private TicketStatus status = TicketStatus.PENDING;

    private Integer passengerCount = 1;

    private Integer approvedTicketCount;

    private String assignedPnr;
    
    private BigDecimal paymentAmount;

    @ManyToOne
    private Employee assignedEmployee;

    // Getters
    public Long getId() { return id; }
    public User getCustomer() { return customer; }
    public String getOrigin() { return origin; }
    public String getDestination() { return destination; }
    public LocalDate getTravelDate() { return travelDate; }
    public TravelClass getTravelClass() { return travelClass; }
    public BerthPreference getBerthPreference() { return berthPreference; }
    public String getSpecialRequirements() { return specialRequirements; }
    public TicketStatus getStatus() { return status; }
    public Integer getPassengerCount() { return passengerCount; }
    public Integer getApprovedTicketCount() { return approvedTicketCount; }
    public String getAssignedPnr() { return assignedPnr; }
    public BigDecimal getPaymentAmount() { return paymentAmount; }
    public Employee getAssignedEmployee() { return assignedEmployee; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setCustomer(User customer) { this.customer = customer; }
    public void setOrigin(String origin) { this.origin = origin; }
    public void setDestination(String destination) { this.destination = destination; }
    public void setTravelDate(LocalDate travelDate) { this.travelDate = travelDate; }
    public void setTravelClass(TravelClass travelClass) { this.travelClass = travelClass; }
    public void setBerthPreference(BerthPreference berthPreference) { this.berthPreference = berthPreference; }
    public void setSpecialRequirements(String specialRequirements) { this.specialRequirements = specialRequirements; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public void setPassengerCount(Integer passengerCount) { this.passengerCount = passengerCount; }
    public void setApprovedTicketCount(Integer approvedTicketCount) { this.approvedTicketCount = approvedTicketCount; }
    public void setAssignedPnr(String assignedPnr) { this.assignedPnr = assignedPnr; }
    public void setPaymentAmount(BigDecimal paymentAmount) { this.paymentAmount = paymentAmount; }
    public void setAssignedEmployee(Employee assignedEmployee) { this.assignedEmployee = assignedEmployee; }
}


