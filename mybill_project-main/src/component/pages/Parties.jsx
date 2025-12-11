import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsPersonFill,
  BsPeopleFill,
  BsCashStack,
  BsPlus,
  BsSearch,
  BsFilter,
  BsDownload,
  BsShare,
  BsTelephoneFill,
  BsBuilding,
  BsPencilSquare,
  BsTrash
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../parties.css";

function Parties() {
  const [parties, setParties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("parties")) || [];
    setParties(stored);
  }, []);

  const handleAddParty = () => {
    navigate("/edit-party");
  };

  // Filter parties based on search and filter
  const filteredParties = parties.filter(party => {
    const matchesSearch = party.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.mobile?.includes(searchTerm);
    const matchesFilter = filterType === "All" || party.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Calculate totals
  const toCollect = parties.reduce((sum, p) => {
    return p.balanceType === "To Collect" ? sum + (parseFloat(p.balance) || 0) : sum;
  }, 0);

  const toPay = parties.reduce((sum, p) => {
    return p.balanceType === "To Pay" ? sum + (parseFloat(p.balance) || 0) : sum;
  }, 0);

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">

          {/* Modern Page Header */}
          <div className="parties-page-header">
            <div className="header-content">
              <div className="header-title-section">
                <h2 className="parties-page-title">
                  <BsPeopleFill className="title-icon" /> Parties
                </h2>
                <p className="parties-page-subtitle">Manage your customers and suppliers</p>
              </div>
              <div className="header-actions">
                <button className="header-action-btn share-btn" title="Share Party Portal">
                  <BsShare /> Share
                </button>
                <button className="header-action-btn report-btn" title="Download Reports">
                  <BsDownload /> Reports
                </button>
                <button className="add-party-btn" onClick={handleAddParty}>
                  <BsPlus className="btn-icon" /> Add Party
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="parties-summary-cards">
            <div className="parties-summary-box all-parties">
              <div className="summary-icon-wrapper">
                <BsPeopleFill className="summary-icon" />
              </div>
              <div className="summary-content">
                <h4>All Parties</h4>
                <p className="count">{parties.length}</p>
              </div>
            </div>
            <div className="parties-summary-box to-collect">
              <div className="summary-icon-wrapper">
                <BsCashStack className="summary-icon" />
              </div>
              <div className="summary-content">
                <h4>To Collect</h4>
                <p className="amount">₹ {toCollect.toFixed(2)}</p>
              </div>
            </div>
            <div className="parties-summary-box to-pay">
              <div className="summary-icon-wrapper">
                <BsCashStack className="summary-icon" />
              </div>
              <div className="summary-content">
                <h4>To Pay</h4>
                <p className="amount">₹ {toPay.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="parties-action-bar">
            <div className="search-box">
              <BsSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <BsFilter className="filter-icon" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Types</option>
                <option value="Customer">Customer</option>
                <option value="Supplier">Supplier</option>
              </select>
            </div>
          </div>

          {/* Parties Table */}
          <div className="parties-table-container">
            <table className="parties-table">
              <thead>
                <tr>
                  <th><BsPersonFill /> Party Name</th>
                  <th><BsBuilding /> Category</th>
                  <th><BsTelephoneFill /> Mobile Number</th>
                  <th>Party Type</th>
                  <th><BsCashStack /> Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParties.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <div className="empty-state-content">
                        <BsPeopleFill className="empty-icon" />
                        <h3>No parties found</h3>
                        <p>
                          {searchTerm || filterType !== "All"
                            ? "Try adjusting your search or filter"
                            : "Get started by adding your first party"}
                        </p>
                        {!searchTerm && filterType === "All" && (
                          <button className="empty-add-btn" onClick={handleAddParty}>
                            <BsPlus /> Add Your First Party
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredParties.map((p, i) => (
                    <tr key={i} className="table-row">
                      <td className="party-name">
                        <BsPersonFill className="row-icon" /> {p.partyName || p.name || "N/A"}
                      </td>
                      <td>{p.partyCategory || "-"}</td>
                      <td>{p.mobile || "-"}</td>
                      <td>
                        <span className={`type-badge ${p.partyType?.toLowerCase() || p.type?.toLowerCase()}`}>
                          {p.partyType || p.type || "N/A"}
                        </span>
                      </td>
                      <td className="balance-cell">
                        <span className={`balance ${p.balanceType === "To Collect" ? "positive" : "negative"}`}>
                          ₹ {p.openingBalance || p.balance || "0"}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button className="action-btn edit-btn" title="Edit Party">
                          <BsPencilSquare />
                        </button>
                        <button className="action-btn delete-btn" title="Delete Party">
                          <BsTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Parties;
