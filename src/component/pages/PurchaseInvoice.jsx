import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { FiSearch } from "react-icons/fi";
import "../nextpart.css";

function PurchaseInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("purchaseInvoices")) || [];
    setInvoices(stored);
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content purchase-invoice-page">
          
          <div className="purchase-filter-row">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input placeholder="Search..." />
            </div>

            <button
              className="create-purchase-btn"
              onClick={() => navigate("/create-purchase-invoice")}
            >
              Create Purchase Invoice
            </button>
          </div>

          <div className="purchase-table-box">
            {invoices.length === 0 ? (
              <p>No Transactions Found</p>
            ) : (
              <table className="purchase-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Inv No</th>
                    <th>Party</th>
                    <th>Mobile</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((inv, i) => (
                    <tr key={i}>
                      <td>{inv.date}</td>
                      <td>PI-{inv.number}</td>
                      <td>{inv.partyName}</td>
                      <td>{inv.partyMobile}</td>
                      <td>₹ {inv.finalTotal}</td>
                      <td>{inv.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default PurchaseInvoices;
