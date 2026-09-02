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
import PortalLayout from "../PortalLayout";
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

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productName: "",
    category: "General",
    sellingPrice: "",
    purchasePrice: "",
    totalStock: "",
    minStockLevel: "10",
    taxRate: "18",
    unit: "PCS",
    productCode: ""
  });

  // Categories for dropdown
  const categories = ["All", "Electronics", "Clothing", "Food", "Fertilizer", "Furniture", "Other"];

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
    setNewProduct({
      productName: "",
      category: "General",
      sellingPrice: "",
      purchasePrice: "",
      totalStock: "",
      minStockLevel: "10",
      taxRate: "18",
      unit: "PCS",
      productCode: ""
    });
    setShowAddModal(true);
  };

  const handleSaveNewProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.productName.trim()) {
      alert("Product name is required.");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        productName: newProduct.productName.trim(),
        category: newProduct.category || "General",
        sellingPrice: parseFloat(newProduct.sellingPrice) || 0,
        purchasePrice: parseFloat(newProduct.purchasePrice) || 0,
        totalStock: parseInt(newProduct.totalStock) || 0,
        remainingStock: parseInt(newProduct.totalStock) || 0,
        minStockLevel: parseInt(newProduct.minStockLevel) || 10,
        taxRate: parseFloat(newProduct.taxRate) || 0,
        unit: newProduct.unit || "PCS",
        productCode: newProduct.productCode || `SKU-${Date.now().toString().slice(-6)}`
      };
      await createProduct(payload);
      setShowAddModal(false);
      await fetchProducts();
    } catch (err) {
      console.error("Error creating product:", err);
      alert(`Failed to save product: ${err?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete product "${name || id}"?\nThis cannot be undone.`)) {
      try {
        setLoading(true);
        await deleteProduct(id);
        await fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        alert(`Failed to delete product: ${err?.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
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
    <PortalLayout title="Items & Inventory Stock">
      <div className="inventory-page-container animate-fade-in">

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
                            <BsClockHistory /> History
                          </button>
                          <button
                            className="inventory-action-btn delete-btn text-danger ms-1"
                            title="Delete Product"
                            style={{ border: '1px solid #fee2e2', background: '#fff1f2', color: '#e11d48', padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem' }}
                            onClick={() => handleDeleteItem(item.id, item.name)}
                          >
                            <BsTrash /> Delete
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
          </div>
        </div>
      )}
      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header bg-primary text-white rounded-top-4">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <BsBoxSeam /> Add New Inventory Product
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleSaveNewProduct}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Product / Item Name *</label>
                      <input 
                        type="text" 
                        className="form-control rounded-3" 
                        placeholder="e.g. Urea 46-0-0 50kg or Cotton Shirt XL" 
                        required
                        value={newProduct.productName} 
                        onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Category</label>
                      <select 
                        className="form-select rounded-3"
                        value={newProduct.category} 
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      >
                        <option value="General">General</option>
                        <option value="Fertilizer">Fertilizer</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Food">Food</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Selling Price (₹)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="form-control rounded-3" 
                        placeholder="0.00" 
                        value={newProduct.sellingPrice} 
                        onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Purchase Price (₹)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="form-control rounded-3" 
                        placeholder="0.00" 
                        value={newProduct.purchasePrice} 
                        onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Tax Rate (GST %)</label>
                      <select 
                        className="form-select rounded-3"
                        value={newProduct.taxRate} 
                        onChange={(e) => setNewProduct({ ...newProduct, taxRate: e.target.value })}
                      >
                        <option value="0">0% (Nil / Exempt)</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18% (Standard)</option>
                        <option value="28">28%</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Initial Stock Quantity</label>
                      <input 
                        type="number" 
                        className="form-control rounded-3" 
                        placeholder="0" 
                        value={newProduct.totalStock} 
                        onChange={(e) => setNewProduct({ ...newProduct, totalStock: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Unit of Measurement</label>
                      <select 
                        className="form-select rounded-3"
                        value={newProduct.unit} 
                        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                      >
                        <option value="PCS">PCS (Pieces)</option>
                        <option value="BAG">BAG (Bags)</option>
                        <option value="KG">KG (Kilograms)</option>
                        <option value="MTR">MTR (Meters)</option>
                        <option value="BOX">BOX (Boxes)</option>
                        <option value="LTR">LTR (Liters)</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Min Stock Alert Level</label>
                      <input 
                        type="number" 
                        className="form-control rounded-3" 
                        placeholder="10" 
                        value={newProduct.minStockLevel} 
                        onChange={(e) => setNewProduct({ ...newProduct, minStockLevel: e.target.value })}
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Product Code / SKU (Optional)</label>
                      <input 
                        type="text" 
                        className="form-control rounded-3" 
                        placeholder="Leave blank to auto-generate" 
                        value={newProduct.productCode} 
                        onChange={(e) => setNewProduct({ ...newProduct, productCode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-secondary rounded-3" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-3 px-4 fw-bold" disabled={loading}>
                    {loading ? "Saving..." : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

export default ItemsInventory;
