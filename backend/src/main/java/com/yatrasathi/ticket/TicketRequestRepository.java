package com.yatrasathi.ticket;

import com.yatrasathi.common.TicketEnums.TicketStatus;
import com.yatrasathi.user.User;
import com.yatrasathi.employee.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TicketRequestRepository extends JpaRepository<TicketRequest, Long> {
    List<TicketRequest> findByCustomer(User customer);
    List<TicketRequest> findByStatus(TicketStatus status);
    List<TicketRequest> findByTravelDate(LocalDate date);
    List<TicketRequest> findByEmployee(User employee);
}


