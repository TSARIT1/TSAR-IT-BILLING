//package com.tsarit.billing.model;
//
//import jakarta.persistence.*;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name="tickets")
//public class Ticket {
//    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//    private String subject;
//    private String message;
//    private String status = "open";
//    private LocalDateTime createdAt = LocalDateTime.now();
//
//    // getters/setters
//    public Long getId(){return id;}
//    public void setId(Long id){this.id=id;}
//    public String getSubject(){return subject;}
//    public void setSubject(String s){this.subject=s;}
//    public String getMessage(){return message;}
//    public void setMessage(String m){this.message=m;}
//    public String getStatus(){return status;}
//    public void setStatus(String s){this.status=s;}
//    public LocalDateTime getCreatedAt(){return createdAt;}
//    public void setCreatedAt(LocalDateTime d){this.createdAt=d;}
//}

package com.tsarit.billing.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subject;       // e.g., Authentication, Payments, UI Issues
    @Column(length = 2000)
    private String message;       // Detailed description

    private String status = "open"; // open, in-progress, closed
    private LocalDateTime createdAt = LocalDateTime.now();

    private String priority;      // e.g., Low, Medium, High

    // Attachments: store file paths or URLs
    @ElementCollection
    @CollectionTable(name = "ticket_attachments", joinColumns = @JoinColumn(name = "ticket_id"))
    @Column(name = "file_path")
    private List<String> attachments;

    // ===== Getters & Setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public List<String> getAttachments() { return attachments; }
    public void setAttachments(List<String> attachments) { this.attachments = attachments; }
}
