import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsFileEarmarkMinus,
  BsCashStack,
  BsCalendar3,
  BsFileEarmarkText,
  BsPeopleFill,
  BsPlus,
  BsInboxFill,
  BsDownload,
  BsCheckCircleFill,
  BsXCircleFill
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../creditNote.css";

export default function CreditNote() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("creditNotes")) || [];
    setNotes(stored);
  }, []);

  // Calculate statistics
  const totalNotes = notes.length;
  const totalAmount = notes.reduce((sum, n) => sum + (Number(n.total) || 0), 0);
  const openNotes = notes.filter(n => n.status === "Open").length;
  const closedNotes = notes.filter(n => n.status === "Closed").length;

  // Export to CSV
  const handleExportReport = () => {
    if (notes.length === 0) {
      alert("No credit notes to export");
      return;
    }

    const headers = ["Date", "Credit Note Number", "Party Name", "Invoice No", "Amount", "Status"];
    const csvData = notes.map(n => [
      n.date,
      `CN-${n.number}`,
      n.party || "-",
      n.invoice || "-",
      Number(n.total).toFixed(2),
      n.status
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `credit_notes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">

          {/* Modern Page Header */}
          <div className="credit-note-page-header">
            <div className="credit-note-header-content">
              <div className="credit-note-title-section">
                <h2 className="credit-note-page-title">
                  <BsFileEarmarkMinus className="credit-note-title-icon" /> Credit Note
                </h2>
                <p className="credit-note-page-subtitle">Manage credit notes and adjustments</p>
              </div>
              <div className="credit-note-header-actions">
                <button className="credit-note-report-btn" onClick={handleExportReport}>
                  <BsDownload /> Export Report
                </button>
                <button className="credit-note-create-btn" onClick={() => navigate("/create-credit-note")}>
                  <BsPlus /> Create Credit Note
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="credit-note-summary-row">
            <div className="credit-note-summary-card total-notes">
              <div className="credit-note-card-icon-wrapper total-notes-icon">
                <BsFileEarmarkMinus className="credit-note-card-icon" />
              </div>
              <div className="credit-note-card-content">
                <h4>Total Credit Notes</h4>
                <p>{totalNotes}</p>
              </div>
            </div>

            <div className="credit-note-summary-card total-amount">
              <div className="credit-note-card-icon-wrapper total-amount-icon">
                <BsCashStack className="credit-note-card-icon" />
              </div>
              <div className="credit-note-card-content">
                <h4>Total Amount</h4>
                <p>₹ {totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="credit-note-summary-card open-notes">
              <div className="credit-note-card-icon-wrapper open-notes-icon">
                <BsXCircleFill className="credit-note-card-icon" />
              </div>
              <div className="credit-note-card-content">
                <h4>Open</h4>
                <p>{openNotes}</p>
              </div>
            </div>

            <div className="credit-note-summary-card closed-notes">
              <div className="credit-note-card-icon-wrapper closed-notes-icon">
                <BsCheckCircleFill className="credit-note-card-icon" />
              </div>
              <div className="credit-note-card-content">
                <h4>Closed</h4>
                <p>{closedNotes}</p>
              </div>
            </div>
          </div>

          {/* Credit Note Table */}
          <div className="credit-note-table-container">
            {notes.length === 0 ? (
              <div className="credit-note-empty-state">
                <BsInboxFill className="credit-note-empty-icon" />
                <h3>No Credit Notes Found</h3>
                <p>Start tracking credit notes and adjustments</p>
                <button
                  className="credit-note-empty-add-btn"
                  onClick={() => navigate("/create-credit-note")}
                >
                  <BsPlus /> Create Your First Credit Note
                </button>
              </div>
            ) : (
              <table className="credit-note-table">
                <thead>
                  <tr>
                    <th><BsCalendar3 /> Date</th>
                    <th>Credit Note Number</th>
                    <th><BsPeopleFill /> Party Name</th>
                    <th><BsFileEarmarkText /> Invoice No</th>
                    <th><BsCashStack /> Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((n, i) => (
                    <tr key={i}>
                      <td>{n.date}</td>
                      <td className="note-number-cell">{`CN-${n.number}`}</td>
                      <td className="party-name-cell">
                        <BsPeopleFill className="party-icon" /> {n.party || "-"}
                      </td>
                      <td>{n.invoice || "-"}</td>
                      <td className="amount-cell">₹ {Number(n.total).toFixed(2)}</td>
                      <td>
                        <span className={`credit-note-status-badge ${n.status === "Closed" ? "closed" : "open"}`}>
                          {n.status === "Closed" ? <BsCheckCircleFill /> : <BsXCircleFill />}
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
