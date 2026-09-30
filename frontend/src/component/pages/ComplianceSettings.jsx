import React, { useState, useEffect } from "react";
import PortalLayout from "../PortalLayout";
import { 
  BsShieldCheck, 
  BsCheckCircleFill, 
  BsCalendarCheckFill,
  BsPlusCircle,
  BsToggleOn,
  BsToggleOff,
  BsTrash
} from "react-icons/bs";
import Swal from "sweetalert2";

const DEFAULT_RULES = [
  {
    id: 1,
    ruleCode: "TDS-194C",
    type: "Income Tax TDS",
    section: "Section 194C (Contractor Payments)",
    rate: "2.000%",
    threshold: "₹30,000 Single / ₹1,00,000 Agg.",
    effectiveFrom: "2026-04-01",
    status: "ACTIVE"
  },
  {
    id: 2,
    ruleCode: "TDS-194J",
    type: "Income Tax TDS",
    section: "Section 194J (Professional & Tech Fees)",
    rate: "10.000%",
    threshold: "₹30,000 Aggregate",
    effectiveFrom: "2026-04-01",
    status: "ACTIVE"
  },
  {
    id: 3,
    ruleCode: "TCS-206C-1H",
    type: "Income Tax TCS",
    section: "Section 206C(1H) (Sale of Goods)",
    rate: "0.100%",
    threshold: "₹50,00,000 Turnover",
    effectiveFrom: "2026-04-01",
    status: "ACTIVE"
  },
  {
    id: 4,
    ruleCode: "EPF-EMP",
    type: "Statutory Payroll",
    section: "Employees' Provident Fund (EPF)",
    rate: "12.000%",
    threshold: "Capped at ₹15,000 Basic",
    effectiveFrom: "2026-04-01",
    status: "ACTIVE"
  },
  {
    id: 5,
    ruleCode: "ESI-EMP",
    type: "Statutory Payroll",
    section: "Employees' State Insurance (ESI)",
    rate: "0.750%",
    threshold: "Gross <= ₹21,000 / Month",
    effectiveFrom: "2026-04-01",
    status: "ACTIVE"
  }
];

