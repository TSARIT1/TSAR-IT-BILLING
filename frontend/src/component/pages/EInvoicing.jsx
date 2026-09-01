import React, { useState, useEffect } from "react";
import { 
  BsFileEarmarkCheckFill, 
  BsQrCode, 
  BsTruck, 
  BsShieldCheck, 
  BsXCircleFill, 
  BsCheckCircleFill, 
  BsPrinterFill,
  BsCloudArrowUpFill,
  BsArrowRight
} from "react-icons/bs";
import PortalLayout from "../PortalLayout";
import { getInvoices, generateEInvoiceIrn, generateEWayBill, cancelEInvoiceIrn } from "../../services/api";
import Swal from "sweetalert2";

export default function EInvoicing() {
  const [activeTab, setActiveTab] = useState("generate-irn");
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [irnResult, setIrnResult] = useState(null);
  const [ewbResult, setEwbResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // E-Way Bill form state
  const [ewbForm, setEwbForm] = useState({
    transporterName: "National Road Express Logistics",
    vehicleNo: "TS09EA9924",
    distanceKm: "120"
  });

  useEffect(() => {
    const fetchInv = async () => {
      try {
        const list = await getInvoices();
        if (Array.isArray(list) && list.length > 0) {
          setInvoices(list);
          setSelectedInvoiceId(list[0].invoiceId || "");
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchInv();
  }, []);

  const handleGenerateIrn = async () => {
    if (!selectedInvoiceId) {
      Swal.fire("Selection Required", "Please select an invoice to register with the IRP portal.", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await generateEInvoiceIrn(selectedInvoiceId);
      if (res && res.status === "GENERATED") {
        setIrnResult(res);
        Swal.fire({
          icon: "success",
          title: "IRN Generated Successfully!",
          text: `Invoice registered on government portal with IRN: ${res.irn.substring(0, 16)}...`
        });
      } else {
        Swal.fire("Registration Error", res?.message || "Failed to generate IRN.", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Server communication failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEwb = async () => {
    if (!selectedInvoiceId) {
      Swal.fire("Selection Required", "Please select an invoice.", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await generateEWayBill({
        invoiceId: selectedInvoiceId,
        transporterName: ewbForm.transporterName,
        vehicleNo: ewbForm.vehicleNo,
        distanceKm: ewbForm.distanceKm
      });
      if (res && res.status === "ACTIVE") {
        setEwbResult(res);
        Swal.fire({
          icon: "success",
          title: "E-Way Bill Generated!",
          text: `EWB No: ${res.ewayBillNo} valid for vehicle ${res.vehicleNo}`
        });
      }
    } catch (e) {
      Swal.fire("Error", "Failed to generate E-Way bill.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelIrn = async () => {
    if (!irnResult || !irnResult.irn) {
      Swal.fire("No Active IRN", "Please generate or select an active IRN first.", "info");
      return;
    }

    const { value: reason } = await Swal.fire({
      title: "Cancel IRP Registration?",
      text: "Provide standard government cancellation reason within 24 hours of generation:",
      input: "select",
      inputOptions: {
        "1": "Duplicate Bill Entry",
        "2": "Order Cancelled by Buyer",
        "3": "Data Entry Typo Error",
        "4": "Other Operational Issue"
      },
      inputPlaceholder: "Select a reason",
      showCancelButton: true
    });

    if (reason) {
      setLoading(true);
      await cancelEInvoiceIrn(selectedInvoiceId, irnResult.irn, reason);
      setIrnResult(prev => ({ ...prev, status: "CANCELLED" }));
      setLoading(false);
      Swal.fire("Cancelled", "IRN has been successfully cancelled on the IRP portal.", "success");
    }
  };

  return (
    <PortalLayout title="Government E-Invoicing & E-Way Bill Gateway">
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 animate-fade-in">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            <BsFileEarmarkCheckFill className="me-2 text-primary" /> NIC E-Invoice & E-Way Bill Management
          </h4>
          <p className="text-muted small mb-0">
            Direct real-time integration with authorized GSTN Invoice Registration Portals (IRP) for B2B compliance.
          </p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-success-subtle text-success border border-success px-3 py-2 d-flex align-items-center gap-1">
            <BsShieldCheck /> NIC Gateway Active (256-bit SSL)
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom pb-2">
        <button
          className={`btn btn-sm ${activeTab === 'generate-irn' ? 'btn-primary' : 'btn-light border'} px-3 py-2 rounded-3 fw-semibold`}
          onClick={() => setActiveTab('generate-irn')}
        >
          <BsQrCode className="me-2" /> 1. Generate E-Invoice (IRN & QR)
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'generate-ewb' ? 'btn-primary' : 'btn-light border'} px-3 py-2 rounded-3 fw-semibold`}
          onClick={() => setActiveTab('generate-ewb')}
        >
          <BsTruck className="me-2" /> 2. Generate E-Way Bill (Part A & B)
        </button>
      </div>

      {/* 1. GENERATE IRN TAB */}
      {activeTab === 'generate-irn' && (
        <div className="row g-4 animate-fade-in">
          {/* Left Form */}
          <div className="col-lg-5">
            <div className="dashboard-card-box">
              <h5 className="fw-bold mb-3">Select B2B Sales Invoice</h5>
              
              <div className="mb-3">
                <label className="form-label small fw-bold">Tax Invoice Number</label>
                <select 
                  className="form-select"
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                >
                  {invoices.map((inv, idx) => (
                    <option key={idx} value={inv.invoiceId}>
                      {inv.invoiceId} - {inv.customerName || "Customer"} (₹ {Number(inv.totalAmount || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                  {invoices.length === 0 && <option value="INV-2026-DEMO">INV-2026-DEMO (Apex Global - ₹ 48,500)</option>}
                </select>
              </div>

              <div className="alert alert-info py-2 px-3 small rounded-3 mb-3">
                <strong>IRP Requirement:</strong> Invoices with B2B GSTINs will have automatic 64-character hash tokens and Signed QR codes generated.
              </div>

              <button 
                className="btn-saas-primary w-100 py-3"
                onClick={handleGenerateIrn}
                disabled={loading}
              >
                <BsCloudArrowUpFill /> {loading ? "Communicating with NIC..." : "Register & Generate IRN"}
              </button>
            </div>
          </div>

          {/* Right Live IRN Card */}
          <div className="col-lg-7">
            <div className="dashboard-card-box">
              <h5 className="fw-bold mb-3">Government IRP Registration Status</h5>

              {irnResult ? (
                <div className="p-3 bg-light border rounded-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-success-subtle text-success fs-6 px-3 py-1">
                      <BsCheckCircleFill className="me-1" /> Status: {irnResult.status}
                    </span>
                    <span className="small text-muted">Ack No: <strong>{irnResult.ackNo}</strong></span>
                  </div>

                  <div className="mb-3">
                    <label className="small text-muted fw-bold">Invoice Reference Number (IRN):</label>
                    <div className="p-2 bg-white border rounded font-monospace small text-break text-primary fw-bold">
                      {irnResult.irn}
                    </div>
                  </div>

                  <div className="row align-items-center mb-3">
                    <div className="col-auto">
                      <div className="p-2 bg-white border rounded text-center" style={{ width: '110px' }}>
                        <BsQrCode size={90} className="text-dark" />
                      </div>
                    </div>
                    <div className="col">
                      <h6 className="fw-bold mb-1">Digitally Signed QR Code</h6>
                      <p className="small text-muted mb-1">Contains Seller/Buyer GSTINs, Document Number, Date, and Taxable Value.</p>
                      <span className="badge bg-primary-subtle text-primary">IRP Ack Date: {irnResult.ackDate}</span>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => alert('Printing e-invoice with signed QR code.')}>
                      <BsPrinterFill className="me-1" /> Print Signed E-Invoice
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={handleCancelIrn}>
                      <BsXCircleFill className="me-1" /> Cancel IRN
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <BsQrCode size={48} className="mb-3 text-secondary" />
                  <p>Select an invoice on the left and click <strong>Register & Generate IRN</strong> to generate live government e-invoices.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. GENERATE E-WAY BILL TAB */}
      {activeTab === 'generate-ewb' && (
        <div className="row g-4 animate-fade-in">
          <div className="col-lg-6">
            <div className="dashboard-card-box">
              <h5 className="fw-bold mb-3">E-Way Bill Logistics Information</h5>

              <div className="mb-3">
                <label className="form-label small fw-bold">Transporter / Carrier Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={ewbForm.transporterName}
                  onChange={(e) => setEwbForm({ ...ewbForm, transporterName: e.target.value })}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Vehicle Number (Part-B)</label>
                  <input 
                    type="text" 
                    className="form-control font-monospace" 
                    value={ewbForm.vehicleNo}
                    onChange={(e) => setEwbForm({ ...ewbForm, vehicleNo: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Approx. Distance (Km)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={ewbForm.distanceKm}
                    onChange={(e) => setEwbForm({ ...ewbForm, distanceKm: e.target.value })}
                  />
                </div>
              </div>

              <button 
                className="btn-saas-primary w-100 py-3"
                onClick={handleGenerateEwb}
                disabled={loading}
              >
                <BsTruck /> {loading ? "Generating E-Way Bill..." : "Generate Part-A & Part-B E-Way Bill"}
              </button>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="dashboard-card-box">
              <h5 className="fw-bold mb-3">Generated E-Way Bill Status</h5>

              {ewbResult ? (
                <div className="p-3 bg-light border rounded-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-success-subtle text-success fs-6 px-3 py-1">
                      <BsCheckCircleFill className="me-1" /> Active EWB
                    </span>
                    <span className="small text-muted">Valid Upto: <strong>{ewbResult.validUpto}</strong></span>
                  </div>

                  <div className="mb-2">
                    <label className="small text-muted">E-Way Bill Number (EWB No):</label>
                    <h4 className="fw-bold font-monospace text-primary">{ewbResult.ewayBillNo}</h4>
                  </div>

                  <div className="p-2 bg-white border rounded small mb-3">
                    <div><strong>Vehicle:</strong> {ewbResult.vehicleNo}</div>
                    <div><strong>Transporter:</strong> {ewbResult.transporterName}</div>
                    <div><strong>Generated Date:</strong> {ewbResult.ewayBillDate}</div>
                  </div>

                  <button className="btn btn-sm btn-outline-primary" onClick={() => alert('Printing official government 2-page E-Way Bill challan.')}>
                    <BsPrinterFill className="me-1" /> Print E-Way Bill (PDF)
                  </button>
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <BsTruck size={48} className="mb-3 text-secondary" />
                  <p>Fill in carrier logistics details and click <strong>Generate E-Way Bill</strong>.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
