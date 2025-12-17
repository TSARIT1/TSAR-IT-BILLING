//package com.tsarit.billing.controller;
//
//import org.springframework.web.bind.annotation.*;
//import org.springframework.beans.factory.annotation.Autowired;
//import com.tsarit.billing.model.Ticket;
//import com.tsarit.billing.repository.TicketRepository;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api")
//public class TicketController {
//    @Autowired
//    private TicketRepository repo;
//
//    @GetMapping("/tickets/")
//    public List<Ticket> list(){ return repo.findAll(); }
//
//    @PostMapping("/tickets/")
//    public Ticket create(@RequestBody Ticket t){ return repo.save(t); }
//}

package com.tsarit.billing.controller;

import com.tsarit.billing.model.Ticket;
import com.tsarit.billing.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    // ===== Create a new Ticket =====
    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        Ticket savedTicket = ticketRepository.save(ticket);
        return ResponseEntity.ok(savedTicket);
    }

    // ===== Get all Tickets =====
    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // ===== Get Ticket by ID =====
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String id) {
        Optional<Ticket> optional = ticketRepository.findById(id);
        return optional.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    // ===== Update Ticket by ID =====
    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable String id, @RequestBody Ticket ticketDetails) {
        Optional<Ticket> optional = ticketRepository.findById(id);
        if (!optional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Ticket ticket = optional.get();
        ticket.setSubject(ticketDetails.getSubject());
        ticket.setMessage(ticketDetails.getMessage());
        ticket.setStatus(ticketDetails.getStatus());
        ticket.setPriority(ticketDetails.getPriority());
        ticket.setAttachments(ticketDetails.getAttachments());

        Ticket updatedTicket = ticketRepository.save(ticket);
        return ResponseEntity.ok(updatedTicket);
    }

    // ===== Delete Ticket by ID =====
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        if (!ticketRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        ticketRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
