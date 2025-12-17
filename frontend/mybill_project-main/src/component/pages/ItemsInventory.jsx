import React, { useState, useEffect } from "react";
import {
  BsBoxSeam,
  BsCashStack,
  BsExclamationTriangle,
  BsSearch,
  BsFilter,
  BsPlus,
  BsDownload,
  BsUpload,
  BsFileEarmarkSpreadsheet,
   BsGrid3X3GapFill,
  BsPencilSquare,
  BsTrash
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../itemInventory.css";

function ItemsInventory() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Categories for dropdown
  const categories = ["All", "Electronics", "Clothing", "Food", "Furniture", "Other"];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("items")) || [];
    setItems(stored);
  }, []);

  const handleCreateItem = () => {
    const itemName = prompt("Enter Item Name:");
    if (!itemName) return;

    const itemCode = prompt("Enter Item Code (optional):");
    const qty = parseInt(prompt("Enter Stock Quantity:") || "0");
    const selling = parseFloat(prompt("Enter Selling Price:") || "0");
    const purchase = parseFloat(prompt("Enter Purchase Price:") || "0");
    const category = prompt("Enter Category (Electronics/Clothing/Food/Furniture/Other):") || "Other";

    const newItem = {
      id: Date.now(),
      name: itemName,
      code: itemCode || "-",
      qty: qty,
      selling: selling,
      purchase: purchase,
      category: category,
      lowStockThreshold: 10
    };

    const updated = [...items, newItem];
    setItems(updated);
    localStorage.setItem("items", JSON.stringify(updated));
  };

  const handleDeleteItem = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const updated = items.filter(item => item.id !== id);
      setItems(updated);
      localStorage.setItem("items", JSON.stringify(updated));
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {
      alert("Please select items to delete");
      return;
    }
    if (window.confirm(`Delete ${selectedItems.length} selected items?`)) {
      const updated = items.filter(item => !selectedItems.includes(item.id));
      setItems(updated);
      localStorage.setItem("items", JSON.stringify(updated));
      setSelectedItems([]);
    }
  };

  // Filter items based on search, category, and low stock
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesLowStock = !showLowStock || item.qty < (item.lowStockThreshold || 10);

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Calculate statistics
  const totalStockValue = items.reduce((sum, item) => {
  const qty = Number(item.qty) || 0;
  const purchase = Number(item.purchase) || 0;

  return sum + qty * purchase;
}, 0);

  const lowStockCount = items.filter(item => item.qty < (item.lowStockThreshold || 10)).length;
  const totalItems = items.length;

  // Export to CSV
  const handleExportReport = () => {
    if (items.length === 0) {
      alert("No items to export");
      return;
    }

    const headers = ["Item Name", "Item Code", "Category", "Stock QTY", "Selling Price", "Purchase Price", "Stock Value"];
    const csvData = items.map(item => [
      item.name,
      item.code,
      item.category || "-",
      item.qty,
      item.selling,
      item.purchase,
      (item.qty * item.purchase).toFixed(2)
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_report_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <div className="inventory-page-header">
            <div className="inventory-header-content">
              <div className="inventory-title-section">
                <h2 className="inventory-page-title">
                  <BsBoxSeam className="inventory-title-icon" /> Items Inventory
                </h2>
                <p className="inventory-page-subtitle">Manage your product stock and inventory</p>
              </div>
              <div className="inventory-header-actions">
                <button className="inventory-report-btn" onClick={handleExportReport}>
                  <BsDownload /> Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="inventory-summary-row">
            <div className="inventory-summary-card total-items">
              <div className="inventory-card-icon-wrapper total-items-icon">
                <BsBoxSeam className="inventory-card-icon" />
              </div>
              <div className="inventory-card-content">
                <h4>Total Items</h4>
                <p>{totalItems}</p>
              </div>
            </div>

            <div className="inventory-summary-card stock-value">
              <div className="inventory-card-icon-wrapper stock-value-icon">
                <BsCashStack className="inventory-card-icon" />
              </div>
              <div className="inventory-card-content">
                <h4>Stock Value</h4>
                <p>₹ {totalStockValue.toFixed(2)}</p>
              </div>
            </div>

            <div className="inventory-summary-card low-stock">
              <div className="inventory-card-icon-wrapper low-stock-icon">
                <BsExclamationTriangle className="inventory-card-icon" />
              </div>
              <div className="inventory-card-content">
                <h4>Low Stock Items</h4>
                <p>{lowStockCount}</p>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="inventory-filters-container">
            <div className="inventory-filters-left">
              <div className="inventory-search-box">
                <BsSearch className="inventory-search-icon" />
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="inventory-search-input"
                />
              </div>

              <div className="inventory-filter-group">
                <BsFilter className="inventory-filter-icon" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="inventory-filter-select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button
                className={`inventory-low-stock-btn ${showLowStock ? 'active' : ''}`}
                onClick={() => setShowLowStock(!showLowStock)}
              >
                <BsExclamationTriangle /> {showLowStock ? "Show All" : "Low Stock Only"}
              </button>
            </div>

            <div className="inventory-filters-right">
              {selectedItems.length > 0 && (
                <button className="inventory-bulk-delete-btn" onClick={handleBulkDelete}>
                  <BsTrash /> Delete ({selectedItems.length})
                </button>
              )}
              <button className="inventory-create-btn" onClick={handleCreateItem}>
                <BsPlus /> Create Item
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="inventory-table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    />
                  </th>
                  <th>Item Name</th>
                  <th>Item Code</th>
                  <th>Category</th>
                  <th>Stock QTY</th>
                  <th>Selling Price</th>
                  <th>Purchase Price</th>
                  <th>Stock Value</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="inventory-empty-state">
                      <BsBoxSeam className="inventory-empty-icon" />
                      <h3>No items found</h3>
                      <p>
                        {searchTerm || selectedCategory !== "All" || showLowStock
                          ? "Try adjusting your filters"
                          : "Get started by creating your first item"}
                      </p>
                      {!searchTerm && selectedCategory === "All" && !showLowStock && (
                        <button className="inventory-empty-add-btn" onClick={handleCreateItem}>
                          <BsPlus /> Create Your First Item
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className={item.qty < (item.lowStockThreshold || 10) ? 'low-stock-row' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                        />
                      </td>
                      <td className="item-name-cell">
                        <BsBoxSeam className="item-row-icon" /> {item.name}
                      </td>
                      <td>{item.code}</td>
                      <td>
                        <span className="category-badge">{item.category || "-"}</span>
                      </td>
                      <td className={item.qty < (item.lowStockThreshold || 10) ? 'low-stock-qty' : 'stock-qty'}>
                        {item.qty} PCS
                      </td>
                      <td className="price-cell">₹{item.selling}</td>
                      <td className="price-cell">₹{item.purchase}</td>
                      <td className="value-cell">
                        ₹{( (Number(item.qty) || 0) * (Number(item.purchase) || 0) ).toFixed(2)}
                      </td>
                      <td className="actions-cell">
                        <button className="inventory-action-btn edit-btn" title="Edit Item">
                          <BsPencilSquare />
                        </button>
                        <button
                          className="inventory-action-btn delete-btn"
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete Item"
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

          {/* Upload Section */}
          <div className="inventory-upload-section">
            <div className="inventory-upload-content">
              <div className="inventory-upload-info">
                <h4><BsUpload /> Add Multiple Items at Once</h4>
                <p>
                  Bulk upload items from Product Library or import from other software like
                  Vyapar, Tally, Marg & Busy
                </p>
                <div className="inventory-upload-buttons">
                  <button className="inventory-import-btn">
                    <BsDownload /> Import Items
                  </button>
                  <button className="inventory-library-btn">
                    < BsGrid3X3GapFill /> Product Library
                  </button>
                  <button className="inventory-excel-btn">
                    <BsFileEarmarkSpreadsheet /> Upload Excel
                  </button>
                </div>
              </div>
              <div className="inventory-upload-illustration">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2921/2921222.png"
                  alt="Upload Illustration"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ItemsInventory;
