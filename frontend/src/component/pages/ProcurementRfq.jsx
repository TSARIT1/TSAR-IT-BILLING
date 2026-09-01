import React, { useState } from "react";
import PortalLayout from "../PortalLayout";
import { 
  BsBriefcaseFill, 
  BsPlusLg, 
  BsTrophyFill, 
  BsBuilding, 
  BsCheckCircleFill, 
  BsCurrencyRupee, 
  BsClockFill,
  BsFileEarmarkTextFill
} from "react-icons/bs";

export default function ProcurementRfq() {
  const [rfqs, setRfqs] = useState([
    {
      id: 1,
      rfqNumber: "RFQ-2026-0042",
      title: "Bulk Cotton Yarn & Raw Fabric Supply (500 Meters)",
      department: "Production Division",
      closingDate: "2026-09-05",
      status: "EVALUATING",
      quotes: [
        { supplier: "Apex Raw Materials Ltd", price: 125000.00, deliveryDays: 7, terms: "Net 30", isLowest: false },
        { supplier: "Bharat Agro Suppliers", price: 112000.00, deliveryDays: 5, terms: "Net 15", isLowest: true },
        { supplier: "Delta Chemicals Co", price: 138000.00, deliveryDays: 10, terms: "Advance 50%", isLowest: false }
      ]
    },
    {
      id: 2,
      rfqNumber: "RFQ-2026-0043",
      title: "Agro Fertilizer Raw Base (Urea & DAP 10 Tons)",
      department: "Fertilizer Plant",
      closingDate: "2026-09-10",
      status: "PUBLISHED",
      quotes: [
        { supplier: "National Fertilizer Corp", price: 450000.00, deliveryDays: 3, terms: "Net 30", isLowest: true },
        { supplier: "Kisan Chemical Traders", price: 475000.00, deliveryDays: 6, terms: "Net 45", isLowest: false }
      ]
    }
  ]);

  return (
    <PortalLayout>
      <div className="container-fluid p-4">
        {/* Header Bar */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <BsBriefcaseFill className="text-primary" /> Advanced Procurement & Supplier RFQ
            </h4>
            <p className="text-muted small mb-0">Multi-supplier quotation comparisons, lowest-price analysis, and PO generation</p>
          </div>
        </div>

        {/* RFQ Comparison Cards */}
        <div className="row g-4">
          {rfqs.map((rfq) => {
            const lowestQuote = rfq.quotes.find(q => q.isLowest) || rfq.quotes[0];
            const highestQuote = [...rfq.quotes].sort((a, b) => b.price - a.price)[0];
            const maxSavings = highestQuote.price - lowestQuote.price;

            return (
              <div key={rfq.id} className="col-12">
                <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                  <div className="card-header bg-light border-bottom p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div>
                      <span className="badge bg-primary me-2">{rfq.rfqNumber}</span>
                      <span className="fw-bold text-dark fs-6">{rfq.title}</span>
                      <span className="text-muted small ms-3">Dept: {rfq.department}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-warning text-dark px-3 py-1">Closing: {rfq.closingDate}</span>
                      <span className="badge bg-info text-dark px-3 py-1">{rfq.status}</span>
                    </div>
                  </div>

                  <div className="card-body p-3">
                    <h6 className="small fw-bold text-muted text-uppercase mb-3">Multi-Vendor Quotation Matrix</h6>
                    <div className="table-responsive mb-3">
                      <table className="table table-bordered align-middle mb-0">
                        <thead className="table-light small">
                          <tr>
                            <th>Supplier Name</th>
                            <th>Quoted Price (INR)</th>
                            <th>Lead Time</th>
                            <th>Payment Terms</th>
                            <th>Evaluation Status</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody className="small">
                          {rfq.quotes.map((q, idx) => (
                            <tr key={idx} className={q.isLowest ? "table-success-subtle bg-success-subtle" : ""}>
                              <td className="fw-bold">
                                <BsBuilding className="text-muted me-1" /> {q.supplier}
                              </td>
                              <td className="fw-bold text-primary">₹{q.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td><BsClockFill className="text-muted me-1" /> {q.deliveryDays} Days</td>
                              <td>{q.terms}</td>
                              <td>
                                {q.isLowest ? (
                                  <span className="badge bg-success text-white d-inline-flex align-items-center gap-1">
                                    <BsTrophyFill /> Lowest Price Recommended
                                  </span>
                                ) : (
                                  <span className="text-muted">Standard Quote</span>
                                )}
                              </td>
                              <td className="text-end">
                                <button className={`btn btn-sm ${q.isLowest ? 'btn-success fw-bold' : 'btn-outline-secondary'}`}>
                                  Award PO
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Savings Analysis Alert */}
                    <div className="alert alert-success d-flex justify-content-between align-items-center mb-0 p-3">
                      <div>
                        <strong>Procurement Intelligence:</strong> Awarding to <u>{lowestQuote.supplier}</u> yields maximum cost optimization.
                      </div>
                      <div className="fs-6 fw-bold text-success">
                        Max Savings: ₹{maxSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </PortalLayout>
  );
}
