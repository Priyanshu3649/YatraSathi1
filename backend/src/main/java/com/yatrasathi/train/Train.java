package com.yatrasathi.train;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@Entity
@Table(name = "trains")
public class Train {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "train_id")
    private Long id;
    
    @Column(name = "train_number", unique = true, nullable = false)
    private String trainNumber;
    
    @Column(name = "train_name")
    private String trainName;
    
    @ManyToOne
    @JoinColumn(name = "departure_station_id")
    private Station departureStation;
    
    @ManyToOne
    @JoinColumn(name = "arrival_station_id")
    private Station arrivalStation;
    
    @Column(name = "departure_time")
    private LocalDateTime departureTime;
    
    @Column(name = "arrival_time")
    private LocalDateTime arrivalTime;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // Getters
    public Long getId() { return id; }
    public String getTrainNumber() { return trainNumber; }
    public String getTrainName() { return trainName; }
    public Station getDepartureStation() { return departureStation; }
    public Station getArrivalStation() { return arrivalStation; }
    public LocalDateTime getDepartureTime() { return departureTime; }
    public LocalDateTime getArrivalTime() { return arrivalTime; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setTrainNumber(String trainNumber) { this.trainNumber = trainNumber; }
    public void setTrainName(String trainName) { this.trainName = trainName; }
    public void setDepartureStation(Station departureStation) { this.departureStation = departureStation; }
    public void setArrivalStation(Station arrivalStation) { this.arrivalStation = arrivalStation; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }
    public void setArrivalTime(LocalDateTime arrivalTime) { this.arrivalTime = arrivalTime; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}