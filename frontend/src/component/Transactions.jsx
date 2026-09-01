import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BsReceipt, 
  BsEyeFill, 
  BsPrinterFill, 
  BsArrowRight, 
  BsPlusCircleFill,
  BsSearch
} from "react-icons/bs";
import { getInvoices } from "../services/api";

export default function Transactions() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRecent = async () => {
      // Only attempt live data fetch if user is logged in
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setInvoices([]);
        return;
      }
      try {
        const liveInvoices = await getInvoices(userId);
        if (Array.isArray(liveInvoices) && liveInvoices.length > 0) {
          const mapped = liveInvoices.slice(0, 6).map((inv, idx) => ({
            id: inv.invoiceId || `INV-${1000 + idx}`,
            customerName: inv.customerName || (inv.customer && inv.customer.name) || "Valued Client",
            date: inv.invoiceDate || "Recent",
            amount: inv.totalAmount || 0,
            status: inv.isFullyReturned ? "OVERDUE" : (inv.isSaled ? "PAID" : "PENDING"),
            type: "Sales Invoice"
          }));
          setInvoices(mapped);
        } else {
          setInvoices([]);
        }
      } catch (err) {
        setInvoices([]);
      }
    };
    fetchRecent();
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          inv.id.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    return matchesSearch && inv.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="dashboard-card-box">
      <div className="box-header">
        <h4><BsReceipt className="text-primary" /> Latest Transactions</h4>
        <Link to="/sales-invoices" className="box-action-link">
          View All Invoices <BsArrowRight />
        </Link>
      </div>

      {/* Filter Tabs & Quick Search */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="d-flex gap-1">
          {['all', 'paid', 'pending', 'overdue'].map(tab => (
            <button
              key={tab}
              className={`btn btn-sm ${filter === tab ? 'btn-primary text-white' : 'btn-light'} px-3 rounded-pill`}
              style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize' }}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '200px' }}>
          <BsSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem' }} />
          <input 
            type="text" 
            placeholder="Search recent..." 
            className="form-control form-control-sm ps-4" 
            style={{ fontSize: '0.8rem', borderRadius: '8px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="saas-table-container">
        <table className="saas-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <span className="fw-bold text-primary">{inv.id}</span>
                    <div className="text-muted small" style={{ fontSize: '0.72rem' }}>{inv.type}</div>
                  </td>
                  <td>
                    <div className="fw-semibold">{inv.customerName}</div>
                  </td>
                  <td className="text-muted">{inv.date}</td>
                  <td>
                    <strong className="text-dark">₹ {Number(inv.amount).toLocaleString('en-IN')}</strong>
                  </td>
                  <td>
                    <span className={`badge-status ${inv.status.toLowerCase()}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <Link to="/sales-invoices" className="btn btn-sm btn-outline-secondary me-1 py-1 px-2" title="View Bill">
                      <BsEyeFill />
                    </Link>
                    <Link to="/sales-invoices" className="btn btn-sm btn-outline-primary py-1 px-2" title="Print Invoice">
                      <BsPrinterFill />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  No matching transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
