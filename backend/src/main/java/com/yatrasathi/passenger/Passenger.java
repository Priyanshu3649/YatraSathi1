package com.yatrasathi.passenger;

import com.yatrasathi.ticket.TicketRequest;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Entity
@Table(name = "passengers")
public class Passenger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private TicketRequest ticketRequest;

    @NotBlank
    private String name;

    @NotNull
    private Integer age;

    @NotBlank
    private String gender;

    private String idProofType;

    private String idProofNumber;

    // Getters
    public Long getId() { return id; }
    public TicketRequest getTicketRequest() { return ticketRequest; }
    public String getName() { return name; }
    public Integer getAge() { return age; }
    public String getGender() { return gender; }
    public String getIdProofType() { return idProofType; }
    public String getIdProofNumber() { return idProofNumber; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setTicketRequest(TicketRequest ticketRequest) { this.ticketRequest = ticketRequest; }
    public void setName(String name) { this.name = name; }
    public void setAge(Integer age) { this.age = age; }
    public void setGender(String gender) { this.gender = gender; }
    public void setIdProofType(String idProofType) { this.idProofType = idProofType; }
    public void setIdProofNumber(String idProofNumber) { this.idProofNumber = idProofNumber; }
}