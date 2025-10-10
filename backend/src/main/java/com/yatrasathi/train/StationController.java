package com.yatrasathi.train;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
public class StationController {
    private final StationService stationService;
    
    public StationController(StationService stationService) {
        this.stationService = stationService;
    }
    
    @GetMapping
    public ResponseEntity<List<Station>> getAllStations() {
        return ResponseEntity.ok(stationService.getAllStations());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Station> getStationById(@PathVariable Long id) {
        return ResponseEntity.ok(stationService.getStationById(id));
    }
    
    @GetMapping("/code/{stationCode}")
    public ResponseEntity<Station> getStationByCode(@PathVariable String stationCode) {
        return ResponseEntity.ok(stationService.getStationByCode(stationCode));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Station>> searchStations(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state) {
        
        if (name != null && !name.isEmpty()) {
            return ResponseEntity.ok(stationService.searchStationsByName(name));
        } else if (city != null && !city.isEmpty()) {
            return ResponseEntity.ok(stationService.searchStationsByCity(city));
        } else if (state != null && !state.isEmpty()) {
            return ResponseEntity.ok(stationService.getStationsByState(state));
        } else {
            return ResponseEntity.ok(stationService.getAllStations());
        }
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<Station> createStation(@RequestBody Station station) {
        return ResponseEntity.ok(stationService.saveStation(station));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<Station> updateStation(@PathVariable Long id, @RequestBody Station station) {
        station.setId(id);
        return ResponseEntity.ok(stationService.saveStation(station));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStation(@PathVariable Long id) {
        stationService.deleteStation(id);
        return ResponseEntity.noContent().build();
    }
}