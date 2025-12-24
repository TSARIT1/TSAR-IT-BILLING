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
  BsTrash,
  BsClockHistory,
  BsX
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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedItemHistory, setSelectedItemHistory] = useState(null);

  // Categories for dropdown
  const categories = ["All", "Electronics", "Clothing", "Food", "Furniture", "Other"];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("items")) || [];
    setItems(stored);
  }, []);

  // Get stock history for an item
  const getStockHistory = (itemId) => {
    const history = JSON.parse(localStorage.getItem(`stockHistory_${itemId}`)) || [];
    return history;
  };

  // Add stock transaction
  const addStockTransaction = (itemId, type, quantity, date = new Date()) => {
    const history = getStockHistory(itemId);
    const item = items.find(i => i.id === itemId);

    if (!item) return;

    const currentBalance = item.currentStock || item.qty || 0;
    const newBalance = type === 'purchase' ? currentBalance + quantity : currentBalance - quantity;

    const transaction = {
      id: Date.now(),
      date: date.toISOString(),
      type: type, // 'purchase' or 'sale'
      quantity: quantity,
      balance: newBalance
    };

    history.push(transaction);
    localStorage.setItem(`stockHistory_${itemId}`, JSON.stringify(history));

    // Update item's current stock
    const updatedItems = items.map(i => {
      if (i.id === itemId) {
        return {
          ...i,
          currentStock: newBalance,
          totalSold: type === 'sale' ? (i.totalSold || 0) + quantity : (i.totalSold || 0)
        };
      }
      return i;
    });

    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
  };

  // Get stock status based on rules
  const getStockStatus = (item) => {
    const currentStock = item.currentStock !== undefined ? item.currentStock : item.qty;
    const minLevel = item.minLevel || 50;
    const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
    const today = new Date();

    // Check expiry first
    if (expiryDate && today > expiryDate) {
      return { label: "Expired", className: "status-expired" };
    }

    // Check stock levels
    if (currentStock === 0) {
      return { label: "Out of Stock", className: "status-out-of-stock" };
    } else if (currentStock <= minLevel) {
      return { label: "Low Stock", className: "status-low-stock" };
    } else {
      return { label: "In Stock", className: "status-in-stock" };
    }
  };

  const handleCreateItem = () => {
    const itemName = prompt("Enter Item Name:");
    if (!itemName) return;

    const itemCode = prompt("Enter Item Code (optional):");
    const totalStock = parseInt(prompt("Enter Total Stock:") || "0");
    const currentStock = parseInt(prompt("Enter Current Stock:") || totalStock);
    const category = prompt("Enter Category (Electronics/Clothing/Food/Furniture/Other):") || "Other";
    const minLevel = parseInt(prompt("Enter Minimum Stock Level (default 50):") || "50");

    const newItem = {
      id: Date.now(),
      name: itemName,
      code: itemCode || "-",
      category: category,
      totalStock: totalStock,
      currentStock: currentStock,
      totalSold: totalStock - currentStock,
      minLevel: minLevel,
      qty: currentStock, // For backward compatibility
      lowStockThreshold: minLevel
    };

    const updated = [...items, newItem];
    setItems(updated);
    localStorage.setItem("items", JSON.stringify(updated));

    // Initialize stock history with initial stock
    if (totalStock > 0) {
      const initialHistory = [{
        id: Date.now(),
        date: new Date().toISOString(),
        type: 'purchase',
        quantity: totalStock,
        balance: currentStock
      }];
      localStorage.setItem(`stockHistory_${newItem.id}`, JSON.stringify(initialHistory));
    }
  };

  const handleDeleteItem = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const updated = items.filter(item => item.id !== id);
      setItems(updated);
      localStorage.setItem("items", JSON.stringify(updated));
      localStorage.removeItem(`stockHistory_${id}`);
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
      selectedItems.forEach(id => localStorage.removeItem(`stockHistory_${id}`));
      setSelectedItems([]);
    }
  };

  const handleViewHistory = (item) => {
    const history = getStockHistory(item.id);
    setSelectedItemHistory({ item, history });
    setShowHistoryModal(true);
  };

  // Filter items based on search, category, and low stock
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

    const currentStock = item.currentStock !== undefined ? item.currentStock : item.qty;
    const minLevel = item.minLevel || item.lowStockThreshold || 50;
    const matchesLowStock = !showLowStock || currentStock <= minLevel;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Calculate statistics
  const totalStockValue = items.reduce((sum, item) => {
    const currentStock = item.currentStock !== undefined ? item.currentStock : item.qty || 0;
    const purchase = Number(item.purchase) || 0;
    return sum + currentStock * purchase;
  }, 0);

  const lowStockCount = items.filter(item => {
    const currentStock = item.currentStock !== undefined ? item.currentStock : item.qty;
    const minLevel = item.minLevel || item.lowStockThreshold || 50;
    return currentStock <= minLevel;
  }).length;

  const totalItems = items.length;

  // Export to CSV
  const handleExportReport = () => {
    if (items.length === 0) {
      alert("No items to export");
      return;
    }

    const headers = ["Product ID", "Product Name", "Category", "Total Stock", "Current Stock", "Total Sold", "Status"];
    const csvData = items.map(item => {
      const status = getStockStatus(item);
      return [
        item.id,
        item.name,
        item.category || "-",
        item.totalStock || item.qty || 0,
        item.currentStock !== undefined ? item.currentStock : item.qty || 0,
        item.totalSold || 0,
        status.label
      ];
    });

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
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Total Stock</th>
                  <th>Current Stock</th>
                  <th>Total Sold</th>
                  <th>Status</th>
                  <th style={{ width: '150px' }}>Actions</th>
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
                  filteredItems.map((item) => {
                    const status = getStockStatus(item);
                    const currentStock = item.currentStock !== undefined ? item.currentStock : item.qty || 0;
                    const totalStock = item.totalStock || item.qty || 0;
                    const totalSold = item.totalSold || 0;

                    return (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                          />
                        </td>
                        <td className="product-id-cell">#{item.id}</td>
                        <td className="item-name-cell">
                          <BsBoxSeam className="item-row-icon" /> {item.name}
                        </td>
                        <td>
                          <span className="category-badge">{item.category || "-"}</span>
                        </td>
                        <td className="stock-qty">{totalStock} PCS</td>
                        <td className="stock-qty">{currentStock} PCS</td>
                        <td className="stock-qty">{totalSold} PCS</td>
                        <td>
                          <span className={`status-badge ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button
                            className="inventory-action-btn history-btn"
                            title="Stock History"
                            onClick={() => handleViewHistory(item)}
                          >
                            <BsClockHistory />
                          </button>
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
                    );
                  })
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
                    <BsGrid3X3GapFill /> Product Library
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

      {/* Stock History Modal */}
      {showHistoryModal && selectedItemHistory && (
        <div className="stock-history-modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="stock-history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="stock-history-modal-header">
              <h3>
                <BsClockHistory /> Stock History - {selectedItemHistory.item.name}
              </h3>
              <button
                className="stock-history-close-btn"
                onClick={() => setShowHistoryModal(false)}
              >
                <BsX />
              </button>
            </div>
            <div className="stock-history-modal-body">
              {selectedItemHistory.history.length === 0 ? (
                <div className="stock-history-empty">
                  <BsClockHistory className="empty-icon" />
                  <p>No transaction history available</p>
                </div>
              ) : (
                <table className="stock-history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItemHistory.history.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{new Date(transaction.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</td>
                        <td>
                          <span className={`transaction-type-badge ${transaction.type}`}>
                            {transaction.type === 'purchase' ? 'Purchase' : 'Sale'}
                          </span>
                        </td>
                        <td className={`quantity-cell ${transaction.type}`}>
                          {transaction.type === 'purchase' ? '+' : '-'}{transaction.quantity} PCS
                        </td>
                        <td className="balance-cell">{transaction.balance} PCS</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ItemsInventory;
