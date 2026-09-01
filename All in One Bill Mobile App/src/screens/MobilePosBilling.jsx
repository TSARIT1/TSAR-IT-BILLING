import React, { useState } from "react";
import { Link } from "react-router-dom";
import MobileNavigation from "../components/MobileNavigation";
import { AutoSyncService } from "../services/autoSyncService";
import { NativeBridge } from "../services/nativeBridge";
import { 
  BsShop, 
  BsSearch, 
  BsTrash3, 
  BsPrinterFill, 
  BsWhatsapp, 
  BsQrCodeScan, 
  BsCheckCircleFill, 
  BsArrowLeft 
} from "react-icons/bs";

export default function MobilePosBilling() {
  const [selectedSector] = useState(
    localStorage.getItem("tsar_selected_sector") || "general"
  );

  const sampleProducts = [
    { id: 1, name: "Premium Basmati Rice (1kg)", barcode: "890123456001", price: 120.00, stock: 45, unit: "KG", gst: 5 },
    { id: 2, name: "Cotton Slim Shirt (L)", barcode: "890123456002", price: 899.00, stock: 18, unit: "PCS", gst: 5, size: "L", color: "Navy Blue" },
    { id: 3, name: "NPK 19:19:19 Fertilizer (50kg)", barcode: "890123456003", price: 2050.00, stock: 120, unit: "BAG", gst: 5, npk: "19:19:19" },
    { id: 4, name: "Samsung Galaxy A15 (128GB)", barcode: "890123456004", price: 13999.00, stock: 6, unit: "PCS", gst: 18, imeiRequired: true }
  ];

  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("Walk-in Cash Customer");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [searchTerm, setSearchTerm] = useState("");

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1, enteredImei: product.imeiRequired ? "864201045981234" : "" }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalGst = totalAmount * 0.05; // 5% standard

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const invoiceData = {
      invoiceNumber: `POS-M-${Date.now().toString().slice(-6)}`,
      customerName,
      paymentMode,
      items: cart,
      subtotal: totalAmount,
      gstAmount: totalGst,
      grandTotal: totalAmount,
      date: new Date().toISOString(),
      sector: selectedSector
    };

    // Queue in offline storage & attempt auto-sync
    AutoSyncService.queueOfflineAction("INVOICE", "CREATE", invoiceData);
    AutoSyncService.performFullSync();

    // Trigger Bluetooth Thermal Receipt Print
    NativeBridge.printThermalReceipt({
      header: "TSAR IT ENTERPRISE POS",
      billNo: invoiceData.invoiceNumber,
      total: invoiceData.grandTotal,
      mode: invoiceData.paymentMode
    });

    // Reset Cart
    setCart([]);
    NativeBridge.showToast(`Bill #${invoiceData.invoiceNumber} Created & Printed!`);
  };

  return (
    <div className="mobile-app-shell pb-5 mb-4">
      {/* Top Header */}
      <header className="mobile-header p-3 bg-dark text-white d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <Link to="/" className="text-white fs-5"><BsArrowLeft /></Link>
          <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
            <BsShop className="text-warning" /> Mobile POS Billing
          </h6>
        </div>
        <span className="badge bg-warning text-dark fw-bold">Sector: {selectedSector.toUpperCase()}</span>
      </header>

      <main className="p-3">
        {/* Customer Input */}
        <div className="mb-2">
          <input 
            type="text" 
            className="form-control form-control-sm bg-white border shadow-sm"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer Name / Mobile No"
          />
        </div>

        {/* Product Search & Barcode Button */}
        <div className="input-group mb-3 shadow-sm">
          <span className="input-group-text bg-white border-end-0"><BsSearch className="text-muted" /></span>
          <input 
            type="text" 
            className="form-control form-control-sm border-start-0 border-end-0 bg-white"
            placeholder="Search item name or scan barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className="btn btn-dark btn-sm d-flex align-items-center gap-1"
            onClick={() => {
              // Simulate Camera Barcode Scanner
              const scanned = sampleProducts[0];
              addToCart(scanned);
              NativeBridge.showToast(`Scanned: ${scanned.name}`);
            }}
          >
            <BsQrCodeScan /> Scan
          </button>
        </div>

        {/* Quick Item Grid */}
        <div className="row g-2 mb-3">
          {sampleProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((prod) => (
            <div key={prod.id} className="col-6">
              <div 
                className="card border shadow-sm rounded-3 p-2 bg-white h-100 cursor-pointer"
                onClick={() => addToCart(prod)}
              >
                <div className="fw-bold small text-truncate text-dark">{prod.name}</div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <span className="text-primary fw-bold small">₹{prod.price}</span>
                  <span className="badge bg-light text-secondary border" style={{ fontSize: '10px' }}>+{prod.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Cart */}
        <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-3">
          <h6 className="fw-bold small text-uppercase text-muted mb-2 d-flex justify-content-between">
            <span>Bill Items ({cart.length})</span>
            <span>Subtotal: ₹{totalAmount.toFixed(2)}</span>
          </h6>

          {cart.length === 0 ? (
            <div className="text-center py-3 text-muted small">Cart is empty. Tap items above to add.</div>
          ) : (
            <div className="d-flex flex-column gap-2 mb-2">
              {cart.map((item) => (
                <div key={item.id} className="d-flex justify-content-between align-items-center p-2 bg-light rounded border small">
                  <div>
                    <div className="fw-bold text-dark">{item.name}</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>
                      ₹{item.price} × {item.qty} = ₹{(item.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-sm btn-outline-danger p-1" onClick={() => removeFromCart(item.id)}>
                      <BsTrash3 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payment Mode Selector */}
          <div className="btn-group w-100 my-2" role="group">
            <button 
              type="button" 
              className={`btn btn-sm ${paymentMode === 'CASH' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setPaymentMode('CASH')}
            >
              💵 Cash
            </button>
            <button 
              type="button" 
              className={`btn btn-sm ${paymentMode === 'UPI' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setPaymentMode('UPI')}
            >
              📱 UPI QR
            </button>
            <button 
              type="button" 
              className={`btn btn-sm ${paymentMode === 'CARD' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setPaymentMode('CARD')}
            >
              💳 Card
            </button>
          </div>

          {/* Checkout & Print Button */}
          <button 
            className="btn btn-success w-100 py-3 mt-2 fw-bold d-flex justify-content-between align-items-center shadow rounded-3"
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            <span className="d-flex align-items-center gap-2">
              <BsPrinterFill /> Print & Save Bill
            </span>
            <span className="fs-6">₹{totalAmount.toFixed(2)}</span>
          </button>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
