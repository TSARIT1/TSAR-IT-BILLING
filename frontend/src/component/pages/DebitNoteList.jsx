import React, { useState, useEffect } from "react";
import {
  BsFileEarmarkPlus,
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
import "../debitNote.css";
import { useNavigate } from "react-router-dom";

export default function DebitNoteList({ onCreate }) {
  const navigate = useNavigate();
  const [debitNotes, setDebitNotes] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("debitNotes")) || [];
    setDebitNotes(stored);
  }, []);

  // Calculate statistics
  const totalNotes = debitNotes.length;
  const totalAmount = debitNotes.reduce((sum, n) => sum + (Number(n.total) || 0), 0);
  const openNotes = debitNotes.filter(n => n.status === "Open" || n.status === "Unpaid").length;
  const closedNotes = debitNotes.filter(n => n.status === "Closed" || n.status === "Paid").length;

  // Export to CSV
  const handleExportReport = () => {
    if (debitNotes.length === 0) {
      alert("No debit notes to export");
      return;
    }

    const headers = ["Sr.No", "Date", "Debit Note Number", "Party Name", "Purchase No", "Amount", "Status"];
    const csvData = debitNotes.map((n, i) => [
      i + 1,
      n.date,
      `DN-${n.number}`,
      n.party,
      n.purchaseNo || "-",
      n.total,
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
    a.download = `debit_notes_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <div className="debit-note-page-header">
            <div className="debit-note-header-content">
              <div className="debit-note-title-section">
                <h2 className="debit-note-page-title">
                  <BsFileEarmarkPlus className="debit-note-title-icon" /> Debit Note
                </h2>
                <p className="debit-note-page-subtitle">Manage debit notes for purchase returns</p>
              </div>
              <div className="debit-note-header-actions">
                <button className="debit-note-report-btn" onClick={handleExportReport}>
                  <BsDownload /> Export Report
                </button>
                <button
                  className="debit-note-create-btn"
                  onClick={() => navigate("/debit-note/create")}
                >
                  <BsPlus /> Create Debit Note
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="debit-note-summary-row">
            <div className="debit-note-summary-card total-notes">
              <div className="debit-note-card-icon-wrapper total-notes-icon">
                <BsFileEarmarkPlus className="debit-note-card-icon" />
              </div>
              <div className="debit-note-card-content">
                <h4>Total Debit Notes</h4>
                <p>{totalNotes}</p>
              </div>
            </div>

            <div className="debit-note-summary-card total-amount">
              <div className="debit-note-card-icon-wrapper total-amount-icon">
                <BsCashStack className="debit-note-card-icon" />
              </div>
              <div className="debit-note-card-content">
                <h4>Total Amount</h4>
                <p>₹ {totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="debit-note-summary-card open-notes">
              <div className="debit-note-card-icon-wrapper open-notes-icon">
                <BsXCircleFill className="debit-note-card-icon" />
              </div>
              <div className="debit-note-card-content">
                <h4>Open</h4>
                <p>{openNotes}</p>
              </div>
            </div>

            <div className="debit-note-summary-card closed-notes">
              <div className="debit-note-card-icon-wrapper closed-notes-icon">
                <BsCheckCircleFill className="debit-note-card-icon" />
              </div>
              <div className="debit-note-card-content">
                <h4>Closed</h4>
                <p>{closedNotes}</p>
              </div>
            </div>
          </div>

          {/* Debit Note Table */}
          <div className="debit-note-table-container">
            {debitNotes.length === 0 ? (
              <div className="debit-note-empty-state">
                <BsInboxFill className="debit-note-empty-icon" />
                <h3>No Debit Notes Found</h3>
                <p>Start creating debit notes for purchase returns</p>
                <button
                  className="debit-note-empty-add-btn"
                  onClick={() => navigate("/debit-note/create")}
                >
                  <BsPlus /> Create Your First Debit Note
                </button>
              </div>
            ) : (
              <table className="debit-note-table">
                <thead>
                  <tr>
                    <th>Sr.No</th>
                    <th><BsCalendar3 /> Date</th>
                    <th>Debit Note Number</th>
                    <th><BsPeopleFill /> Party Name</th>
                    <th><BsFileEarmarkText /> Purchase No</th>
                    <th><BsCashStack /> Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {debitNotes.map((n, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{n.date}</td>
                      <td className="note-number-cell">DN-{n.number}</td>
                      <td className="party-name-cell">
                        <BsPeopleFill className="party-icon" /> {n.party}
                      </td>
                      <td>{n.purchaseNo || "-"}</td>
                      <td className="amount-cell">₹ {n.total}</td>
                      <td>
                        <span className={`debit-note-status-badge ${(n.status === "Closed" || n.status === "Paid") ? "closed" : "open"}`}>
                          {(n.status === "Closed" || n.status === "Paid") ? <BsCheckCircleFill /> : <BsXCircleFill />}
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
