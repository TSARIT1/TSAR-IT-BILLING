import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../allPart.css";
import { FiCalendar } from "react-icons/fi";
import { AiOutlineFileExclamation } from "react-icons/ai";
import { Link } from "react-router-dom";

function QuotationEstimate() {
  const [filterDays, setFilterDays] = useState("365");
  const [statusFilter, setStatusFilter] = useState("Open");
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("quotations")) || [];
    setQuotations(stored);
  }, []);

  const filteredQuotations = quotations.filter((q) => {
    if (statusFilter === "All") return true;
    return q.status === statusFilter;
  });

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content quotation-page">
          <div className="quotation-header">
            <h2>Quotation / Estimate</h2>
          </div>

          <div className="filter-container">
            <div className="filter-left">
              <div className="filter-box">
                <FiCalendar className="filter-icon" />
                <select
                  value={filterDays}
                  onChange={(e) => setFilterDays(e.target.value)}
                >
                  <option value="365">Last 365 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="7">Last 7 Days</option>
                </select>
              </div>

              <div className="filter-box">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="Open">Show Open Quotation</option>
                  <option value="Closed">Show Closed Quotation</option>
                  <option value="All">Show All</option>
                </select>
              </div>
            </div>

            <div className="filter-right">
              <Link to="/create-quotation">
                <button className="create-quotation-btn">Create Quotation</button>
              </Link>
            </div>
          </div>

          <div className="quotation-table-wrapper">
            <table className="quotation-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Quotation Number</th>
                  <th>Party Name</th>
                  <th>Due In</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      <AiOutlineFileExclamation className="no-icon" />
                      <p>No Transactions Matching the Current Filter</p>
                    </td>
                  </tr>
                ) : (
                  filteredQuotations.map((q, i) => (
                    <tr key={i}>
                      <td>{q.date}</td>
                      <td>{q.number}</td>
                      <td>{q.party}</td>
                      <td>{q.due}</td>
                      <td>₹ {q.amount}</td>
                      <td>
                        <span
                          className={`status-tag ${
                            q.status === "Open" ? "open" : "closed"
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default QuotationEstimate;
