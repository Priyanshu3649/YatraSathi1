package com.yatrasathi.notification;

import com.yatrasathi.ticket.TicketRequest;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@EnableScheduling
public class NotificationService {

    private final com.yatrasathi.ticket.TicketRequestRepository ticketRepo;

    public NotificationService(com.yatrasathi.ticket.TicketRequestRepository ticketRepo) {
        this.ticketRepo = ticketRepo;
    }

    // Placeholder: logs Tatkal reminder triggers; integrate with Email/SMS later
    @Scheduled(cron = "0 0 9 * * *") // daily 9 AM
    public void tatkalReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<TicketRequest> list = ticketRepo.findByTravelDate(tomorrow);
        // In a real app, send email/SMS. For now, just noop.
        int count = list.size();
        if (count > 0) {
            System.out.println("Tatkal reminders to send: " + count);
        }
    }
}



