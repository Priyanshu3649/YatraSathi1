package com.yatrasathi.passenger;

import com.yatrasathi.ticket.TicketRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PassengerRepository extends JpaRepository<Passenger, Long> {
    List<Passenger> findByTicketRequest(TicketRequest ticketRequest);
}