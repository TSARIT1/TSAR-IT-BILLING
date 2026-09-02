import React, { useState, useEffect } from "react";
import PortalLayout from "../PortalLayout";
import { 
  BsTicketDetailedFill, 
  BsPlusLg, 
  BsCheckCircleFill, 
  BsClockHistory, 
  BsRobot, 
  BsWhatsapp,
  BsEnvelopeFill,
  BsTrash,
  BsInbox
} from "react-icons/bs";
import { getTickets, createTicket, deleteTicket } from "../../services/api";

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "TECHNICAL",
    priority: "MEDIUM",
    description: ""
  });

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getTickets();
      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error("Error loading tickets:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.description.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        subject: newTicket.subject.trim(),
        message: newTicket.description.trim(),
        priority: newTicket.priority,
        status: "open"
      };

      await createTicket(payload);
      setShowModal(false);
      setNewTicket({ subject: "", category: "TECHNICAL", priority: "MEDIUM", description: "" });
      await loadTickets();
    } catch (err) {
      console.error("Error raising ticket:", err);
      alert(`Failed to raise ticket: ${err?.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      try {
        await deleteTicket(id);
        await loadTickets();
      } catch (err) {
        console.error("Error deleting ticket:", err);
      }
    }
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
            <p className="text-muted small mb-0">Raise helpdesk queries, track technical issues, and get instant assistance</p>
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
              <span className="small text-white-50">Automated triage and instant notification dispatched upon submission.</span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <span className="badge bg-white text-primary px-3 py-2 fw-bold d-flex align-items-center gap-1">
              <BsWhatsapp className="text-success" /> WhatsApp Bot Online
            </span>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-2">Loading support tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
            <BsInbox className="text-muted fs-1 mb-3 mx-auto" />
            <h5 className="fw-bold text-dark">No Support Tickets Open</h5>
            <p className="text-muted small mb-4">Have an inquiry, technical question, or feedback? Raise your first support ticket.</p>
            <div>
              <button className="btn btn-primary px-4 fw-semibold" onClick={() => setShowModal(true)}>
                <BsPlusLg className="me-1" /> Raise New Ticket
              </button>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {tickets.map((tk) => {
              const ticketCode = `TCK-${tk.id ? String(tk.id).padStart(4, '0') : '1001'}`;
              const createdStr = tk.createdAt ? new Date(tk.createdAt).toLocaleString('en-IN') : 'Recent';
              const priorityUpper = (tk.priority || 'MEDIUM').toUpperCase();
              const statusUpper = (tk.status || 'OPEN').toUpperCase();

              return (
                <div key={tk.id} className="card border-0 shadow-sm rounded-3 p-4 bg-white">
                  <div className="d-flex flex-wrap justify-content-between align-items-start mb-2 gap-2">
                    <div>
                      <span className="badge bg-primary me-2">{ticketCode}</span>
                      <span className={`badge ${priorityUpper === 'HIGH' || priorityUpper === 'CRITICAL' ? 'bg-danger' : 'bg-warning text-dark'} me-2`}>
                        {priorityUpper} Priority
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small d-flex align-items-center gap-1">
                        <BsClockHistory /> {createdStr}
                      </span>
                      <span className={`badge ${statusUpper === 'CLOSED' || statusUpper === 'RESOLVED' ? 'bg-success' : 'bg-info text-dark'}`}>
                        {statusUpper}
                      </span>
                      <button 
                        className="btn btn-sm btn-outline-danger ms-2 py-0 px-2"
                        title="Delete Ticket"
                        onClick={() => handleDelete(tk.id)}
                      >
                        <BsTrash />
                      </button>
                    </div>
                  </div>

                  <h5 className="fw-bold text-dark mb-2">{tk.subject}</h5>
                  <p className="text-secondary small mb-2">{tk.message}</p>

                  <div className="p-3 bg-light rounded-3 border-start border-4 border-primary mt-2">
                    <p className="small mb-0 text-dark fw-semibold">
                      🤖 Raki AI: Ticket logged successfully. Dispatched to support desk & WhatsApp notification channel.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
                    <button type="submit" className="btn btn-primary fw-semibold px-4" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Ticket"}
                    </button>
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
