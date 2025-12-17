import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsTruck,
  BsCashStack,
  BsCalendar3,
  BsPeopleFill,
  BsPlus,
  BsInboxFill,
  BsDownload,
  BsCheckCircleFill,
  BsXCircleFill,
  BsFilter
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../deliveryChallan.css";

function DeliveryChallan() {
  const navigate = useNavigate();
  const [challans, setChallans] = useState([]);
  const [dayFilter, setDayFilter] = useState("365");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("deliveryChallans")) || [];
    setChallans(stored);
  }, []);

  const filtered = challans.filter((c) => {
    if (statusFilter === "All") return true;
    return c.status === statusFilter;
  });

  // Calculate statistics
  const totalChallans = challans.length;
  const totalAmount = challans.reduce((sum, c) => sum + (Number(c.total) || 0), 0);
  const openChallans = challans.filter(c => c.status === "Open").length;
  const closedChallans = challans.filter(c => c.status === "Closed").length;

  // Export to CSV
  const handleExportReport = () => {
    if (challans.length === 0) {
      alert("No delivery challans to export");
      return;
    }

    const headers = ["Date", "Delivery Challan Number", "Party Name", "Amount", "Status"];
    const csvData = challans.map(c => [
      c.date,
      `DC-${c.number}`,
      c.party,
      c.total,
      c.status
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delivery_challans_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <div className="delivery-challan-page-header">
            <div className="delivery-challan-header-content">
              <div className="delivery-challan-title-section">
                <h2 className="delivery-challan-page-title">
                  <BsTruck className="delivery-challan-title-icon" /> Delivery Challan
                </h2>
                <p className="delivery-challan-page-subtitle">Track delivery challans and shipments</p>
              </div>
              <div className="delivery-challan-header-actions">
                <button className="delivery-challan-report-btn" onClick={handleExportReport}>
                  <BsDownload /> Export Report
                </button>
                <button
                  className="delivery-challan-create-btn"
                  onClick={() => navigate("/create-delivery-challan")}
                >
                  <BsPlus /> Create Delivery Challan
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="delivery-challan-summary-row">
            <div className="delivery-challan-summary-card total-challans">
              <div className="delivery-challan-card-icon-wrapper total-challans-icon">
                <BsTruck className="delivery-challan-card-icon" />
              </div>
              <div className="delivery-challan-card-content">
                <h4>Total Challans</h4>
                <p>{totalChallans}</p>
              </div>
            </div>

            <div className="delivery-challan-summary-card total-amount">
              <div className="delivery-challan-card-icon-wrapper total-amount-icon">
                <BsCashStack className="delivery-challan-card-icon" />
              </div>
              <div className="delivery-challan-card-content">
                <h4>Total Amount</h4>
                <p>₹ {totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="delivery-challan-summary-card open-challans">
              <div className="delivery-challan-card-icon-wrapper open-challans-icon">
                <BsXCircleFill className="delivery-challan-card-icon" />
              </div>
              <div className="delivery-challan-card-content">
                <h4>Open</h4>
                <p>{openChallans}</p>
              </div>
            </div>

            <div className="delivery-challan-summary-card closed-challans">
              <div className="delivery-challan-card-icon-wrapper closed-challans-icon">
                <BsCheckCircleFill className="delivery-challan-card-icon" />
              </div>
              <div className="delivery-challan-card-content">
                <h4>Closed</h4>
                <p>{closedChallans}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="delivery-challan-filters-container">
            <div className="delivery-challan-filters-left">
              <div className="delivery-challan-filter-group">
                <BsCalendar3 className="delivery-challan-filter-icon" />
                <select
                  className="delivery-challan-filter-select"
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                >
                  <option value="365">Last 365 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="7">Last 7 Days</option>
                </select>
              </div>

              <div className="delivery-challan-filter-group">
                <BsFilter className="delivery-challan-filter-icon" />
                <select
                  className="delivery-challan-status-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">Show All</option>
                  <option value="Open">Show Open Challans</option>
                  <option value="Closed">Show Closed Challans</option>
                </select>
              </div>
            </div>
          </div>

          {/* Delivery Challan Table */}
          <div className="delivery-challan-table-container">
            {filtered.length === 0 ? (
              <div className="delivery-challan-empty-state">
                <BsInboxFill className="delivery-challan-empty-icon" />
                <h3>No Delivery Challans Found</h3>
                <p>
                  {statusFilter !== "All"
                    ? `No ${statusFilter.toLowerCase()} challans matching the filter`
                    : "Start tracking delivery challans and shipments"}
                </p>
                <button
                  className="delivery-challan-empty-add-btn"
                  onClick={() => navigate("/create-delivery-challan")}
                >
                  <BsPlus /> Create Your First Delivery Challan
                </button>
              </div>
            ) : (
              <table className="delivery-challan-table">
                <thead>
                  <tr>
                    <th><BsCalendar3 /> Date</th>
                    <th>Delivery Challan Number</th>
                    <th><BsPeopleFill /> Party Name</th>
                    <th><BsCashStack /> Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={i}>
                      <td>{c.date}</td>
                      <td className="challan-number-cell">{`DC-${c.number}`}</td>
                      <td className="party-name-cell">
                        <BsPeopleFill className="party-icon" /> {c.party}
                      </td>
                      <td className="amount-cell">₹ {c.total}</td>
                      <td>
                        <span className={`delivery-challan-status-badge ${c.status === "Closed" ? "closed" : "open"}`}>
                          {c.status === "Closed" ? <BsCheckCircleFill /> : <BsXCircleFill />}
                          {c.status}
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

export default DeliveryChallan;
