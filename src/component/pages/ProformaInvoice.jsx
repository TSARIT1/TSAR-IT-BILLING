import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../nextpart.css";
import { FiSearch, FiCalendar } from "react-icons/fi";

function ProformaInvoice() {
  const [proformas, setProformas] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("proformas")) || [];
    setProformas(stored);
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content proforma-list-page">

          <div className="proforma-header">
            <h2>Proforma Invoice</h2>
            <Link to="/create-proforma-invoice">
              <button className="proforma-create-btn">Create Proforma Invoice</button>
            </Link>
          </div>

          <div className="proforma-filters">
            <div className="filter-box">
              <FiSearch className="filter-icon" />
              <input type="text" placeholder="Search" />
            </div>

            <div className="filter-box">
              <FiCalendar className="filter-icon" />
              <select>
                <option>Last 365 Days</option>
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
              </select>
            </div>

            <div className="filter-box">
              <select>
                <option>Show Open Invoices</option>
                <option>Show Closed Invoices</option>
                <option>Show All</option>
              </select>
            </div>
          </div>

          <div className="proforma-table-section">
            {proformas.length === 0 ? (
              <div className="empty-proforma-box">
                <div className="empty-icon">
                  <img src="/no-data.png" alt="empty" />
                </div>
                <p>No Transactions Matching the current filter</p>
              </div>
            ) : (
              <table className="proforma-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Proforma Invoice Number</th>
                    <th>Party Name</th>
                    <th>Due In</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {proformas.map((p) => (
                    <tr key={p.id}>
                      <td>{p.date}</td>
                      <td>{p.number}</td>
                      <td>{p.party}</td>
                      <td>{p.due}</td>
                      <td>₹ {p.total}</td>
                      <td className={p.status === "Closed" ? "closed" : "open"}>
                        {p.status}
                      </td>
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

export default ProformaInvoice;
