import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../nextpart.css";
import { FiSearch, FiFilter } from "react-icons/fi";

function DeliveryChallan() {
  const navigate = useNavigate();
  const [challans, setChallans] = useState([]);
  const [dayFilter, setDayFilter] = useState("365");
  const [statusFilter, setStatusFilter] = useState("Open");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("deliveryChallans")) || [];
    setChallans(stored);
  }, []);

  const filtered = challans.filter((c) => {
    if (statusFilter === "All") return true;
    return c.status === statusFilter;
  });

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content delivery-page">
          <div className="delivery-header" style={{marginTop:"5%"}}>
            <h2>Delivery Challan</h2>

            <button
              className="create-delivery-btn"
              onClick={() => navigate("/create-delivery-challan")}
            >
              Create Delivery Challan
            </button>
          </div>

          <div className="delivery-filters">
            <div className="filter-input">
              <FiSearch className="icon" />
            </div>

            <select
              className="filter-select"
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
            >
              <option value="365">Last 365 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="7">Last 7 Days</option>
            </select>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Open">Show Open Challans</option>
              <option value="Closed">Show Closed Challans</option>
              <option value="All">Show All</option>
            </select>
          </div>

          <div className="delivery-table-box">
            {filtered.length === 0 ? (
              <div className="no-delivery">
                <FiSearch style={{fontSize:"120px", fontWeight:"bold",color:"black"}}/>
                <p>No Transactions Matching the current filter</p>
              </div>
            ) : (
              <table className="delivery-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Delivery Challan Number</th>
                    <th>Party Name</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={i}>
                      <td>{c.date}</td>
                      <td>{`DC-${c.number}`}</td>
                      <td>{c.party}</td>
                      <td>₹ {c.total}</td>
                      <td className={c.status === "Open" ? "open" : "closed"}>
                        {c.status}
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

export default DeliveryChallan;
