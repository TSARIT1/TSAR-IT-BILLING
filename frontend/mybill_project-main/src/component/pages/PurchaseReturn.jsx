import React, { useEffect, useState } from "react";
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
import "../purchaseReturn.css";
import { useNavigate } from "react-router-dom";

function PurchaseReturn() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("purchaseReturns")) || [];
    setReturns(stored);
  }, []);

  // Calculate statistics
  const totalReturns = returns.length;
  const totalAmount = returns.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
  const openReturns = returns.filter(r => r.status === "Open" || r.status === "Unpaid").length;
  const closedReturns = returns.filter(r => r.status === "Closed" || r.status === "Paid").length;

  // Export to CSV
  const handleExportReport = () => {
    if (returns.length === 0) {
      alert("No purchase returns to export");
      return;
    }

    const headers = ["Date", "Return Number", "Party Name", "Due In", "Purchase No", "Amount", "Status"];
    const csvData = returns.map(r => [
      r.date,
      `PR-${r.number}`,
      r.party.name,
      r.due || "-",
      r.purchaseNo || "-",
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
    a.download = `purchase_returns_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <div className="purchase-return-page-header">
            <div className="purchase-return-header-content">
              <div className="purchase-return-title-section">
                <h2 className="purchase-return-page-title">
                  <BsArrowReturnLeft className="purchase-return-title-icon" /> Purchase Return
                </h2>
                <p className="purchase-return-page-subtitle">Manage purchase returns to suppliers</p>
              </div>
              <div className="purchase-return-header-actions">
                <button className="purchase-return-report-btn" onClick={handleExportReport}>
                  <BsDownload /> Export Report
                </button>
                <button
                  className="purchase-return-create-btn"
                  onClick={() => navigate("/create-purchase-return")}
                >
                  <BsPlus /> Create Purchase Return
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="purchase-return-summary-row">
            <div className="purchase-return-summary-card total-returns">
              <div className="purchase-return-card-icon-wrapper total-returns-icon">
                <BsArrowReturnLeft className="purchase-return-card-icon" />
              </div>
              <div className="purchase-return-card-content">
                <h4>Total Returns</h4>
                <p>{totalReturns}</p>
              </div>
            </div>

            <div className="purchase-return-summary-card total-amount">
              <div className="purchase-return-card-icon-wrapper total-amount-icon">
                <BsCashStack className="purchase-return-card-icon" />
              </div>
              <div className="purchase-return-card-content">
                <h4>Total Amount</h4>
                <p>₹ {totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="purchase-return-summary-card open-returns">
              <div className="purchase-return-card-icon-wrapper open-returns-icon">
                <BsXCircleFill className="purchase-return-card-icon" />
              </div>
              <div className="purchase-return-card-content">
                <h4>Open</h4>
                <p>{openReturns}</p>
              </div>
            </div>

            <div className="purchase-return-summary-card closed-returns">
              <div className="purchase-return-card-icon-wrapper closed-returns-icon">
                <BsCheckCircleFill className="purchase-return-card-icon" />
              </div>
              <div className="purchase-return-card-content">
                <h4>Closed</h4>
                <p>{closedReturns}</p>
              </div>
            </div>
          </div>

          {/* Purchase Return Table */}
          <div className="purchase-return-table-container">
            {returns.length === 0 ? (
              <div className="purchase-return-empty-state">
                <BsInboxFill className="purchase-return-empty-icon" />
                <h3>No Purchase Returns Found</h3>
                <p>Start tracking purchase returns to suppliers</p>
                <button
                  className="purchase-return-empty-add-btn"
                  onClick={() => navigate("/create-purchase-return")}
                >
                  <BsPlus /> Create Your First Purchase Return
                </button>
              </div>
            ) : (
              <table className="purchase-return-table">
                <thead>
                  <tr>
                    <th><BsCalendar3 /> Date</th>
                    <th>Return Number</th>
                    <th><BsPeopleFill /> Party Name</th>
                    <th>Due In</th>
                    <th><BsFileEarmarkText /> Purchase No</th>
                    <th><BsCashStack /> Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {returns.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td className="return-number-cell">{`PR-${r.number}`}</td>
                      <td className="party-name-cell">
                        <BsPeopleFill className="party-icon" /> {r.party.name}
                      </td>
                      <td>{r.due || "-"}</td>
                      <td>{r.purchaseNo || "-"}</td>
                      <td className="amount-cell">₹ {r.total}</td>
                      <td>
                        <span className={`purchase-return-status-badge ${(r.status === "Closed" || r.status === "Paid") ? "closed" : "open"}`}>
                          {(r.status === "Closed" || r.status === "Paid") ? <BsCheckCircleFill /> : <BsXCircleFill />}
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

export default PurchaseReturn;
