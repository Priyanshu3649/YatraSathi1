package com.yatrasathi.train;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@Entity
@Table(name = "stations")
public class Station {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "station_id")
    private Long id;
    
    @Column(name = "station_name", unique = true, nullable = false)
    private String stationName;
    
    @Column(name = "station_code", unique = true, nullable = false)
    private String stationCode;
    
    @Column(name = "city")
    private String city;
    
    @Column(name = "state")
    private String state;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // Getters
    public Long getId() { return id; }
    public String getStationName() { return stationName; }
    public String getStationCode() { return stationCode; }
    public String getCity() { return city; }
    public String getState() { return state; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setStationName(String stationName) { this.stationName = stationName; }
    public void setStationCode(String stationCode) { this.stationCode = stationCode; }
    public void setCity(String city) { this.city = city; }
    public void setState(String state) { this.state = state; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}