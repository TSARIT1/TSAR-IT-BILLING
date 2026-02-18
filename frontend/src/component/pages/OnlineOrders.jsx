import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../onlineOrders.css";
import { FiSearch, FiShoppingCart, FiTrendingUp, FiPackage, FiPlus, FiX, FiEye, FiTrash2, FiEdit } from "react-icons/fi";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  getAllProducts,
  createOnlineOrder,
  getOnlineOrders,
  getOnlineOrderItems,
  updateOnlineOrderStatus,
  deleteOnlineOrder,
  createOnlineStore,
  getOnlineStores,
  getOnlineStoreProducts,
  deleteOnlineStore
} from "../../services/api";

function OnlineOrders() {
  const navigate = useNavigate();

  // ─── Orders State ────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("Today");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(false);
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  // ─── Products State ──────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // ─── Create Order Modal ──────────────────────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    paymentMode: "CASH",
    termsAndConditions: "",
    notes: "",
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // ─── View Items Modal ────────────────────────────────────────────────────────
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [viewItems, setViewItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // ─── Online Store State ───────────────────────────────────────────────────────
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [stores, setStores] = useState([]);
  const [storeForm, setStoreForm] = useState({ storeName: "" });
  const [categoryInput, setCategoryInput] = useState("");
  const [categoryTags, setCategoryTags] = useState([]);
  const [storeProductSearch, setStoreProductSearch] = useState("");
  const [showStoreProductDropdown, setShowStoreProductDropdown] = useState(false);
  const [selectedStoreProducts, setSelectedStoreProducts] = useState([]);
  const [submittingStore, setSubmittingStore] = useState(false);
  const [viewingStore, setViewingStore] = useState(null);
  const [viewStoreProducts, setViewStoreProducts] = useState([]);

  // ─── On Mount ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchStores();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOnlineOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching online orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  };

  const fetchStores = async () => {
    try {
      const data = await getOnlineStores();
      setStores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching stores:", err);
      setStores([]);
    }
  };

  const handleAddCategoryTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && categoryInput.trim()) {
      e.preventDefault();
      if (!categoryTags.includes(categoryInput.trim())) {
        setCategoryTags(prev => [...prev, categoryInput.trim()]);
      }
      setCategoryInput("");
    }
  };

  const handleRemoveCategoryTag = (tag) => {
    setCategoryTags(prev => prev.filter(t => t !== tag));
  };

  const filteredStoreProducts = products.filter(p =>
    (p.productName || "").toLowerCase().includes(storeProductSearch.toLowerCase()) ||
    (p.productCode || "").toLowerCase().includes(storeProductSearch.toLowerCase())
  );

  const handleSelectStoreProduct = (product) => {
    if (selectedStoreProducts.find(p => p.productId === product.productId)) {
      setShowStoreProductDropdown(false);
      setStoreProductSearch("");
      return;
    }
    setSelectedStoreProducts(prev => [...prev, {
      productId: product.productId,
      productName: product.productName,
      productCode: product.productCode,
      totalStock: product.totalStock || product.remainingStock || 0,
    }]);
    setShowStoreProductDropdown(false);
    setStoreProductSearch("");
  };

  const handleRemoveStoreProduct = (productId) => {
    setSelectedStoreProducts(prev => prev.filter(p => p.productId !== productId));
  };

  const resetStoreModal = () => {
    setStoreForm({ storeName: "" });
    setCategoryTags([]);
    setCategoryInput("");
    setSelectedStoreProducts([]);
    setStoreProductSearch("");
  };

  const handleSubmitStore = async () => {
    if (!storeForm.storeName.trim()) { alert("Please enter a store name."); return; }
    if (selectedStoreProducts.length === 0) { alert("Please add at least one product."); return; }
    setSubmittingStore(true);
    try {
      await createOnlineStore({
        storeName: storeForm.storeName,
        categories: categoryTags.join(","),
        products: selectedStoreProducts,
      });
      alert("Online store created successfully!");
      setShowStoreModal(false);
      resetStoreModal();
      fetchStores();
    } catch (err) {
      console.error("Error creating store:", err);
      alert("Failed to create store.");
    } finally {
      setSubmittingStore(false);
    }
  };

  const handleDeleteStore = async (storeId) => {
    if (!window.confirm("Delete this store?")) return;
    try {
      await deleteOnlineStore(storeId);
      if (viewingStore && viewingStore.id === storeId) { setViewingStore(null); setViewStoreProducts([]); }
      fetchStores();
    } catch (err) { alert("Failed to delete store."); }
  };

  const handleViewStoreProducts = async (store) => {
    if (viewingStore && viewingStore.id === store.id) { setViewingStore(null); setViewStoreProducts([]); return; }
    setViewingStore(store);
    try {
      const data = await getOnlineStoreProducts(store.id);
      setViewStoreProducts(Array.isArray(data) ? data : []);
    } catch (err) { setViewStoreProducts([]); }
  };

  // ─── Summary Stats ───────────────────────────────────────────────────────────
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === "COMPLETED").length;
  const pendingOrders = orders.filter(o => o.status === "PENDING" || o.status === "PROCESSING").length;
  const totalRevenue = orders
    .filter(o => o.status === "COMPLETED")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // ─── Filtering ────────────────────────────────────────────────────────────────
  const filteredOrders = orders.filter(order => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (order.customerName || "").toLowerCase().includes(q) ||
      (order.orderNumber || "").toLowerCase().includes(q) ||
      (order.id || "").toLowerCase().includes(q);

    const matchStatus =
      statusFilter === "All Status" || order.status === statusFilter.toUpperCase();

    let matchDate = true;
    if (order.orderDate) {
      const orderDate = new Date(order.orderDate);
      const now = new Date();
      const cutoff = (days) => { const d = new Date(now); d.setDate(d.getDate() - days); return d; };
      if (dateFilter === "Today") {
        matchDate = orderDate.toDateString() === now.toDateString();
      } else if (dateFilter === "Last 7 Days") {
        matchDate = orderDate >= cutoff(7);
      } else if (dateFilter === "Last 30 Days") {
        matchDate = orderDate >= cutoff(30);
      } else if (dateFilter === "Last 3 Months") {
        matchDate = orderDate >= cutoff(90);
      } else if (dateFilter === "Last 6 Months") {
        matchDate = orderDate >= cutoff(180);
      } else if (dateFilter === "Last 365 Days") {
        matchDate = orderDate >= cutoff(365);
      } else if (dateFilter === "This Month") {
        matchDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === "This Year") {
        matchDate = orderDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === "Custom Range") {
        if (customDateFrom) matchDate = matchDate && orderDate >= new Date(customDateFrom);
        if (customDateTo) {
          const toDate = new Date(customDateTo);
          toDate.setHours(23, 59, 59, 999);
          matchDate = matchDate && orderDate <= toDate;
        }
      }
    }

    return matchSearch && matchStatus && matchDate;
  });

  // ─── Product Selection ───────────────────────────────────────────────────────
  const filteredProducts = products.filter(p =>
    (p.productName || "").toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.productCode || "").toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSelectProduct = (product) => {
    const alreadyAdded = selectedItems.find(i => i.productId === product.productId);
    if (alreadyAdded) {
      alert("Product already added. Change quantity in the table below.");
      setShowProductDropdown(false);
      setProductSearch("");
      return;
    }
    const newItem = {
      productId: product.productId,
      productName: product.productName,
      productCode: product.productCode,
      quantity: 1,
      sellingPrice: product.sellingPrice || 0,
      expiryDate: product.expiryDate || "",
      taxRate: product.taxRate || 0,
      discount: product.discount || 0,
    };
    setSelectedItems(prev => [...prev, newItem]);
    setShowProductDropdown(false);
    setProductSearch("");
  };

  const handleItemChange = (index, field, value) => {
    setSelectedItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const calcItemTotal = (item) => {
    const base = (item.quantity || 0) * (item.sellingPrice || 0);
    const tax = base * (item.taxRate || 0) / 100;
    const disc = base * (item.discount || 0) / 100;
    return base + tax - disc;
  };

  const orderTotal = selectedItems.reduce((sum, item) => sum + calcItemTotal(item), 0);

  // ─── Submit Order ─────────────────────────────────────────────────────────────
  const handleSubmitOrder = async () => {
    if (!orderForm.customerName.trim()) {
      alert("Please enter customer name.");
      return;
    }
    if (selectedItems.length === 0) {
      alert("Please add at least one product.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...orderForm,
        items: selectedItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode,
          quantity: parseInt(item.quantity) || 1,
          sellingPrice: parseFloat(item.sellingPrice) || 0,
          expiryDate: item.expiryDate || null,
          taxRate: parseFloat(item.taxRate) || 0,
          discount: parseFloat(item.discount) || 0,
        })),
      };

      await createOnlineOrder(payload);
      alert("Online order created successfully!");
      setShowCreateModal(false);
      resetForm();
      fetchOrders();
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Failed to create order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setOrderForm({ customerName: "", customerPhone: "", paymentMode: "CASH", termsAndConditions: "", notes: "" });
    setSelectedItems([]);
    setProductSearch("");
  };

  // ─── View Order Items ─────────────────────────────────────────────────────────
  const handleViewItems = async (order) => {
    setViewOrder(order);
    setShowViewModal(true);
    setLoadingItems(true);
    setViewItems([]);
    try {
      const items = await getOnlineOrderItems(order.id);
      setViewItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Error fetching order items:", err);
      setViewItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // ─── Update Status ────────────────────────────────────────────────────────────
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOnlineOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  // ─── Delete Order ─────────────────────────────────────────────────────────────
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOnlineOrder(orderId);
      fetchOrders();
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Failed to delete order.");
    }
  };

  // ─── Status Badge ─────────────────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const map = {
      PENDING: { cls: "pending", dot: "🟡", label: "Pending" },
      PROCESSING: { cls: "processing", dot: "🔵", label: "Processing" },
      COMPLETED: { cls: "completed", dot: "🟢", label: "Completed" },
      CANCELLED: { cls: "cancelled", dot: "🔴", label: "Cancelled" },
    };
    const s = map[status] || { cls: "", dot: "⚪", label: status };
    return (
      <span className={`status-badge ${s.cls}`}>
        {s.dot} {s.label}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content online-orders-page" style={{ marginTop: "2%" }}>

          {/* ── Header ── */}
          <div className="orders-header">
            <div className="header-left">
              <h2><i className="bi bi-cart-check"></i> Online Orders</h2>
              <p className="header-subtitle">
                <i className="bi bi-info-circle"></i> Manage and track your online store orders
              </p>
            </div>
            <div className="header-actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowCreateModal(true)}
              >
                <FiPlus /> Add Online Order
              </button>
              <button
                onClick={() => setShowStoreModal(true)}
                style={{ marginLeft: 10, background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <i className="bi bi-shop"></i> Create Online Store
              </button>
            </div>
          </div>

          {/* ── Summary Cards ── */}
          <div className="orders-summary-cards">
            <div className="summary-card blue">
              <div className="card-icon"><i className="bi bi-cart3"></i></div>
              <div className="card-content">
                <h4>Total Orders</h4>
                <p className="amount">{totalOrders}</p>
                <span className="subtitle">All Time</span>
              </div>
            </div>
            <div className="summary-card green">
              <div className="card-icon"><i className="bi bi-check-circle"></i></div>
              <div className="card-content">
                <h4>Completed</h4>
                <p className="amount">{completedOrders}</p>
                <span className="subtitle">All Time</span>
              </div>
            </div>
            <div className="summary-card orange">
              <div className="card-icon"><i className="bi bi-clock-history"></i></div>
              <div className="card-content">
                <h4>Pending / Processing</h4>
                <p className="amount">{pendingOrders}</p>
                <span className="subtitle">Awaiting Processing</span>
              </div>
            </div>
            <div className="summary-card purple">
              <div className="card-icon"><i className="bi bi-currency-rupee"></i></div>
              <div className="card-content">
                <h4>Revenue</h4>
                <p className="amount">₹ {totalRevenue.toFixed(2)}</p>
                <span className="subtitle">From Completed Orders</span>
              </div>
            </div>
          </div>

          {/* ── My Stores Section ── */}
          <div style={{ marginTop: 32, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h4 style={{ fontWeight: 700, color: "#1f2937", margin: 0 }}>
                <i className="bi bi-shop-window" style={{ color: "#10b981", marginRight: 8 }}></i>
                My Online Stores
                <span style={{ marginLeft: 10, background: "#ecfdf5", color: "#10b981", border: "1px solid #6ee7b7", borderRadius: 20, padding: "2px 12px", fontSize: 13, fontWeight: 600 }}>
                  {stores.length}
                </span>
              </h4>
              <button className="btn btn-success btn-sm" onClick={() => setShowStoreModal(true)} style={{ fontWeight: 600 }}>
                <i className="bi bi-plus-circle"></i> New Store
              </button>
            </div>

            {stores.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "#f9fafb", borderRadius: 12, border: "2px dashed #d1d5db" }}>
                <i className="bi bi-shop" style={{ fontSize: 40, color: "#9ca3af" }}></i>
                <h5 style={{ color: "#6b7280", marginTop: 12 }}>No stores created yet</h5>
                <p style={{ color: "#9ca3af", fontSize: 13 }}>Click "Create Online Store" to get started</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                {stores.map(store => (
                  <div key={store.id} style={{ background: "#fff", borderRadius: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    <div style={{ background: "linear-gradient(135deg, #10b981, #3e4e96)", padding: "16px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h5 style={{ color: "#fff", margin: 0, fontWeight: 700, fontSize: 16 }}>
                            <i className="bi bi-shop"></i> {store.storeName}
                          </h5>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
                            Created: {store.createdAt ? new Date(store.createdAt).toLocaleDateString("en-IN") : "-"}
                          </span>
                        </div>
                        <span style={{ background: store.status === "ACTIVE" ? "#ecfdf5" : "#f3f4f6", color: store.status === "ACTIVE" ? "#10b981" : "#6b7280", border: `1px solid ${store.status === "ACTIVE" ? "#6ee7b7" : "#d1d5db"}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                          {store.status}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: "16px 20px" }}>
                      {store.categories && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 6 }}>CATEGORIES</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {store.categories.split(",").filter(c => c.trim()).map(cat => (
                              <span key={cat} style={{ background: "#e0f2fe", color: "#0369a1", border: "1px solid #7dd3fc", borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 600 }}>
                                {cat.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                        <div style={{ textAlign: "center", flex: 1, background: "#f0fdf4", borderRadius: 8, padding: "10px 0" }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981" }}>{store.productCount}</div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>Products</div>
                        </div>
                        <div style={{ textAlign: "center", flex: 1, background: "#eef0fb", borderRadius: 8, padding: "10px 0" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#3e4e96" }}>{store.id}</div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>Store ID</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn btn-sm btn-outline-success"
                          style={{ flex: 1, fontSize: 12, fontWeight: 600 }}
                          onClick={() => handleViewStoreProducts(store)}
                        >
                          <FiEye /> {viewingStore && viewingStore.id === store.id ? "Hide" : "View"} Products
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          style={{ fontSize: 12 }}
                          onClick={() => handleDeleteStore(store.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      {viewingStore && viewingStore.id === store.id && (
                        <div style={{ marginTop: 14, borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
                            <i className="bi bi-box-seam"></i> Products in this Store
                          </div>
                          {viewStoreProducts.length === 0 ? (
                            <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center" }}>No products found.</p>
                          ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                              <thead>
                                <tr style={{ background: "#f0fdf4" }}>
                                  <th style={{ padding: "6px 8px", textAlign: "left", color: "#374151" }}>ID</th>
                                  <th style={{ padding: "6px 8px", textAlign: "left", color: "#374151" }}>Name</th>
                                  <th style={{ padding: "6px 8px", textAlign: "left", color: "#374151" }}>Code</th>
                                  <th style={{ padding: "6px 8px", textAlign: "center", color: "#374151" }}>Stock</th>
                                </tr>
                              </thead>
                              <tbody>
                                {viewStoreProducts.map((p, idx) => (
                                  <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6", background: idx % 2 === 0 ? "#fff" : "#f9fafb" }}>
                                    <td style={{ padding: "6px 8px", color: "#3e4e96", fontWeight: 600 }}>{p.productId}</td>
                                    <td style={{ padding: "6px 8px", color: "#1f2937" }}>{p.productName}</td>
                                    <td style={{ padding: "6px 8px", color: "#6b7280" }}>{p.productCode}</td>
                                    <td style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700, color: "#10b981" }}>{p.totalStock}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Enhanced Filters ── */}
          <div className="filter-bar-card">
            <div className="filter-bar-header">
              <i className="bi bi-funnel-fill filter-bar-icon"></i>
              <span className="filter-bar-title">Search &amp; Filter Orders</span>
              <span className="filter-bar-count">
                Showing <strong className="filter-bar-count-num">{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
              </span>
            </div>

            <div className="filter-bar-body">
              {/* Search */}
              <div className="filter-field filter-field--search">
                <label className="filter-label">
                  <i className="bi bi-search"></i> SEARCH
                </label>
                <div className="filter-search-wrap">
                  <FiSearch className="filter-search-icon" />
                  <input
                    type="text"
                    className="filter-search-input"
                    placeholder="Search by customer name, order number, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="filter-search-clear" onClick={() => setSearchQuery("")} title="Clear search">
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Date Filter */}
              <div className="filter-field filter-field--date">
                <label className="filter-label">
                  <i className="bi bi-calendar3"></i> DATE RANGE
                </label>
                <select
                  className="filter-select"
                  value={dateFilter}
                  onChange={(e) => { setDateFilter(e.target.value); setCustomDateFrom(""); setCustomDateTo(""); }}
                >
                  <option value="Today">Today</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="This Month">This Month</option>
                  <option value="Last 3 Months">Last 3 Months</option>
                  <option value="Last 6 Months">Last 6 Months</option>
                  <option value="Custom Range">📅 Custom Date Range</option>
                </select>
              </div>

              {/* Custom Date Pickers */}
              {dateFilter === "Custom Range" && (
                <>
                  <div className="filter-field filter-field--custom-date">
                    <label className="filter-label">
                      <i className="bi bi-calendar-event"></i> FROM DATE
                    </label>
                    <input
                      type="date"
                      className="filter-date-input"
                      value={customDateFrom}
                      max={customDateTo || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="filter-field filter-field--custom-date">
                    <label className="filter-label">
                      <i className="bi bi-calendar-check"></i> TO DATE
                    </label>
                    <input
                      type="date"
                      className="filter-date-input"
                      value={customDateTo}
                      min={customDateFrom}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Status Filter */}
              <div className="filter-field filter-field--status">
                <label className="filter-label">
                  <i className="bi bi-funnel"></i> STATUS
                </label>
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All Status">All Status</option>
                  <option value="PENDING">🟡 Pending</option>
                  <option value="PROCESSING">🔵 Processing</option>
                  <option value="COMPLETED">🟢 Completed</option>
                  <option value="CANCELLED">🔴 Cancelled</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(searchQuery || dateFilter !== "Today" || statusFilter !== "All Status") && (
                <div className="filter-field filter-field--clear">
                  <label className="filter-label" style={{ visibility: "hidden" }}>.</label>
                  <button
                    className="filter-clear-btn"
                    onClick={() => { setSearchQuery(""); setDateFilter("Today"); setStatusFilter("All Status"); setCustomDateFrom(""); setCustomDateTo(""); }}
                  >
                    <i className="bi bi-x-circle-fill"></i> Clear All
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Orders Table ── */}
          <div className="orders-section-heading">
            <h4>
              <i className="bi bi-table"></i>
              All Orders
              <span className="order-count-badge">{filteredOrders.length}</span>
            </h4>
          </div>
          <div className="orders-table-card">
            <div className="table-header-row" style={{ gridTemplateColumns: "1fr 1.2fr 1.3fr 1fr 1fr 1.2fr 0.8fr 1fr" }}>
              <div className="header-cell"><i className="bi bi-calendar-event"></i> Date</div>
              <div className="header-cell"><i className="bi bi-hash"></i> Order Number</div>
              <div className="header-cell"><i className="bi bi-person"></i> Customer</div>
              <div className="header-cell"><i className="bi bi-currency-rupee"></i> Amount</div>
              <div className="header-cell"><i className="bi bi-info-circle"></i> Status</div>
              <div className="header-cell"><i className="bi bi-credit-card"></i> Payment</div>
              <div className="header-cell"><i className="bi bi-eye"></i> View Items</div>
              <div className="header-cell"><i className="bi bi-gear"></i> Actions</div>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="empty-icon"><i className="bi bi-hourglass-split"></i></div>
                <h4>Loading orders...</h4>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><i className="bi bi-shop"></i></div>
                <h4>No Online Orders Yet</h4>
                <p>No transactions matching the current filter</p>
                <button className="btn btn-primary mt-3" onClick={() => setShowCreateModal(true)}>
                  <FiPlus /> Add Online Order
                </button>
              </div>
            ) : (
              <div>
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="order-row"
                    style={{ gridTemplateColumns: "1fr 1.2fr 1.3fr 1fr 1fr 1.2fr 0.8fr 1fr" }}
                  >
                    <div className="cell-date">{formatDate(order.orderDate)}</div>
                    <div className="cell-order-num">{order.orderNumber}</div>
                    <div>
                      <div className="cell-customer-name">{order.customerName || "-"}</div>
                      <div className="cell-customer-phone">{order.customerPhone || ""}</div>
                    </div>
                    <div className="cell-amount">₹ {(order.totalAmount || 0).toFixed(2)}</div>
                    {/* Status column — badge + dropdown */}
                    <div>
                      <select
                        className="status-select"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="PENDING">🟡 Pending</option>
                        <option value="PROCESSING">🔵 Processing</option>
                        <option value="COMPLETED">🟢 Completed</option>
                        <option value="CANCELLED">🔴 Cancelled</option>
                      </select>
                    </div>
                    <div className="cell-payment">{order.paymentMode || "-"}</div>
                    {/* View Items column */}
                    <div>
                      <button
                        className="btn btn-view"
                        onClick={() => handleViewItems(order)}
                        title="View Items"
                      >
                        <FiEye /> View
                      </button>
                    </div>
                    {/* Actions column — Edit + Delete */}
                    <div className="action-group">
                      <button
                        className="btn btn-edit"
                        onClick={() => { setOrderForm({ customerName: order.customerName || "", customerPhone: order.customerPhone || "", paymentMode: order.paymentMode || "CASH", termsAndConditions: order.termsAndConditions || "", notes: order.notes || "" }); setShowCreateModal(true); }}
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDeleteOrder(order.id)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
                {/* Footer row */}
                <div className="table-footer-row">
                  <span>Total Orders: <span className="footer-total">{filteredOrders.length}</span></span>
                  <span>Total Revenue: <span className="footer-total">₹ {filteredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0).toFixed(2)}</span></span>
                </div>
              </div>
            )}
          </div>



          {/* ═══════════════════════════════════════════════════════════════════════
          CREATE ORDER MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
          {showCreateModal && (
            <div style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
              zIndex: 9999, display: "flex", alignItems: "flex-start",
              justifyContent: "center", padding: "20px", overflowY: "auto"
            }}>
              <div style={{
                background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "860px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)", margin: "auto"
              }}>
                {/* Modal Header */}
                <div style={{
                  background: "linear-gradient(135deg, #3e4e96 0%, #e8961b 100%)",
                  padding: "20px 28px", borderRadius: "16px 16px 0 0",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <h4 style={{ color: "#fff", margin: 0, fontWeight: 700 }}>
                    <i className="bi bi-cart-plus"></i> Create Online Order
                  </h4>
                  <button
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                    style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 18 }}
                  >
                    <FiX />
                  </button>
                </div>

                <div style={{ padding: "24px 28px" }}>
                  {/* Customer Info */}
                  <h6 style={{ fontWeight: 700, color: "#3e4e96", marginBottom: 12 }}>
                    <i className="bi bi-person-circle"></i> Customer Information
                  </h6>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Customer Name *</label>
                      <input
                        className="form-control form-control-sm mt-1"
                        placeholder="Enter customer name"
                        value={orderForm.customerName}
                        onChange={e => setOrderForm(f => ({ ...f, customerName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Customer Phone</label>
                      <input
                        className="form-control form-control-sm mt-1"
                        placeholder="Enter phone number"
                        value={orderForm.customerPhone}
                        onChange={e => setOrderForm(f => ({ ...f, customerPhone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Payment Mode</label>
                      <select
                        className="form-select form-select-sm mt-1"
                        value={orderForm.paymentMode}
                        onChange={e => setOrderForm(f => ({ ...f, paymentMode: e.target.value }))}
                      >
                        <option value="CASH">Cash</option>
                        <option value="ONLINE">Online</option>
                        <option value="UPI">UPI</option>
                        <option value="CARD">Card</option>
                      </select>
                    </div>
                  </div>

                  {/* Product Search */}
                  <h6 style={{ fontWeight: 700, color: "#3e4e96", marginBottom: 12 }}>
                    <i className="bi bi-box-seam"></i> Add Products
                  </h6>
                  <div style={{ position: "relative", marginBottom: 16 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <input
                        className="form-control form-control-sm"
                        placeholder="Search product by name or code..."
                        value={productSearch}
                        onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                        onFocus={() => setShowProductDropdown(true)}
                      />
                    </div>
                    {showProductDropdown && productSearch && (
                      <div style={{
                        position: "absolute", top: "100%", left: 0, right: 0,
                        background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 1000,
                        maxHeight: 220, overflowY: "auto"
                      }}>
                        {filteredProducts.length === 0 ? (
                          <div style={{ padding: "12px 16px", color: "#6b7280", fontSize: 13 }}>No products found</div>
                        ) : filteredProducts.map(p => (
                          <div
                            key={p.productId}
                            onClick={() => handleSelectProduct(p)}
                            style={{
                              padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid #f3f4f6",
                              display: "flex", justifyContent: "space-between", alignItems: "center"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
                            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13, color: "#1f2937" }}>{p.productName}</div>
                              <div style={{ fontSize: 11, color: "#6b7280" }}>Code: {p.productCode} | Stock: {p.remainingStock}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: 700, color: "#3e4e96", fontSize: 13 }}>₹{p.sellingPrice}</div>
                              {p.expiryDate && (
                                <div style={{ fontSize: 11, color: "#e8961b" }}>Exp: {p.expiryDate}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Items Table */}
                  {selectedItems.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                          <thead>
                            <tr style={{ background: "linear-gradient(135deg, #3e4e96, #5a6fb8)", color: "#fff" }}>
                              <th style={{ padding: "10px 12px", textAlign: "left" }}>#</th>
                              <th style={{ padding: "10px 12px", textAlign: "left" }}>Product</th>
                              <th style={{ padding: "10px 12px", textAlign: "center" }}>Qty</th>
                              <th style={{ padding: "10px 12px", textAlign: "right" }}>Selling Price (₹)</th>
                              <th style={{ padding: "10px 12px", textAlign: "center" }}>Expiry Date</th>
                              <th style={{ padding: "10px 12px", textAlign: "center" }}>Tax %</th>
                              <th style={{ padding: "10px 12px", textAlign: "center" }}>Disc %</th>
                              <th style={{ padding: "10px 12px", textAlign: "right" }}>Total (₹)</th>
                              <th style={{ padding: "10px 12px", textAlign: "center" }}>Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedItems.map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                                <td style={{ padding: "8px 12px", color: "#6b7280" }}>{idx + 1}</td>
                                <td style={{ padding: "8px 12px" }}>
                                  <div style={{ fontWeight: 600, color: "#1f2937" }}>{item.productName}</div>
                                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.productCode}</div>
                                </td>
                                <td style={{ padding: "8px 12px" }}>
                                  <input
                                    type="number"
                                    min="1"
                                    className="form-control form-control-sm"
                                    style={{ width: 70, textAlign: "center" }}
                                    value={item.quantity}
                                    onChange={e => handleItemChange(idx, "quantity", e.target.value)}
                                  />
                                </td>
                                <td style={{ padding: "8px 12px" }}>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="form-control form-control-sm"
                                    style={{ width: 90, textAlign: "right" }}
                                    value={item.sellingPrice}
                                    onChange={e => handleItemChange(idx, "sellingPrice", e.target.value)}
                                  />
                                </td>
                                <td style={{ padding: "8px 12px", textAlign: "center", color: item.expiryDate ? "#e8961b" : "#9ca3af", fontSize: 12 }}>
                                  {item.expiryDate || "N/A"}
                                </td>
                                <td style={{ padding: "8px 12px", textAlign: "center", color: "#6b7280" }}>
                                  {item.taxRate || 0}%
                                </td>
                                <td style={{ padding: "8px 12px", textAlign: "center", color: "#6b7280" }}>
                                  {item.discount || 0}%
                                </td>
                                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#3e4e96" }}>
                                  ₹{calcItemTotal(item).toFixed(2)}
                                </td>
                                <td style={{ padding: "8px 12px", textAlign: "center" }}>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    style={{ padding: "2px 8px" }}
                                    onClick={() => handleRemoveItem(idx)}
                                  >
                                    <FiX />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr style={{ background: "#f0f4ff", fontWeight: 700 }}>
                              <td colSpan={7} style={{ padding: "10px 12px", textAlign: "right", color: "#374151" }}>
                                Order Total:
                              </td>
                              <td style={{ padding: "10px 12px", textAlign: "right", color: "#3e4e96", fontSize: 15 }}>
                                ₹{orderTotal.toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Terms & Conditions */}
                  <h6 style={{ fontWeight: 700, color: "#3e4e96", marginBottom: 12 }}>
                    <i className="bi bi-file-text"></i> Terms & Conditions
                  </h6>
                  <textarea
                    className="form-control form-control-sm"
                    rows={3}
                    placeholder="Enter terms and conditions for this order..."
                    value={orderForm.termsAndConditions}
                    onChange={e => setOrderForm(f => ({ ...f, termsAndConditions: e.target.value }))}
                    style={{ marginBottom: 14, resize: "vertical" }}
                  />

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Notes (Optional)</label>
                    <textarea
                      className="form-control form-control-sm mt-1"
                      rows={2}
                      placeholder="Any additional notes..."
                      value={orderForm.notes}
                      onChange={e => setOrderForm(f => ({ ...f, notes: e.target.value }))}
                      style={{ resize: "vertical" }}
                    />
                  </div>

                  {/* Modal Footer */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => { setShowCreateModal(false); resetForm(); }}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSubmitOrder}
                      disabled={submitting}
                      style={{ background: "linear-gradient(135deg, #3e4e96, #e8961b)", border: "none", fontWeight: 700 }}
                    >
                      {submitting ? "Creating..." : "Create Order"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
          VIEW ITEMS MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
          {showViewModal && viewOrder && (
            <div style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
              zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
            }}>
              <div style={{
                background: "#fff", borderRadius: 16, width: "100%", maxWidth: 700,
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto"
              }}>
                <div style={{
                  background: "linear-gradient(135deg, #3e4e96 0%, #e8961b 100%)",
                  padding: "18px 24px", borderRadius: "16px 16px 0 0",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    <h5 style={{ color: "#fff", margin: 0, fontWeight: 700 }}>
                      <i className="bi bi-receipt"></i> Order Details
                    </h5>
                    <p style={{ color: "rgba(255,255,255,0.85)", margin: 0, fontSize: 13 }}>
                      {viewOrder.orderNumber} — {viewOrder.customerName}
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowViewModal(false); setViewOrder(null); setViewItems([]); }}
                    style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 18 }}
                  >
                    <FiX />
                  </button>
                </div>

                <div style={{ padding: "20px 24px" }}>
                  {/* Order Info */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20, background: "#f8f9fa", padding: 16, borderRadius: 10 }}>
                    <div><span style={{ fontSize: 12, color: "#6b7280" }}>Order Date</span><br /><strong style={{ color: "#1f2937" }}>{formatDate(viewOrder.orderDate)}</strong></div>
                    <div><span style={{ fontSize: 12, color: "#6b7280" }}>Status</span><br />{getStatusBadge(viewOrder.status)}</div>
                    <div><span style={{ fontSize: 12, color: "#6b7280" }}>Customer Phone</span><br /><strong style={{ color: "#1f2937" }}>{viewOrder.customerPhone || "-"}</strong></div>
                    <div><span style={{ fontSize: 12, color: "#6b7280" }}>Payment Mode</span><br /><strong style={{ color: "#1f2937" }}>{viewOrder.paymentMode || "-"}</strong></div>
                    <div><span style={{ fontSize: 12, color: "#6b7280" }}>Total Amount</span><br /><strong style={{ color: "#3e4e96", fontSize: 16 }}>₹ {(viewOrder.totalAmount || 0).toFixed(2)}</strong></div>
                    <div><span style={{ fontSize: 12, color: "#6b7280" }}>Total Items</span><br /><strong style={{ color: "#1f2937" }}>{viewOrder.totalItems}</strong></div>
                  </div>

                  {/* Items Table */}
                  <h6 style={{ fontWeight: 700, color: "#3e4e96", marginBottom: 10 }}>
                    <i className="bi bi-box-seam"></i> Order Items
                  </h6>
                  {loadingItems ? (
                    <p style={{ textAlign: "center", color: "#6b7280" }}>Loading items...</p>
                  ) : viewItems.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#6b7280" }}>No items found.</p>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#3e4e96", color: "#fff" }}>
                          <th style={{ padding: "9px 12px", textAlign: "left" }}>#</th>
                          <th style={{ padding: "9px 12px", textAlign: "left" }}>Product</th>
                          <th style={{ padding: "9px 12px", textAlign: "center" }}>Qty</th>
                          <th style={{ padding: "9px 12px", textAlign: "right" }}>Price (₹)</th>
                          <th style={{ padding: "9px 12px", textAlign: "center" }}>Expiry</th>
                          <th style={{ padding: "9px 12px", textAlign: "center" }}>Tax%</th>
                          <th style={{ padding: "9px 12px", textAlign: "center" }}>Disc%</th>
                          <th style={{ padding: "9px 12px", textAlign: "right" }}>Total (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewItems.map((item, idx) => (
                          <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                            <td style={{ padding: "8px 12px", color: "#6b7280" }}>{idx + 1}</td>
                            <td style={{ padding: "8px 12px" }}>
                              <div style={{ fontWeight: 600, color: "#1f2937" }}>{item.productName}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.productCode}</div>
                            </td>
                            <td style={{ padding: "8px 12px", textAlign: "center", color: "#1f2937", fontWeight: 600 }}>{item.quantity}</td>
                            <td style={{ padding: "8px 12px", textAlign: "right", color: "#1f2937", fontWeight: 600 }}>₹{(item.sellingPrice || 0).toFixed(2)}</td>
                            <td style={{ padding: "8px 12px", textAlign: "center", color: "#e8961b", fontSize: 12, fontWeight: 600 }}>
                              {item.expiryDate || "N/A"}
                            </td>
                            <td style={{ padding: "8px 12px", textAlign: "center", color: "#374151", fontWeight: 600 }}>{item.taxRate || 0}%</td>
                            <td style={{ padding: "8px 12px", textAlign: "center", color: "#374151", fontWeight: 600 }}>{item.discount || 0}%</td>
                            <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#3e4e96" }}>
                              ₹{(item.totalPrice || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: "#f0f4ff", fontWeight: 700 }}>
                          <td colSpan={7} style={{ padding: "10px 12px", textAlign: "right" }}>Grand Total:</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: "#3e4e96", fontSize: 15 }}>
                            ₹{(viewOrder.totalAmount || 0).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  )}

                  {/* Terms & Conditions */}
                  {viewOrder.termsAndConditions && (
                    <div style={{ marginTop: 16, padding: 14, background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a" }}>
                      <strong style={{ fontSize: 13, color: "#92400e" }}>
                        <i className="bi bi-file-text"></i> Terms & Conditions
                      </strong>
                      <p style={{ margin: "6px 0 0", fontSize: 13, color: "#78350f", whiteSpace: "pre-wrap" }}>
                        {viewOrder.termsAndConditions}
                      </p>
                    </div>
                  )}

                  {viewOrder.notes && (
                    <div style={{ marginTop: 10, padding: 14, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                      <strong style={{ fontSize: 13, color: "#166534" }}>
                        <i className="bi bi-sticky"></i> Notes
                      </strong>
                      <p style={{ margin: "6px 0 0", fontSize: 13, color: "#15803d" }}>{viewOrder.notes}</p>
                    </div>
                  )}

                  <div style={{ textAlign: "right", marginTop: 20 }}>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => { setShowViewModal(false); setViewOrder(null); setViewItems([]); }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
          CREATE ONLINE STORE MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
          {showStoreModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px", overflowY: "auto" }}>
              <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 820, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", margin: "auto" }}>
                {/* Header */}
                <div style={{ background: "linear-gradient(135deg, #10b981 0%, #3e4e96 100%)", padding: "20px 28px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ color: "#fff", margin: 0, fontWeight: 700 }}>
                    <i className="bi bi-shop"></i> Create Online Store
                  </h4>
                  <button onClick={() => { setShowStoreModal(false); resetStoreModal(); }}
                    style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 18 }}>
                    <FiX />
                  </button>
                </div>

                <div style={{ padding: "24px 28px" }}>
                  {/* Store Name */}
                  <h6 style={{ fontWeight: 700, color: "#10b981", marginBottom: 12 }}>
                    <i className="bi bi-shop-window"></i> Store Information
                  </h6>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Store Name *</label>
                    <input className="form-control form-control-sm mt-1" placeholder="e.g. My Electronics Store"
                      value={storeForm.storeName}
                      onChange={e => setStoreForm(f => ({ ...f, storeName: e.target.value }))} />
                  </div>

                  {/* Category Tags */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Product Categories</label>
                    <div style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "6px 10px", minHeight: 42, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", background: "#fff", marginTop: 4 }}>
                      {categoryTags.map(tag => (
                        <span key={tag} style={{ background: "#e0f2fe", color: "#0369a1", border: "1px solid #7dd3fc", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                          {tag}
                          <span onClick={() => handleRemoveCategoryTag(tag)} style={{ cursor: "pointer", fontWeight: 700, marginLeft: 2 }}>×</span>
                        </span>
                      ))}
                      <input
                        style={{ border: "none", outline: "none", fontSize: 13, flex: 1, minWidth: 120 }}
                        placeholder="Type category and press Enter..."
                        value={categoryInput}
                        onChange={e => setCategoryInput(e.target.value)}
                        onKeyDown={handleAddCategoryTag}
                      />
                    </div>
                    <small style={{ color: "#6b7280", fontSize: 11 }}>Press Enter or comma to add a category tag</small>
                  </div>

                  {/* Product Search */}
                  <h6 style={{ fontWeight: 700, color: "#10b981", marginBottom: 12 }}>
                    <i className="bi bi-box-seam"></i> Add Products to Store
                  </h6>
                  <div style={{ position: "relative", marginBottom: 16 }}>
                    <input className="form-control form-control-sm"
                      placeholder="Search product by name or code..."
                      value={storeProductSearch}
                      onChange={e => { setStoreProductSearch(e.target.value); setShowStoreProductDropdown(true); }}
                      onFocus={() => setShowStoreProductDropdown(true)} />
                    {showStoreProductDropdown && storeProductSearch && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 1000, maxHeight: 220, overflowY: "auto" }}>
                        {filteredStoreProducts.length === 0 ? (
                          <div style={{ padding: "12px 16px", color: "#6b7280", fontSize: 13 }}>No products found</div>
                        ) : filteredStoreProducts.map(p => (
                          <div key={p.productId}
                            onClick={() => handleSelectStoreProduct(p)}
                            style={{ padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                            onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13, color: "#1f2937" }}>{p.productName}</div>
                              <div style={{ fontSize: 11, color: "#6b7280" }}>ID: {p.productId} | Code: {p.productCode}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: 700, color: "#10b981", fontSize: 12 }}>Stock: {p.totalStock || p.remainingStock || 0}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Products Table */}
                  {selectedStoreProducts.length > 0 && (
                    <div style={{ marginBottom: 20, overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>
                            <th style={{ padding: "9px 12px", textAlign: "left" }}>#</th>
                            <th style={{ padding: "9px 12px", textAlign: "left" }}>Product ID</th>
                            <th style={{ padding: "9px 12px", textAlign: "left" }}>Product Name</th>
                            <th style={{ padding: "9px 12px", textAlign: "left" }}>Code</th>
                            <th style={{ padding: "9px 12px", textAlign: "center" }}>Total Stock</th>
                            <th style={{ padding: "9px 12px", textAlign: "center" }}>Remove</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStoreProducts.map((p, idx) => (
                            <tr key={p.productId} style={{ borderBottom: "1px solid #f3f4f6", background: idx % 2 === 0 ? "#fff" : "#f9fafb" }}>
                              <td style={{ padding: "8px 12px", color: "#6b7280" }}>{idx + 1}</td>
                              <td style={{ padding: "8px 12px", fontWeight: 600, color: "#3e4e96" }}>{p.productId}</td>
                              <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1f2937" }}>{p.productName}</td>
                              <td style={{ padding: "8px 12px", color: "#6b7280" }}>{p.productCode}</td>
                              <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: 700, color: "#10b981" }}>{p.totalStock}</td>
                              <td style={{ padding: "8px 12px", textAlign: "center" }}>
                                <button className="btn btn-sm btn-outline-danger" style={{ padding: "2px 8px" }}
                                  onClick={() => handleRemoveStoreProduct(p.productId)}>
                                  <FiTrash2 />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: "#f0fdf4", fontWeight: 700 }}>
                            <td colSpan={4} style={{ padding: "10px 12px", textAlign: "right", color: "#374151" }}>Total Products:</td>
                            <td style={{ padding: "10px 12px", textAlign: "center", color: "#10b981", fontSize: 15 }}>{selectedStoreProducts.length}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20, borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
                    <button className="btn btn-outline-secondary"
                      onClick={() => { setShowStoreModal(false); resetStoreModal(); }}
                      disabled={submittingStore}>Cancel</button>
                    <button className="btn btn-success" onClick={handleSubmitStore} disabled={submittingStore}
                      style={{ fontWeight: 700 }}>
                      {submittingStore ? "Creating..." : "Create Store"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default OnlineOrders;
