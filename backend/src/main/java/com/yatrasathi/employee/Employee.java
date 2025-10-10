package com.yatrasathi.employee;

import com.yatrasathi.user.User;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@NoArgsConstructor
@Entity
@Table(name = "employee_details")
public class Employee {
    @Id
    @Column(name = "employee_id")
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "employee_id")
    private User user;

    @Column(name = "designation")
    private String designation;
    
    @Column(name = "salary")
    private BigDecimal salary;
    
    @Column(name = "joined_on")
    private LocalDate joinedOn;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getDesignation() { return designation; }
    public BigDecimal getSalary() { return salary; }
    public LocalDate getJoinedOn() { return joinedOn; }
    public EmployeeStatus getStatus() { return status; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setDesignation(String designation) { this.designation = designation; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }
    public void setJoinedOn(LocalDate joinedOn) { this.joinedOn = joinedOn; }
    public void setStatus(EmployeeStatus status) { this.status = status; }
}
