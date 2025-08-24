package com.yatrasathi.ticket;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

import com.yatrasathi.user.User;
import com.yatrasathi.user.UserRepository;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;

    public TicketController(TicketService ticketService, UserRepository userRepository) {
        this.ticketService = ticketService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<TicketRequest> create(@Valid @RequestBody TicketRequest request, Principal principal) {
        try {
            return ResponseEntity.ok(ticketService.createRequest(getUserIdFromPrincipal(principal), request));
        } catch (Exception e) {
            throw new RuntimeException("Failed to create ticket request: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketRequest> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<TicketRequest>> myRequests(Principal principal) {
        return ResponseEntity.ok(ticketService.getMyRequests(getUserIdFromPrincipal(principal)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<List<TicketRequest>> pending() {
        return ResponseEntity.ok(ticketService.getPending());
    }

    @GetMapping("/approved")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<List<TicketRequest>> approved() {
        return ResponseEntity.ok(ticketService.getApproved());
    }

    @GetMapping("/ticket-created")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<List<TicketRequest>> ticketCreated() {
        return ResponseEntity.ok(ticketService.getTicketCreated());
    }

    @GetMapping("/confirmed")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<List<TicketRequest>> confirmed() {
        return ResponseEntity.ok(ticketService.getConfirmed());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<TicketRequest> approve(@PathVariable Long id, @RequestParam int count) {
        return ResponseEntity.ok(ticketService.approve(id, count));
    }

    @PostMapping("/{id}/create-ticket")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<TicketRequest> createTicket(@PathVariable Long id, @RequestParam String pnr, @RequestParam BigDecimal paymentAmount) {
        return ResponseEntity.ok(ticketService.createTicket(id, pnr, paymentAmount));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<TicketRequest> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.confirm(id));
    }

    @GetMapping("/by-date")
    public ResponseEntity<List<TicketRequest>> byDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ticketService.filter(date));
    }

    private Long getUserIdFromPrincipal(Principal principal) {
        if (principal == null) return null;
        String username = principal.getName();
        User user = userRepository.findByEmail(username).orElseGet(() -> userRepository.findByPhone(username).orElseThrow());
        return user.getId();
    }

    @GetMapping("/search")
    public ResponseEntity<List<TicketRequest>> search(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        // Simple demo: chain filters using repository methods
        List<TicketRequest> list;
        if (date != null) {
            list = ticketService.filter(date);
        } else {
            list = ticketService.getPending();
        }
        if (destination != null) {
            list = list.stream().filter(t -> destination.equalsIgnoreCase(t.getDestination())).toList();
        }
        if (status != null) {
            list = list.stream().filter(t -> t.getStatus().name().equalsIgnoreCase(status)).toList();
        }
        return ResponseEntity.ok(list);
    }
}


