package com.tsarit.billing.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * A single reply in a support-ticket conversation. Replies are written by the
 * tenant who owns the ticket or by a platform super admin.
 */
@Entity
@Table(name = "ticket_replies", indexes = {
        @Index(name = "idx_ticket_replies_ticket", columnList = "ticketId")
})
public class TicketReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Parent ticket id (plain column — tickets are not deleted in normal flow). */
    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    /** User id of the reply author. */
    @Column(name = "author_id", nullable = false, length = 50)
    private String authorId;

    /** Display name captured at write time so threads survive author renames. */
    @Column(name = "author_name", length = 255)
    private String authorName;

    /** true when the author is the platform super admin (support team). */
    @Column(name = "from_support", nullable = false)
    private boolean fromSupport;

    @Column(nullable = false, length = 4000)
    private String message;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public boolean isFromSupport() { return fromSupport; }
    public void setFromSupport(boolean fromSupport) { this.fromSupport = fromSupport; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
