import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MobileNavigation from "../components/MobileNavigation";
import { AutoSyncService } from "../services/autoSyncService";
import { 
  BsShop, 
  BsPlusLg, 
  BsReceipt, 
  BsArrowRepeat, 
  BsBoxSeam, 
  BsPeopleFill, 
  BsShieldCheck,
  BsCloudCheckFill
} from "react-icons/bs";

export default function MobileDashboard() {
  const [selectedSector, setSelectedSector] = useState(
    localStorage.getItem("tsar_selected_sector") || "general"
  );
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const businessName = JSON.parse(localStorage.getItem("user") || "{}").businessName || "TSAR IT Billing";

  useEffect(() => {
    const queue = AutoSyncService.getPendingQueue();
    setPendingSyncCount(queue.length);
  }, []);

  const sectors = [
    { key: "general", label: "General Retail & Wholesale", icon: "🏢" },
    { key: "agro", label: "Fertilizers, Seeds & Agro", icon: "🌾" },
    { key: "garments", label: "Clothing & Garments", icon: "👗" },
    { key: "electronics", label: "Electronics & Mobiles (IMEI)", icon: "📱" },
    { key: "transport", label: "Transport & Waybills", icon: "🚛" },
    { key: "supermarket", label: "Supermarket & FMCG", icon: "🛒" },
    { key: "pharmacy", label: "Pharmacy & Medical", icon: "💊" }
  ];

  const handleSectorChange = (sectorKey) => {
    setSelectedSector(sectorKey);
    localStorage.setItem("tsar_selected_sector", sectorKey);
  };

  return (
    <div className="mobile-app-shell pb-5 mb-4">
      {/* Top Mobile App Header */}
      <header className="mobile-header p-3 bg-dark text-white d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <div className="mobile-logo-badge">PRO</div>
          <div>
            <h6 className="mb-0 fw-bold">{businessName}</h6>
            <span className="small text-muted" style={{ fontSize: "11px" }}>TSAR IT Enterprise Mobile</span>
          </div>
        </div>
        <Link to="/sync" className="badge bg-primary text-white d-flex align-items-center gap-1 text-decoration-none px-2 py-1">
          <BsCloudCheckFill /> {pendingSyncCount > 0 ? `${pendingSyncCount} Offline` : "Synced"}
        </Link>
      </header>

      <main className="p-3">
        {/* Sector Switcher Pill Bar */}
        <div className="mb-3">
          <label className="small fw-bold text-muted text-uppercase mb-1">Active Indian Sector</label>
          <select 
            className="form-select form-select-sm bg-white border shadow-sm fw-semibold"
            value={selectedSector}
            onChange={(e) => handleSectorChange(e.target.value)}
          >
            {sectors.map(s => (
              <option key={s.key} value={s.key}>{s.icon} {s.label}</option>
            ))}
          </select>
        </div>

        {/* Quick Action Large Buttons */}
        <div className="row g-2 mb-3">
          <div className="col-6">
            <Link to="/pos" className="btn btn-warning w-100 py-3 d-flex flex-column align-items-center justify-content-center shadow-sm rounded-3 fw-bold text-dark text-decoration-none">
              <BsShop className="fs-3 mb-1" />
              <span>POS Billing</span>
              <span className="badge bg-dark text-warning small mt-1" style={{ fontSize: '10px' }}>Fast Checkout</span>
            </Link>
          </div>
          <div className="col-6">
            <Link to="/create-invoice" className="btn btn-primary w-100 py-3 d-flex flex-column align-items-center justify-content-center shadow-sm rounded-3 fw-bold text-white text-decoration-none">
              <BsPlusLg className="fs-3 mb-1" />
              <span>New GST Bill</span>
              <span className="badge bg-white text-primary small mt-1" style={{ fontSize: '10px' }}>Tax Invoice</span>
            </Link>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="row g-2 mb-3">
          <div className="col-6">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <span className="text-muted small fw-bold">TODAY'S SALES</span>
              <h5 className="fw-bold text-primary mb-0 mt-1">₹42,850</h5>
              <span className="text-success small" style={{ fontSize: '10px' }}>+12% vs Yesterday</span>
            </div>
          </div>
          <div className="col-6">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <span className="text-muted small fw-bold">RECEIVABLES</span>
              <h5 className="fw-bold text-danger mb-0 mt-1">₹1,18,400</h5>
              <span className="text-muted small" style={{ fontSize: '10px' }}>14 Pending Bills</span>
            </div>
          </div>
        </div>

        {/* Sector Specific Fast Tiles */}
        <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-3">
          <h6 className="fw-bold mb-2 small text-uppercase text-muted">
            {sectors.find(s => s.key === selectedSector)?.icon} {sectors.find(s => s.key === selectedSector)?.label} Features
          </h6>
          <div className="row g-2">
            {selectedSector === "agro" && (
              <>
                <div className="col-6"><span className="badge bg-light text-dark border p-2 w-100">NPK Formulation %</span></div>
                <div className="col-6"><span className="badge bg-light text-dark border p-2 w-100">Seed/Fertilizer License</span></div>
                <div className="col-12"><span className="badge bg-light text-dark border p-2 w-100">Farmer Aadhaar & KCC Invoicing</span></div>
              </>
            )}
            {selectedSector === "garments" && (
              <>
                <div className="col-6"><span className="badge bg-light text-dark border p-2 w-100">Size Matrix (XS-3XL)</span></div>
                <div className="col-6"><span className="badge bg-light text-dark border p-2 w-100">Color Swatches</span></div>
                <div className="col-12"><span className="badge bg-light text-dark border p-2 w-100">Dual GST 5%/12% Slabs</span></div>
              </>
            )}
            {selectedSector === "electronics" && (
              <>
                <div className="col-6"><span className="badge bg-light text-dark border p-2 w-100">Dual IMEI Tracking</span></div>
                <div className="col-6"><span className="badge bg-light text-dark border p-2 w-100">Brand Warranty (Mo)</span></div>
                <div className="col-12"><span className="badge bg-light text-dark border p-2 w-100">Technician Repair Sheets</span></div>
              </>
            )}
            {selectedSector === "transport" && (
              <>
                <div className="col-6"><span className="badge bg-light text-dark border p-2 w-100">LR / Bilty Generator</span></div>
                <div className="col-6"><span className="badge bg-light text-dark border p-2 w-100">Vehicle No & Driver</span></div>
                <div className="col-12"><span className="badge bg-light text-dark border p-2 w-100">12-Digit E-Way Bill Dispatch</span></div>
              </>
            )}
            {(selectedSector === "general" || selectedSector === "supermarket" || selectedSector === "pharmacy") && (
              <>
                <div className="col-6"><span className="badge bg-light text-dark border p-2 w-100">Barcode Scanning</span></div>
                <div className="col-6"><span className="badge bg-light text-dark border p-2 w-100">Weighing Scale (g/kg)</span></div>
                <div className="col-12"><span className="badge bg-light text-dark border p-2 w-100">58mm / 80mm Bluetooth Print</span></div>
              </>
            )}
          </div>
        </div>

        {/* Quick Links Navigation List */}
        <div className="list-group shadow-sm border-0 rounded-3">
          <Link to="/items" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3">
            <div className="d-flex align-items-center gap-2">
              <BsBoxSeam className="text-primary fs-5" />
              <span className="fw-semibold">Inventory & Godowns</span>
            </div>
            <span className="badge bg-light text-secondary border">248 Items</span>
          </Link>
          <Link to="/parties" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3">
            <div className="d-flex align-items-center gap-2">
              <BsPeopleFill className="text-success fs-5" />
              <span className="fw-semibold">Customers & Suppliers</span>
            </div>
            <span className="badge bg-light text-secondary border">86 Parties</span>
          </Link>
          <Link to="/sync" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3">
            <div className="d-flex align-items-center gap-2">
              <BsArrowRepeat className="text-info fs-5" />
              <span className="fw-semibold">Auto-Sync & Offline Center</span>
            </div>
            <span className="badge bg-success-subtle text-success border">Active</span>
          </Link>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
