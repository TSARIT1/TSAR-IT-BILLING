import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";

function Parties() {
  const [parties, setParties] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("parties")) || [];
    setParties(stored);
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <div className="parties-header">
            <h2>Parties</h2>
            <div className="header-buttons">
              <button className="share-btn">Share Party Portal</button>
              <button className="report-btn">Reports</button>
            </div>
          </div>

          <div className="summary-cards">
            <div className="summary-box">
              <h4>All Parties</h4>
              <p className="count">{parties.length}</p>
            </div>
            <div className="summary-box">
              <h4>To Collect</h4>
              <p className="amount">₹ 0</p>
            </div>
            <div className="summary-box">
              <h4>To Pay</h4>
              <p className="amount">₹ 0</p>
            </div>
          </div>

          <table className="party-table">
            <thead>
              <tr>
                <th>Party Name</th>
                <th>Category</th>
                <th>Mobile Number</th>
                <th>Party Type</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {parties.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No parties added yet.
                  </td>
                </tr>
              ) : (
                parties.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td>-</td>
                    <td>{p.mobile}</td>
                    <td>{p.type}</td>
                    <td>₹ {p.balance}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Parties;
