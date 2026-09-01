import React, { useState, useEffect, useRef } from "react";
import {
  BsUpcScan,
  BsCartCheckFill,
  BsPlusCircleFill,
  BsTrashFill,
  BsPrinterFill,
  BsQrCode,
  BsCashStack,
  BsCreditCard2FrontFill,
  BsPauseCircleFill,
  BsPlayCircleFill,
  BsCheckCircleFill,
  BsSearch,
  BsBuilding,
  BsPersonFill
} from "react-icons/bs";
import PortalLayout from "../PortalLayout";
import { getAllProducts, getAllCustomers, createSale } from "../../services/api";
import { printEnterpriseInvoice } from "../../utils/invoicePrintUtil";
import Swal from "sweetalert2";

export default function PosBilling() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("WALK_IN");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCartIndex, setActiveCartIndex] = useState(0);
  const [carts, setCarts] = useState([
    { id: 1, name: "Cart 1 (Active)", items: [] }
  ]);
  const [posSectorMode, setPosSectorMode] = useState("ALL"); // ALL, SUPERMARKET, CLOTHING, ELECTRONICS, FERTILIZER, TRANSPORT
  const [paymentMode, setPaymentMode] = useState("CASH"); // CASH, UPI, CARD, SPLIT
  const [cashTendered, setCashTendered] = useState("");
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [lastCompletedBill, setLastCompletedBill] = useState(null);

  // Sector Specific Active Attribs
  const [selectedSize, setSelectedSize] = useState("L");
  const [selectedColor, setSelectedColor] = useState("Navy Blue");
  const [inputImei, setInputImei] = useState("");
  const [inputBatch, setInputBatch] = useState("BATCH-2026");
  const [weighingGrams, setWeighingGrams] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [lrNumber, setLrNumber] = useState("");

  const searchInputRef = useRef(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const [prodList, custList] = await Promise.all([
          getAllProducts(),
          getAllCustomers()
        ]);
        if (Array.isArray(prodList)) setProducts(prodList);
        if (Array.isArray(custList)) setCustomers(custList);
      } catch (e) {
        console.error("Error loading POS data:", e);
      }
    };
    initData();
  }, []);

  const currentCart = carts[activeCartIndex] || carts[0];

  const handleAddItemToCart = (prod) => {
    const existingIndex = currentCart.items.findIndex(item => item.id === prod.id);
    let updatedItems = [...currentCart.items];

    if (existingIndex > -1) {
      updatedItems[existingIndex].quantity += 1;
      updatedItems[existingIndex].total = updatedItems[existingIndex].quantity * updatedItems[existingIndex].price;
    } else {
      const price = Number(prod.sellingPrice || prod.purchasePrice || 100);
      const isApparel = posSectorMode === "CLOTHING";
      // Dual GST rule for Apparel: 5% if <= 1000, 12% if > 1000
      const autoTax = isApparel ? (price <= 1000 ? 5 : 12) : Number(prod.taxRate || 18);

      updatedItems.push({
        id: prod.id,
        name: prod.productName || prod.name || "Product Item",
        code: prod.productCode || "SKU-" + prod.id,
        price: price,
        mrp: Number(prod.mrp || price * 1.15),
        taxRate: autoTax,
        quantity: 1,
        total: price,
        // Sector Attributes
        size: posSectorMode === "CLOTHING" ? selectedSize : null,
        color: posSectorMode === "CLOTHING" ? selectedColor : null,
        imei: posSectorMode === "ELECTRONICS" ? (inputImei || "IMEI-" + Math.floor(100000000000000 + Math.random() * 900000000000000)) : null,
        batchNo: posSectorMode === "FERTILIZER" ? (inputBatch || "NPK-2026-A1") : null,
        weight: posSectorMode === "SUPERMARKET" && weighingGrams ? `${weighingGrams}g` : null
      });
    }

    const updatedCarts = [...carts];
    updatedCarts[activeCartIndex].items = updatedItems;
    setCarts(updatedCarts);
    setSearchQuery("");
  };

  const handleUpdateQuantity = (idx, delta) => {
    const updatedItems = [...currentCart.items];
    const newQty = updatedItems[idx].quantity + delta;
    if (newQty <= 0) {
      updatedItems.splice(idx, 1);
    } else {
      updatedItems[idx].quantity = newQty;
      updatedItems[idx].total = newQty * updatedItems[idx].price;
    }
    const updatedCarts = [...carts];
    updatedCarts[activeCartIndex].items = updatedItems;
    setCarts(updatedCarts);
  };

  const handleRemoveItem = (idx) => {
    const updatedItems = [...currentCart.items];
    updatedItems.splice(idx, 1);
    const updatedCarts = [...carts];
    updatedCarts[activeCartIndex].items = updatedItems;
    setCarts(updatedCarts);
  };

  const handleHoldCart = () => {
    if (currentCart.items.length === 0) {
      Swal.fire("Cart is empty", "Add items to the cart before putting it on hold.", "info");
      return;
    }
    const newCartId = carts.length + 1;
    setCarts([...carts, { id: newCartId, name: `Cart ${newCartId} (Held)`, items: [] }]);
    setActiveCartIndex(carts.length);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Cart placed on hold. New checkout started.',
      showConfirmButton: false,
      timer: 2000
    });
  };

  // Calculations
  const subtotal = currentCart.items.reduce((acc, item) => acc + item.total, 0);
  const taxableValue = subtotal / 1.18;
  const totalTax = subtotal - taxableValue;
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;
  const grandTotal = Math.round(subtotal);

  const changeDue = cashTendered ? Math.max(0, Number(cashTendered) - grandTotal) : 0;

  const handleCompleteSale = async () => {
    if (currentCart.items.length === 0) {
      Swal.fire("No Items", "Please scan or select products to bill.", "warning");
      return;
    }

    const billPayload = {
      invoiceId: "POS-" + Date.now().toString().slice(-6),
      date: new Date().toISOString().split('T')[0],
      customer: selectedCustomerId,
      items: currentCart.items,
      subtotal: subtotal,
      cgst: cgst,
      sgst: sgst,
      totalAmount: grandTotal,
      paymentMode: paymentMode,
      cashTendered: cashTendered || grandTotal,
      changeDue: changeDue
    };

    setLastCompletedBill(billPayload);
    setPrintModalOpen(true);

    // Reset current cart
    const updatedCarts = [...carts];
    updatedCarts[activeCartIndex].items = [];
    setCarts(updatedCarts);
    setCashTendered("");
  };

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    return (p.productName && p.productName.toLowerCase().includes(q)) ||
           (p.productCode && p.productCode.toLowerCase().includes(q)) ||
           (p.barcode && p.barcode.includes(q));
  }).slice(0, 8);

  return (
    <PortalLayout title="High-Speed POS Counter Checkout">
      {/* Top POS Control Ribbon */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 animate-fade-in">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary px-3 py-2 fs-6 rounded-pill d-flex align-items-center gap-1">
            <BsUpcScan /> Quick Scanner Active
          </span>
          {/* Multi-Cart Tabs */}
          <div className="d-flex gap-1 ms-2">
            {carts.map((cart, idx) => (
              <button
                key={cart.id}
                onClick={() => setActiveCartIndex(idx)}
                className={`btn btn-sm ${activeCartIndex === idx ? 'btn-dark fw-bold' : 'btn-light border'} rounded-pill px-3`}
              >
                {cart.name} ({cart.items.length})
              </button>
            ))}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1" onClick={handleHoldCart}>
            <BsPauseCircleFill /> Hold Bill [CTRL+B]
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => {
            const updated = [...carts];
            updated[activeCartIndex].items = [];
            setCarts(updated);
          }}>
            <BsTrashFill /> Clear Cart
          </button>
        </div>
      </div>

      {/* Multi-Sector Business Switcher Ribbon */}
      <div className="card border-0 shadow-xs mb-3 bg-white p-2 rounded-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-bold text-uppercase">Sector Mode:</span>
            <div className="btn-group btn-group-sm">
              <button
                className={`btn ${posSectorMode === 'ALL' ? 'btn-primary' : 'btn-light border'}`}
                onClick={() => setPosSectorMode('ALL')}
              >
                🌐 Universal
              </button>
              <button
                className={`btn ${posSectorMode === 'SUPERMARKET' ? 'btn-success text-white' : 'btn-light border'}`}
                onClick={() => setPosSectorMode('SUPERMARKET')}
              >
                🛒 Supermarket / Grocery
              </button>
              <button
                className={`btn ${posSectorMode === 'CLOTHING' ? 'btn-danger text-white' : 'btn-light border'}`}
                onClick={() => setPosSectorMode('CLOTHING')}
              >
                👗 Clothing & Garments
              </button>
              <button
                className={`btn ${posSectorMode === 'ELECTRONICS' ? 'btn-info text-white' : 'btn-light border'}`}
                onClick={() => setPosSectorMode('ELECTRONICS')}
              >
                📱 Electronics & Mobiles
              </button>
              <button
                className={`btn ${posSectorMode === 'FERTILIZER' ? 'btn-warning text-dark' : 'btn-light border'}`}
                onClick={() => setPosSectorMode('FERTILIZER')}
              >
                🌾 Fertilizers & Agro
              </button>
              <button
                className={`btn ${posSectorMode === 'TRANSPORT' ? 'btn-secondary text-white' : 'btn-light border'}`}
                onClick={() => setPosSectorMode('TRANSPORT')}
              >
                🚛 Transport & Waybills
              </button>
            </div>
          </div>

          {/* Sector-Specific Quick Bar */}
          {posSectorMode === 'CLOTHING' && (
            <div className="d-flex align-items-center gap-2 small">
              <span className="text-muted">Size:</span>
              {['S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                <button
                  key={sz}
                  className={`btn btn-xs ${selectedSize === sz ? 'btn-danger' : 'btn-outline-secondary'}`}
                  onClick={() => setSelectedSize(sz)}
                >
                  {sz}
                </button>
              ))}
              <select className="form-select form-select-sm py-0 ms-1" style={{ width: '110px' }} value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                <option value="Navy Blue">Navy Blue</option>
                <option value="Black">Black</option>
                <option value="White">White</option>
                <option value="Red">Red</option>
                <option value="Olive">Olive</option>
                <option value="Maroon">Maroon</option>
              </select>
            </div>
          )}

          {posSectorMode === 'SUPERMARKET' && (
            <div className="d-flex align-items-center gap-2 small">
              <span className="text-muted">Weighing Scale (g):</span>
              {[250, 500, 1000, 2000, 5000].map(g => (
                <button
                  key={g}
                  className={`btn btn-xs ${weighingGrams === g.toString() ? 'btn-success' : 'btn-outline-secondary'}`}
                  onClick={() => setWeighingGrams(weighingGrams === g.toString() ? "" : g.toString())}
                >
                  {g >= 1000 ? `${g/1000}kg` : `${g}g`}
                </button>
              ))}
            </div>
          )}

          {posSectorMode === 'ELECTRONICS' && (
            <div className="d-flex align-items-center gap-2 small">
              <span className="text-muted">IMEI/Serial:</span>
              <input
                type="text"
                className="form-control form-control-sm py-0"
                style={{ width: '180px' }}
                placeholder="Scan / Type IMEI..."
                value={inputImei}
                onChange={(e) => setInputImei(e.target.value)}
              />
            </div>
          )}

          {posSectorMode === 'FERTILIZER' && (
            <div className="d-flex align-items-center gap-2 small">
              <span className="text-muted">Batch / NPK:</span>
              <input
                type="text"
                className="form-control form-control-sm py-0"
                style={{ width: '150px' }}
                placeholder="e.g. 19:19:19 / Urea"
                value={inputBatch}
                onChange={(e) => setInputBatch(e.target.value)}
              />
            </div>
          )}

          {posSectorMode === 'TRANSPORT' && (
            <div className="d-flex align-items-center gap-2 small">
              <input
                type="text"
                className="form-control form-control-sm py-0"
                style={{ width: '130px' }}
                placeholder="Vehicle No (MH-12..)"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
              />
              <input
                type="text"
                className="form-control form-control-sm py-0"
                style={{ width: '110px' }}
                placeholder="LR / Bilty No"
                value={lrNumber}
                onChange={(e) => setLrNumber(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="row g-3 animate-fade-in">
        {/* Left Column: Barcode Search & Items Table (7 Cols) */}
        <div className="col-lg-8">
          <div className="dashboard-card-box p-3 mb-3">
            {/* Live Barcode / SKU Omnisearch Input */}
            <div className="input-group input-group-lg mb-2">
              <span className="input-group-text bg-light border-end-0">
                <BsSearch className="text-primary" />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                className="form-control border-start-0 fs-6"
                placeholder="Scan Barcode or type Product Name / Code (e.g. Wireless Mouse, 890123...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredProducts.length > 0) {
                    handleAddItemToCart(filteredProducts[0]);
                  }
                }}
              />
              {searchQuery && (
                <button className="btn btn-outline-secondary" onClick={() => setSearchQuery("")}>Clear</button>
              )}
            </div>

            {/* Live Search Quick Match Dropdown */}
            {searchQuery && (
              <div className="p-2 bg-light border rounded-3 mb-3 shadow-sm">
                <div className="small text-muted mb-1 fw-bold">Instant Catalog Matches:</div>
                <div className="d-flex flex-wrap gap-2">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      className="btn btn-sm btn-white border bg-white shadow-xs text-start d-flex align-items-center gap-2"
                      onClick={() => handleAddItemToCart(p)}
                    >
                      <div className="fw-bold">{p.productName || p.name}</div>
                      <span className="badge bg-primary-subtle text-primary">₹{p.sellingPrice || 100}</span>
                      <span className="small text-muted">Stock: {p.totalStock ?? 12}</span>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="p-2 text-muted small">No product matched "{searchQuery}".</div>
                  )}
                </div>
              </div>
            )}

            {/* Line Items Table */}
            <div className="table-responsive" style={{ minHeight: '380px' }}>
              <table className="table table-hover align-middle saas-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th className="text-center" style={{ width: '120px' }}>Rate (₹)</th>
                    <th className="text-center" style={{ width: '140px' }}>Qty</th>
                    <th className="text-end" style={{ width: '120px' }}>Total (₹)</th>
                    <th className="text-center" style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {currentCart.items.length > 0 ? (
                    currentCart.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="fw-bold text-dark">{item.name}</div>
                          <div className="small text-muted font-monospace">{item.code} &bull; GST {item.taxRate}%</div>
                          <div className="d-flex gap-1 mt-1 flex-wrap">
                            {item.size && <span className="badge bg-danger-subtle text-danger border border-danger-subtle py-0">Size: {item.size}</span>}
                            {item.color && <span className="badge bg-secondary-subtle text-dark border py-0">{item.color}</span>}
                            {item.imei && <span className="badge bg-info-subtle text-info-emphasis border py-0">IMEI: {item.imei}</span>}
                            {item.batchNo && <span className="badge bg-warning-subtle text-warning-emphasis border py-0">Batch: {item.batchNo}</span>}
                            {item.weight && <span className="badge bg-success-subtle text-success border py-0">Wt: {item.weight}</span>}
                          </div>
                        </td>
                        <td className="text-center font-monospace">₹{item.price.toFixed(2)}</td>
                        <td className="text-center">
                          <div className="d-inline-flex align-items-center border rounded bg-light p-1">
                            <button
                              className="btn btn-xs btn-outline-secondary px-2 py-0"
                              onClick={() => handleUpdateQuantity(idx, -1)}
                            >-</button>
                            <span className="px-2 fw-bold">{item.quantity}</span>
                            <button
                              className="btn btn-xs btn-outline-secondary px-2 py-0"
                              onClick={() => handleUpdateQuantity(idx, 1)}
                            >+</button>
                          </div>
                        </td>
                        <td className="text-end fw-bold text-dark font-monospace">
                          ₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-center">
                          <button className="btn btn-xs text-danger" onClick={() => handleRemoveItem(idx)}>
                            <BsTrashFill />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        <BsCartCheckFill size={48} className="mb-2 text-secondary opacity-50" />
                        <h6>Cart is Empty</h6>
                        <p className="small mb-0">Use the barcode scanner or type above to instantly add products.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Settlement & Tender Panel (5 Cols) */}
        <div className="col-lg-4">
          {/* Customer Selection */}
          <div className="dashboard-card-box p-3 mb-3">
            <label className="form-label small fw-bold text-muted text-uppercase mb-1">
              <BsPersonFill className="text-primary me-1" /> Customer Account
            </label>
            <select
              className="form-select mb-2"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="WALK_IN">Walk-in Counter Customer (Cash / Retail)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone || "No Phone"})</option>
              ))}
            </select>
          </div>

          {/* Payment Method Selector */}
          <div className="dashboard-card-box p-3 mb-3">
            <label className="form-label small fw-bold text-muted text-uppercase mb-2">Payment Settlement Mode</label>
            <div className="d-grid grid-template-columns-3 gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {[
                { id: 'CASH', label: 'Cash', icon: <BsCashStack /> },
                { id: 'UPI', label: 'UPI / QR', icon: <BsQrCode /> },
                { id: 'CARD', label: 'Card', icon: <BsCreditCard2FrontFill /> }
              ].map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  className={`btn py-2 d-flex flex-column align-items-center gap-1 ${
                    paymentMode === mode.id ? 'btn-primary' : 'btn-light border'
                  }`}
                  onClick={() => setPaymentMode(mode.id)}
                >
                  {mode.icon}
                  <span className="small fw-semibold">{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Cash Tender Chips */}
            {paymentMode === 'CASH' && (
              <div className="mt-3">
                <label className="form-label small text-muted fw-bold">Cash Received (₹)</label>
                <input
                  type="number"
                  className="form-control form-control-lg font-monospace fw-bold text-success mb-2"
                  placeholder="₹ 0.00"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                />
                <div className="d-flex gap-1 flex-wrap">
                  {[100, 200, 500, 1000, 2000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      className="btn btn-xs btn-outline-secondary px-2 py-1 small rounded-pill"
                      onClick={() => setCashTendered(amt.toString())}
                    >
                      +₹{amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="btn btn-xs btn-outline-primary px-2 py-1 small rounded-pill fw-bold"
                    onClick={() => setCashTendered(grandTotal.toString())}
                  >
                    Exact (₹{grandTotal})
                  </button>
                </div>

                {cashTendered && (
                  <div className="d-flex justify-content-between align-items-center mt-2 p-2 bg-light rounded border">
                    <span className="small fw-bold text-muted">Change to Return:</span>
                    <span className="fw-bold fs-6 text-primary font-monospace">₹{changeDue.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic UPI QR Code for Mobile Payment */}
            {paymentMode === 'UPI' && (
              <div className="text-center p-3 mt-3 bg-light border rounded-3">
                <BsQrCode size={110} className="text-dark mb-2" />
                <div className="small fw-bold text-dark">Scan & Pay ₹{grandTotal}</div>
                <div className="small text-muted">UPI ID: tsaritbilling@hdfcbank</div>
              </div>
            )}
          </div>

          {/* Bill Summary & Complete Checkout Button */}
          <div className="dashboard-card-box p-3 bg-light border">
            <div className="d-flex justify-content-between small text-muted mb-1">
              <span>Taxable Value:</span>
              <span>₹{taxableValue.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between small text-muted mb-1">
              <span>GST (CGST + SGST):</span>
              <span>₹{totalTax.toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="h5 fw-bold text-dark mb-0">Grand Total:</span>
              <span className="h3 fw-bold text-primary mb-0 font-monospace">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              className="btn-saas-primary w-100 py-3 fs-5 fw-bold d-flex justify-content-center align-items-center gap-2"
              onClick={handleCompleteSale}
              disabled={currentCart.items.length === 0}
            >
              <BsCheckCircleFill /> Complete & Print Bill [F2]
            </button>
          </div>
        </div>
      </div>

      {/* 58mm / 80mm Thermal Receipt Print Preview Modal */}
      {printModalOpen && lastCompletedBill && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content shadow-lg">
              <div className="modal-header py-2 bg-dark text-white">
                <h6 className="modal-title fw-bold">
                  <BsPrinterFill className="me-1" /> Thermal Receipt Slip
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setPrintModalOpen(false)}></button>
              </div>

              <div className="modal-body p-3 font-monospace small bg-white text-dark" id="thermal-receipt-area">
                <div className="text-center mb-2">
                  <h5 className="fw-bold mb-0">TSAR IT BILLING</h5>
                  <div>GSTIN: 36AAAAA0000A1Z5</div>
                  <div>Madhapur, Hyderabad, TS - 500081</div>
                  <div>Ph: +91 98765 43210</div>
                </div>
                <div className="border-top border-bottom py-1 mb-2">
                  <div>Bill No: <strong>{lastCompletedBill.invoiceId}</strong></div>
                  <div>Date: {lastCompletedBill.date}</div>
                  <div>Mode: {lastCompletedBill.paymentMode}</div>
                </div>

                <table className="w-100 mb-2 small">
                  <thead>
                    <tr className="border-bottom">
                      <th className="text-start">Item</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastCompletedBill.items.map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <div>{it.name}</div>
                          {(it.size || it.color || it.imei || it.batchNo || it.weight) && (
                            <div style={{ fontSize: '9px', color: '#555' }}>
                              {[
                                it.size && `Size:${it.size}`,
                                it.color && `${it.color}`,
                                it.imei && `IMEI:${it.imei}`,
                                it.batchNo && `Batch:${it.batchNo}`,
                                it.weight && `Wt:${it.weight}`
                              ].filter(Boolean).join(' | ')}
                            </div>
                          )}
                        </td>
                        <td className="text-center">{it.quantity}</td>
                        <td className="text-end">₹{it.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-top pt-1">
                  <div className="d-flex justify-content-between">
                    <span>Taxable Value:</span>
                    <span>₹{lastCompletedBill.subtotal ? (lastCompletedBill.subtotal / 1.18).toFixed(2) : 0}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>CGST + SGST (18%):</span>
                    <span>₹{(lastCompletedBill.cgst + lastCompletedBill.sgst).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold fs-6 border-top mt-1 pt-1">
                    <span>NET TOTAL:</span>
                    <span>₹{lastCompletedBill.totalAmount}</span>
                  </div>
                  {lastCompletedBill.paymentMode === 'CASH' && (
                    <>
                      <div className="d-flex justify-content-between text-muted">
                        <span>Tendered:</span>
                        <span>₹{lastCompletedBill.cashTendered}</span>
                      </div>
                      <div className="d-flex justify-content-between text-muted">
                        <span>Change Due:</span>
                        <span>₹{lastCompletedBill.changeDue.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-center mt-3 border-top pt-2">
                  <div className="small fw-bold">Thank You! Visit Again</div>
                  <div className="small text-muted">GST Compliant E-Bill</div>
                </div>
              </div>

              <div className="modal-footer py-2 d-flex justify-content-between align-items-center flex-wrap gap-1">
                <button className="btn btn-sm btn-secondary" onClick={() => setPrintModalOpen(false)}>Close</button>
                <div className="d-flex gap-1">
                  <button 
                    className="btn btn-sm btn-outline-dark"
                    onClick={() => printEnterpriseInvoice({
                      invoice: lastCompletedBill,
                      items: lastCompletedBill.items,
                      printSize: "58mm"
                    })}
                  >
                    58mm Slip
                  </button>
                  <button 
                    className="btn btn-sm btn-dark"
                    onClick={() => printEnterpriseInvoice({
                      invoice: lastCompletedBill,
                      items: lastCompletedBill.items,
                      printSize: "80mm"
                    })}
                  >
                    <BsPrinterFill className="me-1" /> 80mm Roll
                  </button>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => printEnterpriseInvoice({
                      invoice: lastCompletedBill,
                      items: lastCompletedBill.items,
                      printSize: "A4"
                    })}
                  >
                    A4 Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
