import React, { useState } from "react";
import PortalLayout from "../PortalLayout";
import { 
  BsShieldCheck, 
  BsCheckCircleFill, 
  BsFileEarmarkTextFill, 
  BsCashStack, 
  BsCalendarCheckFill
} from "react-icons/bs";

export default function ComplianceSettings() {
  const [rules, setRules] = useState([
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
  ]);

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
              <h5 className="fw-bold mb-0 text-dark mt-1">{rules.length} Configured Rules</h5>
            </div>
          </div>
        </div>

        {/* Rules Table */}
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="card-header bg-light border-bottom p-3">
            <h6 className="fw-bold mb-0 text-dark">Active Statutory Withholding & Tax Rules</h6>
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
                  </tr>
                </thead>
                <tbody className="small">
                  {rules.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-bold text-primary">{r.ruleCode}</td>
                      <td><span className="badge bg-light text-secondary border">{r.type}</span></td>
                      <td className="fw-semibold">{r.section}</td>
                      <td className="fw-bold text-success">{r.rate}</td>
                      <td>{r.threshold}</td>
                      <td><BsCalendarCheckFill className="text-muted me-1" /> {r.effectiveFrom}</td>
                      <td><span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
