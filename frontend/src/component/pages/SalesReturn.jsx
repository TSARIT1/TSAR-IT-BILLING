import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsArrowReturnLeft,
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
import "../salesReturn.css";

function SalesReturn() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("salesReturns")) || [];
    setReturns(stored);
  }, []);

  // Calculate statistics
  const totalReturns = returns.length;
  const totalAmount = returns.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
  const openReturns = returns.filter(r => r.status === "Open").length;
  const closedReturns = returns.filter(r => r.status === "Closed").length;

  // Export to CSV
  const handleExportReport = () => {
    if (returns.length === 0) {
      alert("No sales returns to export");
      return;
    }

    const headers = ["Date", "Sales Return Number", "Party Name", "Due In", "Invoice No", "Amount", "Status"];
    const csvData = returns.map(r => [
      r.date,
      `SR-${r.number}`,
      r.party,
      r.due || "-",
      r.invoice || "-",
      r.total,
      r.status
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_returns_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <div className="sales-return-page-header">
            <div className="sales-return-header-content">
              <div className="sales-return-title-section">
                <h2 className="sales-return-page-title">
                  <BsArrowReturnLeft className="sales-return-title-icon" /> Sales Return
                </h2>
                <p className="sales-return-page-subtitle">Manage product returns and refunds</p>
              </div>
              <div className="sales-return-header-actions">
                <button className="sales-return-report-btn" onClick={handleExportReport}>
                  <BsDownload /> Export Report
                </button>
                <button
                  className="sales-return-create-btn"
                  onClick={() => navigate("/create-sales-return")}
                >
                  <BsPlus /> Create Sales Return
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="sales-return-summary-row">
            <div className="sales-return-summary-card total-returns">
              <div className="sales-return-card-icon-wrapper total-returns-icon">
                <BsArrowReturnLeft className="sales-return-card-icon" />
              </div>
              <div className="sales-return-card-content">
                <h4>Total Returns</h4>
                <p>{totalReturns}</p>
              </div>
            </div>

            <div className="sales-return-summary-card total-amount">
              <div className="sales-return-card-icon-wrapper total-amount-icon">
                <BsCashStack className="sales-return-card-icon" />
              </div>
              <div className="sales-return-card-content">
                <h4>Total Amount</h4>
                <p>₹ {totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="sales-return-summary-card open-returns">
              <div className="sales-return-card-icon-wrapper open-returns-icon">
                <BsXCircleFill className="sales-return-card-icon" />
              </div>
              <div className="sales-return-card-content">
                <h4>Open</h4>
                <p>{openReturns}</p>
              </div>
            </div>

            <div className="sales-return-summary-card closed-returns">
              <div className="sales-return-card-icon-wrapper closed-returns-icon">
                <BsCheckCircleFill className="sales-return-card-icon" />
              </div>
              <div className="sales-return-card-content">
                <h4>Closed</h4>
                <p>{closedReturns}</p>
              </div>
            </div>
          </div>

          {/* Sales Return Table */}
          <div className="sales-return-table-container">
            {returns.length === 0 ? (
              <div className="sales-return-empty-state">
                <BsInboxFill className="sales-return-empty-icon" />
                <h3>No Sales Returns Found</h3>
                <p>Start tracking product returns and refunds</p>
                <button
                  className="sales-return-empty-add-btn"
                  onClick={() => navigate("/create-sales-return")}
                >
                  <BsPlus /> Create Your First Sales Return
                </button>
              </div>
            ) : (
              <table className="sales-return-table">
                <thead>
                  <tr>
                    <th><BsCalendar3 /> Date</th>
                    <th>Sales Return Number</th>
                    <th><BsPeopleFill /> Party Name</th>
                    <th>Due In</th>
                    <th><BsFileEarmarkText /> Invoice No</th>
                    <th><BsCashStack /> Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {returns.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td className="return-number-cell">{`SR-${r.number}`}</td>
                      <td className="party-name-cell">
                        <BsPeopleFill className="party-icon" /> {r.party}
                      </td>
                      <td>{r.due || "-"}</td>
                      <td>{r.invoice || "-"}</td>
                      <td className="amount-cell">₹ {r.total}</td>
                      <td>
                        <span className={`sales-return-status-badge ${r.status === "Closed" ? "closed" : "open"}`}>
                          {r.status === "Closed" ? <BsCheckCircleFill /> : <BsXCircleFill />}
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
