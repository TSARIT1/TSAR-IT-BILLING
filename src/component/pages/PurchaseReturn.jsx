import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../purchsed.css";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function PurchaseReturn() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("purchaseReturns")) || [];
    setReturns(stored);
  }, []);

  return (
    <>
      <Navbar />
      <div className="pr-layout">
        <Sidebar />

        <div className="pr-content">
          <div className="pr-header">
            <h2>Purchase Return</h2>

            <button
              className="pr-create-btn"
              onClick={() => navigate("/create-purchase-return")}
            >
              Create Purchase Return
            </button>
          </div>

          <div className="pr-filter-row">
            <div className="pr-search-box">
              <FiSearch className="pr-search-icon" />
              <input placeholder="Search" />
            </div>

            <select className="pr-filter-select">
              <option>Last 365 Days</option>
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
            </select>
          </div>

          <div className="pr-table-box">
            {returns.length === 0 ? (
              <div className="pr-empty">
                <p>No Transactions Matching the current filter</p>
              </div>
            ) : (
              <table className="pr-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Purchase Return Number</th>
                    <th>Party Name</th>
                    <th>Due In</th>
                    <th>Purchase No</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody style={{color:"black"}}>
                  {returns.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td>{`PR-${r.number}`}</td>
                      <td>{r.party.name}</td>
                      <td>{r.due || "-"}</td>
                      <td>{r.purchaseNo || "-"}</td>
                      <td>₹ {r.total}</td>
                      <td>{r.status}</td>
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

export default PurchaseReturn;
