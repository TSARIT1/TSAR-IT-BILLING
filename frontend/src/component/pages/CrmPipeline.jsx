import React, { useState } from "react";
import { Link } from "react-router-dom";
import PortalLayout from "../PortalLayout";
import { 
  BsKanban, 
  BsPlusLg, 
  BsTelephoneFill, 
  BsEnvelopeFill, 
  BsBuilding, 
  BsCurrencyRupee, 
  BsArrowRight,
  BsFunnelFill,
  BsSearch,
  BsCheckCircleFill
} from "react-icons/bs";

export default function CrmPipeline() {
  const [leads, setLeads] = useState([
    {
      id: 1,
      code: "LEAD-78901",
      name: "Ramesh Sharma",
      company: "Kaveri Agro Tech",
      phone: "+91 98450 12345",
      email: "ramesh@kaveriagro.in",
      stage: "NEW",
      score: 85,
      value: 150000,
      salesperson: "Vikram Mehta",
      date: "Today"
    },
    {
      id: 2,
      code: "LEAD-78902",
      name: "Priya Sundaram",
      company: "Lotus Textiles Retail",
      phone: "+91 97890 23456",
      email: "priya@lotustextiles.com",
      stage: "QUALIFIED",
      score: 95,
      value: 420000,
      salesperson: "Ananya Roy",
      date: "Yesterday"
    },
    {
      id: 3,
      code: "LEAD-78903",
      name: "Amit Deshmukh",
      company: "Apex Electronics Hub",
      phone: "+91 99220 34567",
      email: "amit@apexelectronics.com",
      stage: "PROPOSAL_SENT",
      score: 90,
      value: 280000,
      salesperson: "Vikram Mehta",
      date: "2 days ago"
    },
    {
      id: 4,
      code: "LEAD-78904",
      name: "Gurpreet Singh",
      company: "Punjab Heavy Transport",
      phone: "+91 98140 45678",
      email: "gurpreet@punjablogistics.in",
      stage: "WON",
      score: 100,
      value: 850000,
      salesperson: "Ananya Roy",
      date: "3 days ago"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    value: "",
    salesperson: "Admin User"
  });

  const stages = [
    { key: "NEW", label: "New Leads", color: "#6366f1" },
    { key: "CONTACTED", label: "Contacted", color: "#3b82f6" },
    { key: "QUALIFIED", label: "Qualified", color: "#06b6d4" },
    { key: "PROPOSAL_SENT", label: "Proposal Sent", color: "#f59e0b" },
    { key: "WON", label: "Won / Converted", color: "#10b981" }
  ];

  const handleAddLead = (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.phone) return;

    const created = {
      id: Date.now(),
      code: `LEAD-${Math.floor(10000 + Math.random() * 90000)}`,
      name: newLead.name,
      company: newLead.company || "Individual Customer",
      phone: newLead.phone,
      email: newLead.email,
      stage: "NEW",
      score: 80,
      value: parseFloat(newLead.value) || 50000,
      salesperson: newLead.salesperson,
      date: "Just now"
    };

    setLeads([created, ...leads]);
    setShowAddModal(false);
    setNewLead({ name: "", company: "", phone: "", email: "", value: "", salesperson: "Admin User" });
  };

  const moveStage = (leadId, nextStage) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, stage: nextStage } : l));
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalLayout>
      <div className="container-fluid p-4">
        {/* Header Bar */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <BsKanban className="text-primary" /> CRM & Sales Pipeline
            </h4>
            <p className="text-muted small mb-0">Track enterprise prospects, lead scores, and convert deals to Quotations</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm fw-semibold" onClick={() => setShowAddModal(true)}>
              <BsPlusLg /> Add New Lead
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card border-0 shadow-sm mb-4 rounded-3">
          <div className="card-body p-3">
            <div className="row g-3 align-items-center">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><BsSearch className="text-muted" /></span>
                  <input 
                    type="text" 
                    className="form-control bg-light border-start-0 ps-0" 
                    placeholder="Search by lead name, company, or lead ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-7 text-md-end">
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 me-2">
                  Total Pipeline: ₹{leads.reduce((acc, l) => acc + l.value, 0).toLocaleString('en-IN')}
                </span>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                  Won Deals: {leads.filter(l => l.stage === 'WON').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board Columns */}
        <div className="row g-3 flex-nowrap overflow-auto pb-3" style={{ minHeight: "550px" }}>
          {stages.map((stg) => {
            const stageLeads = filteredLeads.filter(l => l.stage === stg.key);
            const totalStageValue = stageLeads.reduce((acc, l) => acc + l.value, 0);

            return (
              <div key={stg.key} className="col-12 col-md-4 col-xl-2" style={{ minWidth: "270px" }}>
                <div className="bg-light p-3 rounded-3 h-100 border">
                  {/* Column Header */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold small text-uppercase" style={{ color: stg.color }}>
                      {stg.label}
                    </span>
                    <span className="badge rounded-pill bg-white text-dark border px-2">
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="text-muted small mb-3 pb-2 border-bottom">
                    ₹{totalStageValue.toLocaleString('en-IN')}
                  </div>

                  {/* Cards List */}
                  <div className="d-flex flex-column gap-2">
                    {stageLeads.map((lead) => (
                      <div key={lead.id} className="card border shadow-sm rounded-3 p-3 bg-white">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="badge bg-light text-secondary border small">{lead.code}</span>
                          <span className="badge bg-success text-white small">Score: {lead.score}</span>
                        </div>
                        <h6 className="fw-bold mb-1 text-dark">{lead.name}</h6>
                        <p className="text-muted small mb-2 d-flex align-items-center gap-1">
                          <BsBuilding className="text-secondary" /> {lead.company}
                        </p>
                        <div className="small text-muted mb-2">
                          <div className="d-flex align-items-center gap-1 mb-1">
                            <BsTelephoneFill className="text-muted" style={{ fontSize: '10px' }} /> {lead.phone}
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <BsCurrencyRupee className="text-primary fw-bold" /> ₹{lead.value.toLocaleString('en-IN')}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-2">
                          {lead.stage !== "WON" ? (
                            <button 
                              className="btn btn-sm btn-outline-primary py-0 px-2 small"
                              onClick={() => {
                                const currentIndex = stages.findIndex(s => s.key === lead.stage);
                                if (currentIndex < stages.length - 1) {
                                  moveStage(lead.id, stages[currentIndex + 1].key);
                                }
                              }}
                            >
                              Move Next <BsArrowRight />
                            </button>
                          ) : (
                            <Link to="/create-quotation" className="btn btn-sm btn-success py-0 px-2 small d-flex align-items-center gap-1">
                              <BsCheckCircleFill /> Create Quote
                            </Link>
                          )}
                          <span className="text-muted small" style={{ fontSize: '11px' }}>{lead.salesperson}</span>
                        </div>
                      </div>
                    ))}

                    {stageLeads.length === 0 && (
                      <div className="text-center py-4 text-muted small">
                        No leads in this stage
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Lead Modal */}
        {showAddModal && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow rounded-3">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold">Create New Sales Lead</h5>
                  <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <form onSubmit={handleAddLead}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Prospect / Contact Name *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required 
                        value={newLead.name}
                        onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                        placeholder="e.g. Ramesh Sharma"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Company / Business Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={newLead.company}
                        onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                        placeholder="e.g. Kaveri Agro Tech"
                      />
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Phone Number *</label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          required 
                          value={newLead.phone}
                          onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                          placeholder="+91 98450 12345"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Email Address</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          value={newLead.email}
                          onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                          placeholder="client@domain.com"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Estimated Deal Value (₹)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={newLead.value}
                        onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                        placeholder="150000"
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-top bg-light">
                    <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary fw-semibold px-4">Create Lead</button>
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
