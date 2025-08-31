package com.yatrasathi.passenger;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/passengers")
public class PassengerController {

    private final PassengerService passengerService;

    public PassengerController(PassengerService passengerService) {
        this.passengerService = passengerService;
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<Passenger>> getPassengersByTicketId(@PathVariable Long ticketId) {
        return ResponseEntity.ok(passengerService.getPassengersByTicketRequestId(ticketId));
    }

    @PostMapping("/ticket/{ticketId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Passenger> addPassenger(
            @PathVariable Long ticketId,
            @Valid @RequestBody Passenger passenger) {
        return ResponseEntity.ok(passengerService.addPassenger(ticketId, passenger));
    }

    @PostMapping("/ticket/{ticketId}/batch")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Passenger>> addPassengers(
            @PathVariable Long ticketId,
            @Valid @RequestBody List<Passenger> passengers) {
        return ResponseEntity.ok(passengerService.addPassengers(ticketId, passengers));
    }
}