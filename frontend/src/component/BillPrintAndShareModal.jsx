import React, { useState, useEffect } from "react";
import {
  BsPrinterFill,
  BsBluetooth,
  BsWifi,
  BsFileEarmarkPdfFill,
  BsWhatsapp,
  BsCheckCircleFill,
  BsGearFill
} from "react-icons/bs";
import { printEnterpriseInvoice } from "../utils/invoicePrintUtil";
import { downloadSalesSlip, downloadInvoiceSalesSlip, downloadPurchaseInvoicePdf } from "../services/api";
import Swal from "sweetalert2";

export default function BillPrintAndShareModal({
  isOpen,
  onClose,
  billData = {},
  items = [],
  merchantProfile = {}
}) {
  const [pairedPrinters, setPairedPrinters] = useState([]);
  const [selectedPrinterMac, setSelectedPrinterMac] = useState("");
  const [networkPrinterIp, setNetworkPrinterIp] = useState(
    localStorage.getItem("tsar_printer_ip") || "192.168.1.100"
  );
  const [networkPort, setNetworkPort] = useState("9100");
  const [showNetworkSettings, setShowNetworkSettings] = useState(false);
  const [printingStatus, setPrintingStatus] = useState("");

  const saleId = billData.saleId || billData.id;
  const invoiceId = saleId ? null : billData.invoiceId;
  const billNo = billData.invoiceId || saleId || "Not saved";
  const businessId = merchantProfile.userBusinessId || merchantProfile.businessId ||
    localStorage.getItem("userBusinessId") || localStorage.getItem("businessId") || undefined;
  const totalAmt = billData.totalAmount || billData.total || 0;
  const customerName = billData.customerName || billData.party || "Walk-In Customer";
  const customerPhone = billData.customerPhone || billData.mobile || "";

  useEffect(() => {
    if (isOpen && window.AndroidNative && window.AndroidNative.getPairedBluetoothPrinters) {
      try {
        const jsonStr = window.AndroidNative.getPairedBluetoothPrinters();
        const list = JSON.parse(jsonStr || "[]");
        setPairedPrinters(list);
        if (list.length > 0 && !selectedPrinterMac) {
          setSelectedPrinterMac(list[0].address);
        }
      } catch (e) {
        console.error("Failed to parse paired Bluetooth printers:", e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const savePdf = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fetch protected PDFs with the session token before downloading the blob.
  const handleDownloadSlipPdf = async () => {
    try {
      if (!saleId && !invoiceId) throw new Error("This bill has no saved ID. Open the saved bill from Sales Invoices.");
      const blob = saleId
        ? await downloadSalesSlip(saleId, businessId)
        : await downloadInvoiceSalesSlip(invoiceId, businessId);
      savePdf(blob, `Slip_${billNo}.pdf`);
    } catch (error) {
      Swal.fire("PDF download failed", error?.message || "Unable to download this bill. Please try again.", "error");
    }
  };

  // 2. Download Official Full A4 GST Invoice PDF
  const handleDownloadFullPdf = async () => {
    if (!invoiceId) {
      printEnterpriseInvoice({ invoice: billData, items: items.length ? items : (billData.items || []), business: merchantProfile, printSize: "A4" });
      return;
    }
    try {
      const blob = await downloadPurchaseInvoicePdf(invoiceId, businessId);
      savePdf(blob, `Invoice_${billNo}.pdf`);
    } catch (error) {
      Swal.fire("PDF download failed", error?.message || "Unable to download this invoice. Please try again.", "error");
    }
  };

  // 3. Standard / System Print
  const handleSystemPrint = () => {
    if (window.AndroidNative && window.AndroidNative.printSystemDocument) {
      window.AndroidNative.printSystemDocument(`Bill_${billNo}`);
    } else {
      printEnterpriseInvoice({
        invoice: billData,
        items: items.length > 0 ? items : (billData.items || []),
        business: merchantProfile,
        printSize: "A4"
      });
    }
  };

  // 4. Bluetooth Thermal Print (58mm / 80mm ESC/POS)
  const handleBluetoothPrint = async () => {
    setPrintingStatus("Connecting to Bluetooth Thermal Printer...");

    const receiptPayload = {
      businessName: merchantProfile.businessName || "TSAR IT BILLING",
      address: [merchantProfile.address, merchantProfile.city].filter(Boolean).join(", "),
      phone: merchantProfile.phoneNo || merchantProfile.mobile || "",
      gstin: merchantProfile.gstNo || merchantProfile.gstin || "",
      invoiceId: billNo,
      date: billData.date || new Date().toLocaleDateString("en-IN"),
      totalAmount: Number(totalAmt).toFixed(2),
      items: (items.length > 0 ? items : (billData.items || [])).map(it => ({
        name: it.productName || it.name || it.itemName || "Item",
        quantity: it.quantity || it.qty || 1,
        total: (Number(it.price || it.unitPrice || 0) * Number(it.quantity || it.qty || 1)).toFixed(2)
      }))
    };

    // Case A: Running in Android App
    if (window.AndroidNative && window.AndroidNative.printBluetoothThermal) {
      try {
        window.AndroidNative.printBluetoothThermal(selectedPrinterMac, JSON.stringify(receiptPayload));
        setPrintingStatus("Sent to Bluetooth printer via Android!");
        setTimeout(() => setPrintingStatus(""), 3000);
        return;
      } catch (e) {
        console.error("Android Bluetooth print error:", e);
      }
    }

    // Case B: In Web Browser with Web Bluetooth API
    if (navigator.bluetooth) {
      try {
        setPrintingStatus("Pairing with Web Bluetooth Printer...");
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            "000018f0-0000-1000-8000-00805f9b34fb",
            "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
            "49535343-fe7d-4ae5-8fa9-9fafd205e455",
            0xFFE0
          ]
        });
        const server = await device.gatt.connect();
        setPrintingStatus(`Connected to ${device.name}! Printing...`);

        // Convert simple text receipt to array buffer
        const receiptText = `\x1B\x40\x1B\x61\x01${receiptPayload.businessName}\n${receiptPayload.phone}\n--------------------------------\n\x1B\x61\x00Bill: ${billNo}\nTotal: Rs. ${receiptPayload.totalAmount}\n--------------------------------\nThank You! Visit Again\n\n\n\n\x1D\x56\x42\x00`;
        const encoder = new TextEncoder();
        const data = encoder.encode(receiptText);

        const services = await server.getPrimaryServices();
        let sent = false;
        for (const s of services) {
          try {
            const characteristics = await s.getCharacteristics();
            for (const c of characteristics) {
              if (c.properties.write || c.properties.writeWithoutResponse) {
                await c.writeValue(data);
                sent = true;
                break;
              }
            }
          } catch (_) {}
          if (sent) break;
        }

        setPrintingStatus("Bluetooth print complete!");
        Swal.fire({
          icon: "success",
          title: "Printed Successfully",
          text: `Bill sent to ${device.name}`,
          timer: 2000,
          showConfirmButton: false
        });
        setTimeout(() => setPrintingStatus(""), 3000);
        return;
      } catch (e) {
        setPrintingStatus("");
        Swal.fire({
          icon: "info",
          title: "Bluetooth Connection",
          text: e.message || "Could not connect to Bluetooth device."
        });
        return;
      }
    }

    // Fallback if neither is available: open 58mm thermal print window
    printEnterpriseInvoice({
      invoice: billData,
      items: items.length > 0 ? items : (billData.items || []),
      business: merchantProfile,
      printSize: "58mm"
    });
    setPrintingStatus("");
  };

  // 5. WiFi / Network ESC/POS Print (Port 9100)
  const handleNetworkPrint = async () => {
    localStorage.setItem("tsar_printer_ip", networkPrinterIp);
    setPrintingStatus(`Sending to WiFi Printer (${networkPrinterIp}:${networkPort})...`);

    const receiptPayload = {
      businessName: merchantProfile.businessName || "TSAR IT BILLING",
      address: [merchantProfile.address, merchantProfile.city].filter(Boolean).join(", "),
      phone: merchantProfile.phoneNo || merchantProfile.mobile || "",
      gstin: merchantProfile.gstNo || merchantProfile.gstin || "",
      invoiceId: billNo,
      date: billData.date || new Date().toLocaleDateString("en-IN"),
      totalAmount: Number(totalAmt).toFixed(2),
      items: (items.length > 0 ? items : (billData.items || [])).map(it => ({
        name: it.productName || it.name || it.itemName || "Item",
        quantity: it.quantity || it.qty || 1,
        total: (Number(it.price || it.unitPrice || 0) * Number(it.quantity || it.qty || 1)).toFixed(2)
      }))
    };

    // Case A: In Android App
    if (window.AndroidNative && window.AndroidNative.printNetworkThermal) {
      try {
        window.AndroidNative.printNetworkThermal(
          networkPrinterIp,
          parseInt(networkPort) || 9100,
          JSON.stringify(receiptPayload)
        );
        setPrintingStatus("Print command sent to WiFi printer!");
        setTimeout(() => setPrintingStatus(""), 3000);
        return;
      } catch (e) {
        console.error("Android WiFi print error:", e);
      }
    }

    // Case B: Via Backend Relay
    try {
      const resp = await fetch("/api/printers/network-print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printerIp: networkPrinterIp,
          port: parseInt(networkPort) || 9100,
          content: `${receiptPayload.businessName}\nPh: ${receiptPayload.phone}\n--------------------------------\nBill: ${billNo}\nCustomer: ${customerName}\nTotal Amount: Rs. ${receiptPayload.totalAmount}\n--------------------------------\nThank You! Visit Again\n`
        })
      });
      const data = await resp.json();
      if (data.status === "SUCCESS") {
        setPrintingStatus("WiFi Print Completed!");
        Swal.fire({
          icon: "success",
          title: "WiFi Print Successful",
          text: `Bill sent to ${networkPrinterIp}`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error(data.message || "Failed to print to network printer");
      }
    } catch (e) {
      setPrintingStatus("");
      Swal.fire({
        icon: "warning",
        title: "WiFi Printer",
        text: `Unable to reach ${networkPrinterIp}:${networkPort}. Verify the printer is on the same local network.`
      });
    }
  };

  // 6. Share on WhatsApp
  const handleWhatsAppShare = () => {
    const summary = `*${merchantProfile.businessName || "TSAR IT Billing"}*\n` +
      `Bill No: ${billNo}\n` +
      `Date: ${billData.date || new Date().toLocaleDateString("en-IN")}\n` +
      `Customer: ${customerName}\n` +
      `*Total Amount: Rs. ${Number(totalAmt).toFixed(2)}*\n\n` +
      `Thank you for your business!`;

    if (window.AndroidNative && window.AndroidNative.shareInvoiceWhatsApp) {
      window.AndroidNative.shareInvoiceWhatsApp(summary, "");
    } else {
      const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
      const waUrl = cleanPhone.length >= 10
        ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(summary)}`
        : `https://wa.me/?text=${encodeURIComponent(summary)}`;
      window.open(waUrl, "_blank");
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 1060 }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-primary text-white py-3 px-4">
            <div className="d-flex align-items-center gap-2">
              <BsCheckCircleFill className="fs-4 text-warning" />
              <div>
                <h5 className="modal-title fw-bold mb-0">Bill Generated Successfully!</h5>
                <small className="opacity-75">Bill #{billNo} • Rs. {Number(totalAmt).toFixed(2)}</small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4 bg-light">
            {printingStatus && (
              <div className="alert alert-info py-2 d-flex align-items-center gap-2 mb-3">
                <div className="spinner-border spinner-border-sm" role="status"></div>
                <span className="small fw-semibold">{printingStatus}</span>
              </div>
            )}

            <div className="row g-3">
              {/* Left Column: Bill Summary Card */}
              <div className="col-md-5">
                <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white">
                  <h6 className="fw-bold text-muted text-uppercase small mb-3 border-bottom pb-2">Invoice Summary</h6>
                  <div className="mb-2">
                    <small className="text-muted d-block">Store / Merchant</small>
                    <span className="fw-semibold">{merchantProfile.businessName || "Merchant Store"}</span>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted d-block">Customer</small>
                    <span className="fw-semibold">{customerName}</span>
                    {customerPhone && <span className="text-muted small"> ({customerPhone})</span>}
                  </div>
                  <div className="mb-2">
                    <small className="text-muted d-block">Items Count</small>
                    <span className="fw-semibold">{(items.length > 0 ? items : (billData.items || [])).length} items</span>
                  </div>
                  <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-muted">Grand Total</span>
                    <span className="fs-5 fw-bold text-success">Rs. {Number(totalAmt).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Print & Connection Actions */}
              <div className="col-md-7">
                <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
                  <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
                    <span>Print, Download & Share Hub</span>
                    <button 
                      className="btn btn-sm btn-link text-decoration-none p-0 text-secondary"
                      onClick={() => setShowNetworkSettings(!showNetworkSettings)}
                    >
                      <BsGearFill className="me-1" /> WiFi Setup
                    </button>
                  </h6>

                  {/* Network Printer Settings Panel (Collapsible) */}
                  {showNetworkSettings && (
                    <div className="bg-light p-3 rounded-3 mb-3 border">
                      <div className="fw-bold small text-primary mb-2 d-flex align-items-center gap-1">
                        <BsWifi /> Network / WiFi Thermal Printer Setup
                      </div>
                      <div className="row g-2">
                        <div className="col-8">
                          <label className="form-label small mb-1">Printer IP Address</label>
                          <input 
                            type="text" 
                            className="form-control form-control-sm"
                            value={networkPrinterIp}
                            onChange={(e) => setNetworkPrinterIp(e.target.value)}
                            placeholder="192.168.1.100"
                          />
                        </div>
                        <div className="col-4">
                          <label className="form-label small mb-1">Port</label>
                          <input 
                            type="text" 
                            className="form-control form-control-sm"
                            value={networkPort}
                            onChange={(e) => setNetworkPort(e.target.value)}
                            placeholder="9100"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Grid */}
                  <div className="d-grid gap-2">
                    {/* 1. PDF Slip Download */}
                    <button 
                      className="btn btn-outline-primary d-flex align-items-center justify-content-between py-2 px-3 rounded-3"
                      onClick={handleDownloadSlipPdf}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <BsFileEarmarkPdfFill className="fs-5 text-danger" />
                        <div className="text-start">
                          <div className="fw-bold small text-dark">Download PDF Slip</div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>Official thermal slip with logo & user info</div>
                        </div>
                      </div>
                      <span className="badge bg-primary-subtle text-primary rounded-pill">PDF</span>
                    </button>

                    {/* 2. Full A4 GST Invoice */}
                    <button 
                      className="btn btn-outline-secondary d-flex align-items-center justify-content-between py-2 px-3 rounded-3"
                      onClick={handleDownloadFullPdf}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <BsFileEarmarkPdfFill className="fs-5 text-primary" />
                        <div className="text-start">
                          <div className="fw-bold small text-dark">{invoiceId ? "Full A4 GST Tax Invoice" : "Print / Save A4 Invoice"}</div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>{invoiceId ? "Complete GST tax breakdown & signatures" : "Print or choose Save as PDF in the print dialog"}</div>
                        </div>
                      </div>
                      <span className="badge bg-secondary-subtle text-secondary rounded-pill">A4</span>
                    </button>

                    {/* 3. Bluetooth Thermal Print */}
                    <button 
                      className="btn btn-dark d-flex align-items-center justify-content-between py-2 px-3 rounded-3"
                      onClick={handleBluetoothPrint}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <BsBluetooth className="fs-5 text-info" />
                        <div className="text-start">
                          <div className="fw-bold small text-white">Bluetooth Thermal Print</div>
                          <div className="opacity-75" style={{ fontSize: "11px" }}>58mm / 80mm ESC/POS Roll</div>
                        </div>
                      </div>
                      {pairedPrinters.length > 0 && (
                        <span className="badge bg-info text-dark rounded-pill">
                          {pairedPrinters.length} Paired
                        </span>
                      )}
                    </button>

                    {/* 4. WiFi Network Print */}
                    <button 
                      className="btn btn-outline-dark d-flex align-items-center justify-content-between py-2 px-3 rounded-3"
                      onClick={handleNetworkPrint}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <BsWifi className="fs-5 text-success" />
                        <div className="text-start">
                          <div className="fw-bold small text-dark">WiFi / Network Print</div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>Direct to IP: {networkPrinterIp}:{networkPort}</div>
                        </div>
                      </div>
                      <span className="badge bg-success-subtle text-success rounded-pill">LAN</span>
                    </button>

                    {/* 5. Standard System Print */}
                    <button 
                      className="btn btn-outline-info d-flex align-items-center justify-content-between py-2 px-3 rounded-3 text-dark"
                      onClick={handleSystemPrint}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <BsPrinterFill className="fs-5 text-primary" />
                        <div className="text-start">
                          <div className="fw-bold small">System Print Spooler</div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>Windows/Android system printer dialog</div>
                        </div>
                      </div>
                    </button>

                    {/* 6. WhatsApp Share */}
                    <button 
                      className="btn btn-success d-flex align-items-center justify-content-between py-2 px-3 rounded-3"
                      onClick={handleWhatsAppShare}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <BsWhatsapp className="fs-5 text-white" />
                        <div className="text-start">
                          <div className="fw-bold small text-white">Share on WhatsApp</div>
                          <div className="opacity-75" style={{ fontSize: "11px" }}>Send invoice summary to customer</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light py-2 px-4 d-flex justify-content-between">
            <span className="small text-muted">TSAR IT Enterprise Real-time Print Engine</span>
            <button type="button" className="btn btn-secondary px-4 rounded-3" onClick={onClose}>
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
