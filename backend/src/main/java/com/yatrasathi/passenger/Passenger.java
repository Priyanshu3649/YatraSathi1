package com.yatrasathi.passenger;

import com.yatrasathi.ticket.TicketRequest;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Entity
@Table(name = "passengers")
public class Passenger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "passenger_id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "booking_id")
    private TicketRequest ticketRequest;

    @NotBlank
    @Column(name = "name")
    private String name;

    @NotNull
    @Column(name = "age")
    private Integer age;

    @Column(name = "gender")
    private String gender;
    
    @Column(name = "relation_to_primary")
    private String relationToPrimary;
    
    @Column(name = "aadhaar")
    private String aadhaar;
    
    @Column(name = "passport_number")
    private String passportNumber;
    
    @Column(name = "berth_allotted")
    private String berthAllotted;

    // Getters
    public Long getId() { return id; }
    public TicketRequest getTicketRequest() { return ticketRequest; }
    public String getName() { return name; }
    public Integer getAge() { return age; }
    public String getGender() { return gender; }
    public String getRelationToPrimary() { return relationToPrimary; }
    public String getAadhaar() { return aadhaar; }
    public String getPassportNumber() { return passportNumber; }
    public String getBerthAllotted() { return berthAllotted; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setTicketRequest(TicketRequest ticketRequest) { this.ticketRequest = ticketRequest; }
    public void setName(String name) { this.name = name; }
    public void setAge(Integer age) { this.age = age; }
    public void setGender(String gender) { this.gender = gender; }
    public void setRelationToPrimary(String relationToPrimary) { this.relationToPrimary = relationToPrimary; }
    public void setAadhaar(String aadhaar) { this.aadhaar = aadhaar; }
    public void setPassportNumber(String passportNumber) { this.passportNumber = passportNumber; }
    public void setBerthAllotted(String berthAllotted) { this.berthAllotted = berthAllotted; }
}