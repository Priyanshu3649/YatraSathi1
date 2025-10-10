package com.yatrasathi.train;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trains")
public class TrainController {
    private final TrainService trainService;
    
    public TrainController(TrainService trainService) {
        this.trainService = trainService;
    }
    
    @GetMapping
    public ResponseEntity<List<Train>> getAllTrains() {
        return ResponseEntity.ok(trainService.getAllTrains());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Train> getTrainById(@PathVariable Long id) {
        return ResponseEntity.ok(trainService.getTrainById(id));
    }
    
    @GetMapping("/number/{trainNumber}")
    public ResponseEntity<Train> getTrainByNumber(@PathVariable String trainNumber) {
        return ResponseEntity.ok(trainService.getTrainByNumber(trainNumber));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Train>> searchTrains(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        
        if (name != null && !name.isEmpty()) {
            return ResponseEntity.ok(trainService.searchTrainsByName(name));
        } else if (from != null && !from.isEmpty() && to != null && !to.isEmpty()) {
            return ResponseEntity.ok(trainService.searchTrainsByRoute(from, to));
        } else {
            return ResponseEntity.ok(trainService.getAllTrains());
        }
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<Train> createTrain(@RequestBody Train train) {
        return ResponseEntity.ok(trainService.saveTrain(train));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<Train> updateTrain(@PathVariable Long id, @RequestBody Train train) {
        train.setId(id);
        return ResponseEntity.ok(trainService.saveTrain(train));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTrain(@PathVariable Long id) {
        trainService.deleteTrain(id);
        return ResponseEntity.noContent().build();
    }
}