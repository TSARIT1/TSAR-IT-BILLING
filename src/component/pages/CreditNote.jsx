import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../allPart.css";

export default function CreditNote() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("creditNotes")) || [];
    setNotes(stored);
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content creditnote-list" style={{ marginTop: "2%" }}>
          <div className="creditnote-top" style={{marginTop:"2%"}}>
            <h2>Credit Note</h2>
            <button className="create-credit-btn" onClick={() => navigate("/create-credit-note")}>Create Credit Note</button>
          </div>

          <div className="creditnote-container">
            {notes.length === 0 ? (
              <div className="empty-credit">
                <div className="empty-illustration" />
                <p>No Transactions Matching the current filter</p>
              </div>
            ) : (
              <table className="creditnote-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Credit Note Number</th>
                    <th>Party Name</th>
                    <th>Invoice No</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((n, i) => (
                    <tr key={i}>
                      <td>{n.date}</td>
                      <td>{`CN-${n.number}`}</td>
                      <td>{n.party || "-"}</td>
                      <td>{n.invoice || "-"}</td>
                      <td>₹ {Number(n.total).toFixed(2)}</td>
                      <td>
                        <span className={n.status === "Closed" ? "tag-closed" : "tag-open"}>
                          {n.status}
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
