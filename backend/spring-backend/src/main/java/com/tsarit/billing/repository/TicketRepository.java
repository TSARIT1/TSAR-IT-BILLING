package com.tsarit.billing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tsarit.billing.model.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, String> {}
