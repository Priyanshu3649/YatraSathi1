package com.yatrasathi.train;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StationService {
    private final StationRepository stationRepository;
    
    public StationService(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }
    
    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }
    
    public Station getStationById(Long id) {
        return stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + id));
    }
    
    public Station getStationByCode(String stationCode) {
        return stationRepository.findByStationCode(stationCode)
                .orElseThrow(() -> new RuntimeException("Station not found with code: " + stationCode));
    }
    
    public List<Station> searchStationsByName(String stationName) {
        return stationRepository.findByStationNameContainingIgnoreCase(stationName);
    }
    
    public List<Station> searchStationsByCity(String city) {
        return stationRepository.findByCityContainingIgnoreCase(city);
    }
    
    public List<Station> getStationsByState(String state) {
        return stationRepository.findByState(state);
    }
    
    public Station saveStation(Station station) {
        return stationRepository.save(station);
    }
    
    public void deleteStation(Long id) {
        stationRepository.deleteById(id);
    }
}