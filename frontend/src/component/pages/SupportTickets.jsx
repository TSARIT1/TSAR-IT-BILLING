import React, { useState } from "react";
import PortalLayout from "../PortalLayout";
import { 
  BsTicketDetailedFill, 
  BsPlusLg, 
  BsCheckCircleFill, 
  BsClockHistory, 
  BsRobot, 
  BsWhatsapp,
  BsEnvelopeFill
} from "react-icons/bs";

export default function SupportTickets() {
  const [tickets, setTickets] = useState([
    {
      id: 1,
      ticketCode: "TCK-1001",
      subject: "Need help with DBT Fertilizer Subsidy Report format",
      category: "GST_COMPLIANCE",
      priority: "HIGH",
      status: "OPEN",
      date: "Today, 10:30 AM",
      rakiAiReply: "🤖 Raki AI: We have queued the custom DBT subsidy report template for your tenant. Our senior auditor has also been notified."
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "TECHNICAL",
    priority: "MEDIUM",
    description: "",
    phone: "+91 98450 12345"
  });

  const handleRaiseTicket = (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.description) return;

    const created = {
      id: Date.now(),
      ticketCode: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: newTicket.subject,
      category: newTicket.category,
      priority: newTicket.priority,
      status: "OPEN",
      date: "Just now",
      rakiAiReply: "🤖 Raki AI: Ticket logged successfully. Immediate notification dispatched to support desk & WhatsApp."
    };

    setTickets([created, ...tickets]);
    setShowModal(false);
    setNewTicket({ subject: "", category: "TECHNICAL", priority: "MEDIUM", description: "", phone: "+91 98450 12345" });
  };

  return (
    <PortalLayout>
      <div className="container-fluid p-4">
        {/* Header Bar */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <BsTicketDetailedFill className="text-primary" /> Support Desk & Ticket System
            </h4>
            <p className="text-muted small mb-0">Raise helpdesk queries, track technical issues, and get instant Raki AI autonomous resolution</p>
          </div>
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm fw-semibold" onClick={() => setShowModal(true)}>
            <BsPlusLg /> Raise New Ticket
          </button>
        </div>

        {/* Highlight Banner */}
        <div className="alert alert-primary d-flex justify-content-between align-items-center rounded-3 mb-4 p-3 shadow-sm border-0 bg-primary text-white">
          <div className="d-flex align-items-center gap-3">
            <BsRobot className="fs-2 text-warning" />
            <div>
              <h6 className="fw-bold mb-0 text-white">Raki AI Autonomous Helpdesk Active</h6>
              <span className="small text-white-50">Instant response via Email & WhatsApp Bot within 60 seconds.</span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <span className="badge bg-white text-primary px-3 py-2 fw-bold d-flex align-items-center gap-1">
              <BsWhatsapp className="text-success" /> WhatsApp Bot Online
            </span>
          </div>
        </div>

        {/* Tickets List */}
        <div className="d-flex flex-column gap-3">
          {tickets.map((tk) => (
            <div key={tk.id} className="card border-0 shadow-sm rounded-3 p-4 bg-white">
              <div className="d-flex flex-wrap justify-content-between align-items-start mb-2 gap-2">
                <div>
                  <span className="badge bg-primary me-2">{tk.ticketCode}</span>
                  <span className="badge bg-light text-secondary border me-2">{tk.category}</span>
                  <span className={`badge ${tk.priority === 'HIGH' ? 'bg-danger' : 'bg-warning text-dark'}`}>{tk.priority} Priority</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small d-flex align-items-center gap-1">
                    <BsClockHistory /> {tk.date}
                  </span>
                  <span className={`badge ${tk.status === 'RESOLVED' ? 'bg-success' : 'bg-info text-dark'}`}>
                    {tk.status}
                  </span>
                </div>
              </div>

              <h5 className="fw-bold text-dark mb-2">{tk.subject}</h5>

              {/* Raki AI Automated Reply Box */}
              {tk.rakiAiReply && (
                <div className="p-3 bg-light rounded-3 border-start border-4 border-primary mt-2">
                  <p className="small mb-0 text-dark fw-semibold">{tk.rakiAiReply}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Raise Ticket Modal */}
        {showModal && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow rounded-3">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold">Raise Support Ticket</h5>
                  <button className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleRaiseTicket}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Subject / Issue Summary *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required
                        placeholder="Brief summary of the issue..."
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                      />
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Category</label>
                        <select 
                          className="form-select"
                          value={newTicket.category}
                          onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                        >
                          <option value="BILLING">Billing & Subscription</option>
                          <option value="TECHNICAL">Technical / Printer</option>
                          <option value="GST_COMPLIANCE">GST Compliance</option>
                          <option value="BUG">Bug Report</option>
                          <option value="FEATURE_REQUEST">Feature Request</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Priority</label>
                        <select 
                          className="form-select"
                          value={newTicket.priority}
                          onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Detailed Description *</label>
                      <textarea 
                        className="form-control" 
                        rows="4" 
                        required
                        placeholder="Describe the issue, error message, or assistance needed..."
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer border-top bg-light">
                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary fw-semibold px-4">Submit Ticket</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
