import React, { useState, useEffect, useRef } from "react";
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
  BsX,
  BsFilePdfFill
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../itemInventory.css";
import { getProductStockSummary, createProduct, updateProduct, deleteProduct, downloadInventoryReport } from "../../services/api";

function ItemsInventory() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedItemHistory, setSelectedItemHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Categories for dropdown
  const categories = ["All", "Electronics", "Clothing", "Food", "Furniture", "Other"];

  useEffect(() => {
    fetchProducts();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProductStockSummary();
      console.log("Fetched product stock summary:", data);

      // Map backend DTO to frontend format
      const mappedData = Array.isArray(data) ? data.map(product => ({
        id: product.productId,
        name: product.productName,
        productName: product.productName,
        category: product.category || "Other",
        totalStock: product.totalStock || 0,
        currentStock: product.currentStock || 0,
        qty: product.currentStock || 0, // For backward compatibility
        totalSold: product.totalSold || 0,
        minLevel: 50, // Default minimum level
        lowStockThreshold: 50
      })) : [];

      setItems(mappedData);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to load products from backend. Make sure backend is running on http://localhost:8081");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

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
    const itemName = item.name || item.productName || "";
    const itemCode = item.code || item.productCode || "";
    const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

    const currentStock = item.currentStock !== undefined ? item.currentStock : item.qty || 0;
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

  // Download PDF Report
  const handleDownloadPDF = async () => {
    try {
      const userBusinessId = localStorage.getItem("userBusinessId");

      if (!userBusinessId) {
        alert("Business ID not found. Please ensure you are logged in and have a business profile.");
        return;
      }

      if (items.length === 0) {
        alert("No items to export");
        return;
      }

      console.log("Downloading inventory report for businessId:", userBusinessId);

      // Call the API to get the PDF blob
      const blob = await downloadInventoryReport(userBusinessId);

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert("PDF report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert(`Failed to download PDF: ${error.message || "Unknown error"}`);
    } finally {
      setShowExportDropdown(false);
    }
  };

  // Download CSV Report
  const handleDownloadCSV = async () => {
    if (items.length === 0) {
      alert("No items to export");
      return;
    }

    try {
      // Get business details from localStorage
      const userBusinessId = localStorage.getItem("userBusinessId");
      const businessData = JSON.parse(localStorage.getItem("businessData") || "{}");

      // Calculate summary statistics
      const totalItems = items.length;
      const totalCurrentStock = items.reduce((sum, item) => {
        const currentStock = item.currentStock !== undefined ? item.currentStock : item.qty || 0;
        return sum + currentStock;
      }, 0);
      const lowStockCount = items.filter(item => {
        const currentStock = item.currentStock !== undefined ? item.currentStock : item.qty;
        const minLevel = item.minLevel || item.lowStockThreshold || 50;
        return currentStock <= minLevel;
      }).length;

      // Get current date
      const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // Build CSV content with professional header
      let csvContent = "";

      // Business Details Section
      if (businessData.businessName) {
        csvContent += "BUSINESS DETAILS\n";
        csvContent += `Business Name:,${businessData.businessName || ""}\n`;
        csvContent += `Phone:,${businessData.phoneNo || ""}\n`;
        csvContent += `Email:,${businessData.email || ""}\n`;
        csvContent += `GSTIN:,${businessData.gstNo || "Not Registered"}\n`;

        // Format address
        const addressParts = [
          businessData.address,
          businessData.city,
          businessData.state,
          businessData.pincode
        ].filter(part => part);
        const address = addressParts.join(", ");
        csvContent += `Address:,"${address}"\n`;
        csvContent += "\n";
      }

      // Report Title and Date
      csvContent += "INVENTORY REPORT\n";
      csvContent += "\n";
      csvContent += `Report Date:,${currentDate}\n`;
      csvContent += "\n";

      // Summary Section
      csvContent += "SUMMARY\n";
      csvContent += `Total Items:,${totalItems}\n`;
      csvContent += `Total Current Stock:,${totalCurrentStock} PCS\n`;
      csvContent += `Total Low Stock Items:,${lowStockCount}\n`;
      csvContent += "\n";
      csvContent += "\n";

      // Data Table Header
      const headers = ["Product ID", "Product Name", "Category", "Total Stock", "Current Stock", "Total Sold", "Status"];
      csvContent += headers.join(",") + "\n";

      // Data rows
      const csvData = items.map(item => {
        const status = getStockStatus(item);
        return [
          item.id,
          `"${item.name || item.productName || ""}"`,
          item.category || "-",
          item.totalStock || item.qty || 0,
          item.currentStock !== undefined ? item.currentStock : item.qty || 0,
          item.totalSold || 0,
          status.label
        ];
      });

      csvContent += csvData.map(row => row.join(",")).join("\n");

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setShowExportDropdown(false);
      alert("CSV report downloaded successfully!");
    } catch (error) {
      console.error("Error generating CSV:", error);
      alert("Failed to generate CSV report. Please try again.");
      setShowExportDropdown(false);
    }
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
                <div className="reports-dropdown-wrapper" ref={dropdownRef}>
                  <button
                    className="inventory-report-btn"
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                  >
                    <BsDownload /> Export
                  </button>
                  {showExportDropdown && (
                    <div className="reports-dropdown-menu">
                      <button
                        className="dropdown-item"
                        onClick={handleDownloadPDF}
                      >
                        <BsFilePdfFill /> Download as PDF
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={handleDownloadCSV}
                      >
                        <BsFileEarmarkSpreadsheet /> Download as CSV
                      </button>
                    </div>
                  )}
                </div>
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
                <h4>Total Current Stock</h4>
                <p>{items.reduce((sum, item) => {
                  const currentStock = item.currentStock !== undefined ? item.currentStock : item.qty || 0;
                  return sum + currentStock;
                }, 0)} PCS</p>
              </div>
            </div>

            <div className="inventory-summary-card low-stock">
              <div className="inventory-card-icon-wrapper low-stock-icon">
                <BsExclamationTriangle className="inventory-card-icon" />
              </div>
              <div className="inventory-card-content">
                <h4>Total Low Stock Items</h4>
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
                {loading ? (
                  <tr>
                    <td colSpan="9" className="inventory-empty-state">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p style={{ marginTop: '10px' }}>Loading products...</p>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
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
                          <BsBoxSeam className="item-row-icon" /> {item.name || item.productName || '-'}
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
                            <BsClockHistory /> View History
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
              <table className="stock-history-table">
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Transaction Type</th>
                    <th>Total Stock</th>
                    <th>Total Buy</th>
                    <th>Total Sell</th>
                    <th>Remaining Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItemHistory.history.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                        <BsClockHistory style={{ fontSize: '2rem', marginBottom: '10px' }} />
                        <p style={{ margin: '10px 0 0 0' }}>No transactions found</p>
                      </td>
                    </tr>
                  ) : (
                    selectedItemHistory.history.map((transaction, index) => {
                      const transDate = new Date(transaction.date);
                      const totalBuy = selectedItemHistory.history
                        .slice(0, index + 1)
                        .filter(t => t.type === 'purchase')
                        .reduce((sum, t) => sum + t.quantity, 0);
                      const totalSell = selectedItemHistory.history
                        .slice(0, index + 1)
                        .filter(t => t.type === 'sale')
                        .reduce((sum, t) => sum + t.quantity, 0);
                      const totalStock = selectedItemHistory.item.totalStock || 0;

                      return (
                        <tr key={transaction.id}>
                          <td style={{ textAlign: 'center' }}>{index + 1}</td>
                          <td>{transDate.toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}</td>
                          <td>{transDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}</td>
                          <td>
                            <span className={`transaction-type-badge ${transaction.type}`}>
                              {transaction.type === 'purchase' ? 'Purchase' : 'Sell'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: '500' }}>{totalStock} PCS</td>
                          <td className="quantity-cell purchase" style={{ textAlign: 'center' }}>
                            {totalBuy} PCS
                          </td>
                          <td className="quantity-cell sale" style={{ textAlign: 'center' }}>
                            {totalSell} PCS
                          </td>
                          <td className="balance-cell" style={{ textAlign: 'center', fontWeight: 'bold' }}>
                            {transaction.balance} PCS
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div >
        </div >
      )
      }
    </>
  );
}

export default ItemsInventory;
