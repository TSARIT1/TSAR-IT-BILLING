import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../allPart.css";

function SalesReturn() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("salesReturns")) || [];
    setReturns(stored);
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content sales-return-page">
          <div className="sales-return-header" style={{ marginTop: "5%" }}>
            <h2>Sales Return</h2>

            <button
              className="create-sales-return-btn"
              onClick={() => navigate("/create-sales-return")}
            >
              Create Sales Return
            </button>
          </div>

          <div className="sales-return-table-container">
            {returns.length === 0 ? (
              <div className="no-sales-return">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7486/7486802.png"
                  width="80"
                  alt=""
                  style={{ opacity: 0.3 }}
                />
                <p>No Transactions Matching the current filter</p>
              </div>
            ) : (
              <table className="sales-return-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sales Return Number</th>
                    <th>Party Name</th>
                    <th>Due In</th>
                    <th>Invoice No</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {returns.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td>{`SR-${r.number}`}</td>
                      <td>{r.party}</td>
                      <td>{r.due || "-"}</td>
                      <td>{r.invoice || "-"}</td>
                      <td>₹ {r.total}</td>
                      <td>
                        <span
                          className={
                            r.status === "Closed"
                              ? "status-closed"
                              : "status-open"
                          }
                        >
                          {r.status}
                        </span>
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

export default SalesReturn;
