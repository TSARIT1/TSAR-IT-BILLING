import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BsReceipt,
  BsEyeFill,
  BsCashCoin,
  BsArrowRight,
  BsCheckCircleFill,
  BsSearch,
} from "react-icons/bs";
import { getSales, markSaleAsPaid } from "../services/api";

/**
 * Latest confirmed sales with REAL payment status (Sale.isPaid).
 * Merchants can mark an unpaid bill as paid right from the dashboard.
 */
export default function Transactions() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [markingId, setMarkingId] = useState(null);

  const fetchRecent = useCallback(async () => {
    try {
      const sales = await getSales();
      if (!Array.isArray(sales)) {
        setInvoices([]);
        return;
      }
      // Dedupe by saleId (a sale can span multiple items in the DTO list)
      const seen = new Set();
      const isPaidSale = (sale) => {
        if (sale.isPaid === true || sale.paid === true) return true;
        if (sale.isPaid === false || sale.paid === false) return false;
        const status = String(sale.status || "").toUpperCase();
        if (status === "PAID" || status === "SETTLED") return true;
        if (status === "UNPAID" || status === "PENDING" || status === "DUE") return false;
        return true;
      };
      const mapped = sales
        .filter((sale) => {
          const key = sale.saleId ?? `${sale.customerId}-${sale.amount}-${sale.date}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 8)
        .map((sale) => ({
          id: sale.saleId,
          customerName: sale.customerName || "Valued Client",
          date: sale.date || "Recent",
          amount: sale.amount ?? sale.totalAmount ?? 0,
          status: isPaidSale(sale) ? "PAID" : "PENDING",
        }));
      setInvoices(mapped);
    } catch (err) {
      setInvoices([]);
    }
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  const handleMarkPaid = async (saleId) => {
    setMarkingId(saleId);
    try {
      await markSaleAsPaid(saleId);
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === saleId ? { ...inv, status: "PAID" } : inv))
      );
    } catch (err) {
      alert(
        err?.message ||
          "Could not mark this bill as paid. Please try again."
      );
    } finally {
      setMarkingId(null);
    }
  };

  const fmtDate = (d) => {
    try {
      const dt = new Date(d);
      return isNaN(dt) ? String(d) : dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    } catch {
      return String(d);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchesSearch =
      inv.customerName.toLowerCase().includes(q) || String(inv.id).toLowerCase().includes(q);
    if (filter === "all") return matchesSearch;
    return matchesSearch && inv.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="dashboard-card-box">
      <div className="box-header">
        <h4>
          <BsReceipt className="text-primary" /> Latest Transactions
        </h4>
        <Link to="/sales-invoices" className="box-action-link">
          View All Invoices <BsArrowRight />
        </Link>
      </div>

      {/* Filter Tabs & Quick Search */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="d-flex gap-1">
          {["all", "paid", "pending"].map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm ${filter === tab ? "btn-dark text-white fw-bold shadow-sm" : "btn-light text-secondary border"} px-3 rounded-pill`}
              style={{ fontSize: "0.78rem", textTransform: "capitalize" }}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", width: "200px" }}>
          <BsSearch
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.8rem" }}
          />
          <input
            type="text"
            placeholder="Search recent..."
            className="form-control form-control-sm ps-4 border"
            style={{ fontSize: "0.8rem", borderRadius: "8px" }}
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
              <th>Sale #</th>
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
                    <span className="fw-bold font-mono" style={{ color: "#0f172a", fontSize: "0.88rem" }}>#{inv.id}</span>
                    <div className="text-muted" style={{ fontSize: "0.72rem" }}>Sales Bill</div>
                  </td>
                  <td>
                    <div className="fw-bold text-dark" style={{ fontSize: "0.88rem" }}>{inv.customerName}</div>
                  </td>
                  <td className="text-muted" style={{ fontSize: "0.82rem", fontWeight: 500 }}>{fmtDate(inv.date)}</td>
                  <td>
                    <strong className="text-dark font-mono" style={{ fontSize: "0.92rem", fontWeight: 700 }}>₹ {Number(inv.amount).toLocaleString("en-IN")}</strong>
                  </td>
                  <td>
                    <span className={`badge-status ${inv.status.toLowerCase()}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="text-end">
                    {inv.status === "PENDING" ? (
                      <button
                        className="btn btn-sm btn-success py-1 px-2 d-inline-flex align-items-center gap-1"
                        title="Mark this bill as paid"
                        disabled={markingId === inv.id}
                        onClick={() => handleMarkPaid(inv.id)}
                      >
                        <BsCashCoin />
                        {markingId === inv.id ? "Saving…" : "Mark Paid"}
                      </button>
                    ) : (
                      <span className="text-success d-inline-flex align-items-center gap-1" title="Payment received">
                        <BsCheckCircleFill /> Settled
                      </span>
                    )}
                    <Link
                      to="/sales-invoices"
                      className="btn btn-sm btn-outline-secondary ms-1 py-1 px-2"
                      title="View details"
                    >
                      <BsEyeFill />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  {invoices.length === 0
                    ? "No sales yet — create your first bill from POS or Sales Invoices."
                    : "No matching transactions found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
