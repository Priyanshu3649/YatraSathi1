package com.yatrasathi.employee;

import com.yatrasathi.ticket.TicketRequest;
import com.yatrasathi.ticket.TicketRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee")
@PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final TicketRequestRepository ticketRequestRepository;

    public EmployeeController(EmployeeRepository employeeRepository, TicketRequestRepository ticketRequestRepository) {
        this.employeeRepository = employeeRepository;
        this.ticketRequestRepository = ticketRequestRepository;
    }

    @GetMapping("/requests/assigned/{employeeId}")
    public ResponseEntity<List<TicketRequest>> assigned(@PathVariable Long employeeId) {
        Employee e = employeeRepository.findById(employeeId).orElseThrow();
        return ResponseEntity.ok(ticketRequestRepository.findByAssignedEmployee(e));
    }

    @PostMapping("/requests/{requestId}/assign/{employeeId}")
    public ResponseEntity<TicketRequest> assign(@PathVariable Long requestId, @PathVariable Long employeeId) {
        Employee e = employeeRepository.findById(employeeId).orElseThrow();
        TicketRequest tr = ticketRequestRepository.findById(requestId).orElseThrow();
        tr.setAssignedEmployee(e);
        return ResponseEntity.ok(ticketRequestRepository.save(tr));
    }
}