export default function ComplianceSettings() {
  const userId = localStorage.getItem("userId") || "default";
  const storageKey = `tenant_compliance_rules_${userId}`;

  const [rules, setRules] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_RULES;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState({
    ruleCode: "",
    type: "Income Tax TDS",
    section: "",
    rate: "",
    threshold: "",
    effectiveFrom: new Date().toISOString().slice(0, 10),
    status: "ACTIVE"
  });

  const saveRules = (updatedRules) => {
    setRules(updatedRules);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedRules));
    } catch (_) {}
  };

  const toggleStatus = (id) => {
    const updated = rules.map(r => {
      if (r.id === id) {
        return { ...r, status: r.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" };
      }
      return r;
    });
    saveRules(updated);
  };

  const handleDeleteRule = (id) => {
    Swal.fire({
      title: "Remove Compliance Rule?",
      text: "Are you sure you want to delete this statutory rule for your business?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Remove"
    }).then((res) => {
      if (res.isConfirmed) {
        const updated = rules.filter(r => r.id !== id);
        saveRules(updated);
        Swal.fire("Removed!", "Rule has been removed.", "success");
      }
    });
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRule.ruleCode || !newRule.rate) {
      Swal.fire("Missing Details", "Please fill in the Rule Code and Statutory Rate.", "warning");
      return;
    }
    const created = {
      ...newRule,
      id: Date.now()
    };
    saveRules([...rules, created]);
    setShowAddModal(false);
    setNewRule({
      ruleCode: "",
      type: "Income Tax TDS",
      section: "",
      rate: "",
      threshold: "",
      effectiveFrom: new Date().toISOString().slice(0, 10),
      status: "ACTIVE"
    });
    Swal.fire("Added!", "Statutory rule added to your business profile.", "success");
  };

  const activeCount = rules.filter(r => r.status === "ACTIVE").length;

  return (
    <PortalLayout>
      <div className="container-fluid p-4">
        {/* Header Bar */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <BsShieldCheck className="text-primary" /> Indian Statutory Compliance & Tax Engine
            </h4>
            <p className="text-muted small mb-0">Date-effective compliance rules for GST, TDS, TCS, EPF, ESI, and Professional Tax</p>
          </div>
          <button 
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setShowAddModal(true)}
          >
            <BsPlusCircle /> Add Custom Statutory Rule
          </button>
        </div>

        {/* Highlight Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <span className="text-muted small fw-bold">JURISDICTION</span>
              <h5 className="fw-bold mb-0 text-primary mt-1">India (CBDT & CBIC)</h5>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <span className="text-muted small fw-bold">VERSIONED RULE ENGINE</span>
              <p className="small mb-0 text-success fw-bold mt-1 d-flex align-items-center gap-1">
                <BsCheckCircleFill /> Date-Effective Historical Retrospectivity
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <span className="text-muted small fw-bold">ACTIVE STATUTORY RULES</span>
              <h5 className="fw-bold mb-0 text-dark mt-1">{activeCount} Active / {rules.length} Total</h5>
            </div>
          </div>
        </div>

        {/* Rules Table */}
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="card-header bg-light border-bottom p-3 d-flex justify-content-between align-items-center">
            <h6 className="fw-bold mb-0 text-dark">Active Statutory Withholding & Tax Rules</h6>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
              Live Real-Time Tenant Rules
            </span>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Rule Code</th>
                    <th>Statutory Type</th>
                    <th>Act & Section Reference</th>
                    <th>Statutory Rate</th>
                    <th>Threshold Limit</th>
                    <th>Effective From</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {rules.map((r) => (
                    <tr key={r.id} className={r.status === "INACTIVE" ? "opacity-50" : ""}>
                      <td className="fw-bold text-primary">{r.ruleCode}</td>
                      <td><span className="badge bg-light text-secondary border">{r.type}</span></td>
                      <td className="fw-semibold">{r.section}</td>
                      <td className="fw-bold text-success">{r.rate}</td>
                      <td>{r.threshold || "N/A"}</td>
                      <td><BsCalendarCheckFill className="text-muted me-1" /> {r.effectiveFrom}</td>
                      <td>
                        <span className={`badge ${r.status === 'ACTIVE' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border'} px-2 py-1`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button 
                          className={`btn btn-sm ${r.status === 'ACTIVE' ? 'btn-outline-warning' : 'btn-outline-success'} me-2`}
                          onClick={() => toggleStatus(r.id)}
                          title={r.status === 'ACTIVE' ? "Deactivate Rule" : "Activate Rule"}
                        >
                          {r.status === 'ACTIVE' ? <BsToggleOn size={18} /> : <BsToggleOff size={18} />}
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteRule(r.id)}
                          title="Remove Rule"
                        >
                          <BsTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Rule Modal */}
        {showAddModal && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold text-dark">Add Statutory Compliance Rule</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <form onSubmit={handleAddRule}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Rule Code *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. TDS-194Q, TCS-206C" 
                        value={newRule.ruleCode}
                        onChange={e => setNewRule({ ...newRule, ruleCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Statutory Type</label>
                      <select 
                        className="form-select"
                        value={newRule.type}
                        onChange={e => setNewRule({ ...newRule, type: e.target.value })}
                      >
                        <option value="Income Tax TDS">Income Tax TDS</option>
                        <option value="Income Tax TCS">Income Tax TCS</option>
                        <option value="GST Withholding">GST Withholding</option>
                        <option value="Statutory Payroll">Statutory Payroll</option>
                        <option value="Custom Statutory">Custom Statutory</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Section / Law Reference</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Section 194Q (Purchase of Goods)" 
                        value={newRule.section}
                        onChange={e => setNewRule({ ...newRule, section: e.target.value })}
                      />
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-bold">Statutory Rate *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. 0.100% or 10%" 
                          value={newRule.rate}
                          onChange={e => setNewRule({ ...newRule, rate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold">Effective Date</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          value={newRule.effectiveFrom}
                          onChange={e => setNewRule({ ...newRule, effectiveFrom: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Threshold Limit</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. ₹50,00,000 Turnover" 
                        value={newRule.threshold}
                        onChange={e => setNewRule({ ...newRule, threshold: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-top bg-light">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary fw-bold">Save Statutory Rule</button>
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
