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
  BsGeoAlt,
  BsPencilSquare,
  BsTrash
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { getAllCustomers, getCustomersByBusinessId, deleteCustomer } from "../../services/api";
import "../dashboard.css";
import "../parties.css";

function Parties() {
  const [parties, setParties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get businessId from localStorage
      const userBusinessId = localStorage.getItem("userBusinessId");

      let customersData;
      if (userBusinessId) {
        // Fetch customers for specific business
        console.log("Fetching customers for businessId:", userBusinessId);
        customersData = await getCustomersByBusinessId(userBusinessId);
      } else {
        // Fetch all customers if no businessId is found
        console.log("Fetching all customers");
        customersData = await getAllCustomers();
      }

      console.log("Fetched customers:", customersData);
      setParties(Array.isArray(customersData) ? customersData : []);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to load customers from server.");
      setParties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddParty = () => {
    navigate("/edit-party");
  };

  const handleEdit = (customerId) => {
    navigate(`/edit-party/${customerId}`);
  };

  const handleDelete = async (customerId, customerName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${customerName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await deleteCustomer(customerId);
      alert(`Customer "${customerName}" has been deleted successfully!`);
      // Refresh the customer list
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert(`Failed to delete customer: ${error.message || "Unknown error"}`);
    }
  };

  // Filter parties based on search and filter
  const filteredParties = parties.filter(party => {
    const matchesSearch = party.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.phone?.includes(searchTerm);
    const matchesFilter = filterType === "All" || party.customerType === filterType;
    return matchesSearch && matchesFilter;
  });

  // Calculate totals based on customer type
  const totalCustomers = parties.filter(p => p.customerType === "Customer").length;
  const totalSuppliers = parties.filter(p => p.customerType === "Supplier").length;
  const totalBoth = parties.filter(p => p.customerType === "Both").length;

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
                <BsPersonFill className="summary-icon" />
              </div>
              <div className="summary-content">
                <h4>Total Customers</h4>
                <p className="count">{totalCustomers}</p>
              </div>
            </div>
            <div className="parties-summary-box to-pay">
              <div className="summary-icon-wrapper">
                <BsBuilding className="summary-icon" />
              </div>
              <div className="summary-content">
                <h4>Total Suppliers</h4>
                <p className="count">{totalSuppliers}</p>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="parties-action-bar">
            <div className="search-box">
              <BsSearch className="search-icon" />
              <input
                type="text"
                placeholder="     Search by name or mobile..."
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
                  <th><BsGeoAlt /> City</th>
                  <th><BsTelephoneFill /> Phone Number</th>
                  <th>Customer Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <div className="empty-state-content">
                        <BsPeopleFill className="empty-icon" />
                        <h3>Loading customers...</h3>
                        <p>Please wait while we fetch the data</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <div className="empty-state-content">
                        <BsPeopleFill className="empty-icon" />
                        <h3>Error Loading Customers</h3>
                        <p>{error}</p>
                        <button className="empty-add-btn" onClick={fetchCustomers}>
                          <BsPlus /> Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredParties.length === 0 ? (
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
                        <BsPersonFill className="row-icon" /> {p.name || "N/A"}
                      </td>
                      <td>{p.city || "-"}</td>
                      <td>{p.phone || "-"}</td>
                      <td>
                        <span className={`type-badge ${p.customerType?.toLowerCase()}`}>
                          {p.customerType || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${p.status?.toLowerCase()}`}>
                          {p.status || "N/A"}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="action-btn edit-btn"
                          title="Edit Party"
                          onClick={() => handleEdit(p.id)}
                        >
                          <BsPencilSquare />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          title="Delete Party"
                          onClick={() => handleDelete(p.id, p.name)}
                        >
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
