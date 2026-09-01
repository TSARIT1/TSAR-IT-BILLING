import React, { useState } from "react";
import { Link } from "react-router-dom";
import MobileNavigation from "../components/MobileNavigation";
import { AutoSyncService } from "../services/autoSyncService";
import { NativeBridge } from "../services/nativeBridge";
import { 
  BsReceipt, 
  BsPlusLg, 
  BsTrash3, 
  BsWhatsapp, 
  BsPrinterFill, 
  BsTruck, 
  BsArrowLeft 
} from "react-icons/bs";

export default function MobileCreateInvoice() {
  const [customerName, setCustomerName] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [ewayBillNo, setEwayBillNo] = useState("");

  const [items, setItems] = useState([
    { name: "Basmati Rice (1kg)", qty: 10, rate: 120.00, gst: 5 }
  ]);

  const handleAddItem = () => {
    setItems([...items, { name: "", qty: 1, rate: 0, gst: 5 }]);
  };

  const handleItemChange = (index, field, val) => {
    const updated = [...items];
    updated[index][field] = val;
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, it) => acc + ((parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0)), 0);
  const gstTotal = items.reduce((acc, it) => {
    const itSub = (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0);
    return acc + (itSub * ((parseFloat(it.gst) || 0) / 100));
  }, 0);
  const grandTotal = subtotal + gstTotal;

  const handleSaveInvoice = (e) => {
    e.preventDefault();
    if (!customerName) return;

    const invoiceData = {
      invoiceNumber: `INV-M-${Date.now().toString().slice(-6)}`,
      customerName,
      customerGstin,
      vehicleNo,
      ewayBillNo,
      items,
      subtotal,
      gstTotal,
      grandTotal,
      date: new Date().toISOString()
    };

    AutoSyncService.queueOfflineAction("INVOICE", "CREATE", invoiceData);
    AutoSyncService.performFullSync();

    NativeBridge.showToast(`Invoice #${invoiceData.invoiceNumber} saved!`);

    // Share Invoice WhatsApp
    const shareText = `*TSAR IT BILLING TAX INVOICE*\nInvoice No: ${invoiceData.invoiceNumber}\nCustomer: ${customerName}\nTotal Amount: Rs. ${grandTotal.toFixed(2)}\nThank you for your business!`;
    NativeBridge.shareInvoiceWhatsApp(shareText);
  };

  return (
    <div className="mobile-app-shell pb-5 mb-4">
      {/* Top Header */}
      <header className="mobile-header p-3 bg-dark text-white d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <Link to="/" className="text-white fs-5"><BsArrowLeft /></Link>
          <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
            <BsReceipt className="text-primary" /> Create Sales Tax Invoice
          </h6>
        </div>
      </header>

      <main className="p-3">
        <form onSubmit={handleSaveInvoice}>
          {/* Customer Details */}
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-3">
            <h6 className="fw-bold small text-uppercase text-muted mb-2">Customer & GSTIN</h6>
            <div className="mb-2">
              <input 
                type="text" 
                className="form-control form-control-sm bg-light"
                required
                placeholder="Customer / Business Name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <input 
                type="text" 
                className="form-control form-control-sm bg-light text-uppercase"
                placeholder="GSTIN (e.g. 36AAACT1234F1Z5)"
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value)}
              />
            </div>
          </div>

          {/* Transport & E-Way Details */}
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-3">
            <h6 className="fw-bold small text-uppercase text-muted mb-2 d-flex align-items-center gap-1">
              <BsTruck className="text-primary" /> Transport & E-Way Bill (Optional)
            </h6>
            <div className="row g-2">
              <div className="col-6">
                <input 
                  type="text" 
                  className="form-control form-control-sm bg-light text-uppercase"
                  placeholder="Vehicle No (AP09AB1234)"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                />
              </div>
              <div className="col-6">
                <input 
                  type="text" 
                  className="form-control form-control-sm bg-light"
                  placeholder="E-Way Bill (12 Digits)"
                  value={ewayBillNo}
                  onChange={(e) => setEwayBillNo(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Line Items Card */}
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold small text-uppercase text-muted mb-0">Item Particulars</h6>
              <button type="button" className="btn btn-sm btn-outline-primary py-0 px-2 small" onClick={handleAddItem}>
                + Add Item
              </button>
            </div>

            {items.map((it, idx) => (
              <div key={idx} className="p-2 mb-2 bg-light rounded border small">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <input 
                    type="text" 
                    className="form-control form-control-sm border-0 bg-white"
                    placeholder="Item / Product Name"
                    required
                    value={it.name}
                    onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                  />
                  {items.length > 1 && (
                    <button type="button" className="btn btn-sm text-danger p-0 ms-2" onClick={() => handleRemoveItem(idx)}>
                      <BsTrash3 />
                    </button>
                  )}
                </div>
                <div className="row g-1">
                  <div className="col-4">
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      placeholder="Qty"
                      value={it.qty}
                      onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                    />
                  </div>
                  <div className="col-4">
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      placeholder="Rate (₹)"
                      value={it.rate}
                      onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                    />
                  </div>
                  <div className="col-4">
                    <select 
                      className="form-select form-select-sm"
                      value={it.gst}
                      onChange={(e) => handleItemChange(idx, "gst", e.target.value)}
                    >
                      <option value="0">0% GST</option>
                      <option value="5">5% GST</option>
                      <option value="12">12% GST</option>
                      <option value="18">18% GST</option>
                      <option value="28">28% GST</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Total Computation */}
            <div className="pt-2 border-top mt-2">
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Taxable Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Total GST Amount:</span>
                <span>₹{gstTotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold fs-6 text-primary pt-1 border-top">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow rounded-3 d-flex justify-content-center align-items-center gap-2">
            <BsWhatsapp /> Save & Share on WhatsApp
          </button>
        </form>
      </main>

      <MobileNavigation />
    </div>
  );
}
