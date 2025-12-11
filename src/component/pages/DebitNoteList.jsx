import React, { useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { FiSearch } from "react-icons/fi";
import { IoCalendarOutline } from "react-icons/io5";
import "../purchsed.css";
import { useNavigate } from "react-router-dom";

export default function DebitNoteList({ onCreate }) {
  const [filter, setFilter] = useState("Last 365 Days");
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <div className="dn-layout">
        <Sidebar />

        <div className="dn-main">
          <div className="dn-list-wrap">

            <div className="dn-list-header" style={{marginTop:"2%"}}>
              <h2>Debit Note</h2>

              <div className="dn-list-actions">
                <div className="dn-search-box">
                  <FiSearch className="dn-search-icon" />
                  <input placeholder="Search Debit Notes" />
                </div>

                <div className="dn-filter-box">
                  <IoCalendarOutline className="dn-filter-icon" />
                  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option>Last 365 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 7 Days</option>
                  </select>
                </div>

                <button
                    className="dn-create-btn"
                    onClick={() => navigate("/debit-note/create")}
                    >
                    Create Debit Note
                </button>
              </div>
            </div>

            <div className="dn-table-wrap">
              <table className="dn-list-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Debit Note Number</th>
                    <th>Party Name</th>
                    <th>Purchase No</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
              </table>

              <div className="dn-empty-state">
                <img src="/mnt/data/Debite Note.PNG" alt="empty" />
                <p>No Transactions Matching the current filter</p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
