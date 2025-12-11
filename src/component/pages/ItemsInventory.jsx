import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";


function ItemsInventory() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("items")) || [];
    setItems(stored);
  }, []);

  const handleCreateItem = () => {
    const itemName = prompt("Enter Item Name:");
    if (!itemName) return;

    const newItem = {
      name: itemName,
      code: "-",
      qty: 0,
      selling: "-",
      purchase: "-",
    };

    const updated = [...items, newItem];
    setItems(updated);
    localStorage.setItem("items", JSON.stringify(updated));
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <div className="items-header">
            <h2>Items</h2>
            <div className="header-actions">
              <button className="report-btn">Reports</button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-row">
            <div className="summary-card">
              <h4>Stock Value</h4>
              <p>₹ 0</p>
            </div>
            <div className="summary-card">
              <h4>Low Stock</h4>
              <p>0</p>
            </div>
          </div>

          {/* Filters */}
          <div className="item-filters">
            <input type="text" placeholder="Search Item" />
            <select>
              <option>Select Categories</option>
            </select>
            <button className="low-stock-btn">Show Low Stock</button>
            <div className="filter-right">
              <button className="bulk-btn">Bulk Actions</button>
              <button className="create-btn" onClick={handleCreateItem}>
                Create Item
              </button>
            </div>
          </div>

          {/* Table */}
          <table className="item-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>Item Name</th>
                <th>Item Code</th>
                <th>Stock QTY</th>
                <th>Selling Price</th>
                <th>Purchase Price</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No items found.
                  </td>
                </tr>
              ) : (
                items.map((item, i) => (
                  <tr key={i}>
                    <td><input type="checkbox" /></td>
                    <td>{item.name}</td>
                    <td>{item.code}</td>
                    <td>{item.qty} PCS</td>
                    <td>{item.selling}</td>
                    <td>{item.purchase}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Upload Section */}
          <div className="upload-card">
            <div className="upload-info">
              <h4>Add Multiple Items at once</h4>
              <p>
                Bulk Upload Items from Product Library or Other Software like
                Vyapar, Tally, Marg & Busy
              </p>
              <div className="upload-buttons">
                <button className="import-btn">Import Items</button>
                <button className="library-btn">Product Library</button>
                <button className="excel-btn">Upload Excel</button>
              </div>
            </div>
            <div className="upload-img">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2921/2921222.png"
                alt="Upload Illustration"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ItemsInventory;
