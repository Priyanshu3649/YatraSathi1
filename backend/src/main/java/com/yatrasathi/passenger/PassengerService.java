package com.yatrasathi.passenger;

import com.yatrasathi.ticket.TicketRequest;
import com.yatrasathi.ticket.TicketRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PassengerService {
    private final PassengerRepository passengerRepository;
    private final TicketRequestRepository ticketRequestRepository;

    public PassengerService(PassengerRepository passengerRepository, TicketRequestRepository ticketRequestRepository) {
        this.passengerRepository = passengerRepository;
        this.ticketRequestRepository = ticketRequestRepository;
    }

    public List<Passenger> getPassengersByTicketRequestId(Long ticketRequestId) {
        TicketRequest ticketRequest = ticketRequestRepository.findById(ticketRequestId)
                .orElseThrow(() -> new RuntimeException("Ticket request not found"));
        return passengerRepository.findByTicketRequest(ticketRequest);
    }

    public Passenger addPassenger(Long ticketRequestId, Passenger passenger) {
        TicketRequest ticketRequest = ticketRequestRepository.findById(ticketRequestId)
                .orElseThrow(() -> new RuntimeException("Ticket request not found"));
        passenger.setTicketRequest(ticketRequest);
        return passengerRepository.save(passenger);
    }

    public List<Passenger> addPassengers(Long ticketRequestId, List<Passenger> passengers) {
        TicketRequest ticketRequest = ticketRequestRepository.findById(ticketRequestId)
                .orElseThrow(() -> new RuntimeException("Ticket request not found"));
        
        passengers.forEach(passenger -> passenger.setTicketRequest(ticketRequest));
        return passengerRepository.saveAll(passengers);
    }
}