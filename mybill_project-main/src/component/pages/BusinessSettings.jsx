import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../businessSettings.css"; // separate CSS file as requested
import { Link } from "react-router-dom";

function BusinessSettings() {
  // Company details state
  const [businessName, setBusinessName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [isGstRegistered, setIsGstRegistered] = useState("Yes");
  const [enableEInvoicing, setEnableEInvoicing] = useState(false);
  const [panNumber, setPanNumber] = useState("");
  const [enableTds, setEnableTds] = useState(false);
  const [enableTcs, setEnableTcs] = useState(false);

  // Right column / additional details
  const [businessType, setBusinessType] = useState("");
  const [industryType, setIndustryType] = useState("");
  const [registrationType, setRegistrationType] = useState("Private Limited Company");
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [extraKey, setExtraKey] = useState("");
  const [extraValue, setExtraValue] = useState("");
  const [extras, setExtras] = useState([]);

  // Load saved settings from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("businessSettings")) || {};
    if (Object.keys(saved).length) {
      setBusinessName(saved.businessName || "");
      setCompanyPhone(saved.companyPhone || "");
      setCompanyEmail(saved.companyEmail || "");
      setBillingAddress(saved.billingAddress || "");
      setStateName(saved.stateName || "");
      setCity(saved.city || "");
      setPincode(saved.pincode || "");
      setIsGstRegistered(saved.isGstRegistered || "Yes");
      setEnableEInvoicing(saved.enableEInvoicing || false);
      setPanNumber(saved.panNumber || "");
      setEnableTds(saved.enableTds || false);
      setEnableTcs(saved.enableTcs || false);
      setBusinessType(saved.businessType || "");
      setIndustryType(saved.industryType || "");
      setRegistrationType(saved.registrationType || "Private Limited Company");
      setSignatureDataUrl(saved.signatureDataUrl || "");
      setExtras(saved.extras || []);
    }
  }, []);

  // Save to localStorage (simulate Save Changes)
  const handleSave = () => {
    const payload = {
      businessName,
      companyPhone,
      companyEmail,
      billingAddress,
      stateName,
      city,
      pincode,
      isGstRegistered,
      enableEInvoicing,
      panNumber,
      enableTds,
      enableTcs,
      businessType,
      industryType,
      registrationType,
      signatureDataUrl,
      extras,
    };
    localStorage.setItem("businessSettings", JSON.stringify(payload));
    alert("Settings saved to localStorage (for demo).");
  };

  // Upload signature as dataURL (simple client-side preview)
  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSignatureDataUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Add extra business detail (Website / MSME etc.)
  const handleAddExtra = () => {
    if (!extraKey || !extraValue) {
      alert("Enter both key and value to add.");
      return;
    }
    setExtras((prev) => [...prev, { key: extraKey, value: extraValue }]);
    setExtraKey("");
    setExtraValue("");
  };

  const handleRemoveExtra = (idx) => {
    setExtras((prev) => prev.filter((_, i) => i !== idx));
  };

  // Optional: reset form
  const handleReset = () => {
    if (!window.confirm("Reset all fields?")) return;
    setBusinessName("");
    setCompanyPhone("");
    setCompanyEmail("");
    setBillingAddress("");
    setStateName("");
    setCity("");
    setPincode("");
    setIsGstRegistered("Yes");
    setEnableEInvoicing(false);
    setPanNumber("");
    setEnableTds(false);
    setEnableTcs(false);
    setBusinessType("");
    setIndustryType("");
    setRegistrationType("Private Limited Company");
    setSignatureDataUrl("");
    setExtras([]);
    localStorage.removeItem("businessSettings");
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content business-settings-page">
          <div className="page-toolbar">
            <h2>Business Settings</h2>
            <div className="toolbar-actions">
              <button className="btn ghost" onClick={handleReset}>
                Cancel
              </button>
              <button className="btn primary" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </div>

          <div className="settings-grid">
            {/* LEFT COLUMN */}
            <div className="settings-left card">
              <div className="form-row">
                <div className="upload-box">
                  <label className="upload-label">Upload Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={() => alert("Logo upload placeholder (implement as needed)")}
                  />
                  <small>PNG/JPG, max 5 MB</small>
                </div>

                <div className="field-group wide">
                  <label>Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Business Name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="field-group">
                  <label>Company Phone Number</label>
                  <input
                    type="text"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="Enter phone"
                  />
                </div>

                <div className="field-group">
                  <label>Company E-Mail</label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="Enter company e-mail"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="field-group wide">
                  <label>Billing Address</label>
                  <textarea
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Enter Billing Address"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="field-group">
                  <label>State</label>
                  <select value={stateName} onChange={(e) => setStateName(e.target.value)}>
                    <option value="">Enter State</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi">Delhi</option>
                    {/* Add other states as needed */}
                  </select>
                </div>

                <div className="field-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter Pincode"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="field-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter City"
                  />
                </div>

                <div className="field-group radio-group">
                  <label>Are you GST Registered?</label>
                  <div className="radios">
                    <label>
                      <input
                        type="radio"
                        name="gst"
                        value="Yes"
                        checked={isGstRegistered === "Yes"}
                        onChange={(e) => setIsGstRegistered(e.target.value)}
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="gst"
                        value="No"
                        checked={isGstRegistered === "No"}
                        onChange={(e) => setIsGstRegistered(e.target.value)}
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-row small-toggle">
                <label>Enable e-Invoicing</label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={enableEInvoicing}
                    onChange={(e) => setEnableEInvoicing(e.target.checked)}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="form-row">
                <div className="field-group wide">
                  <label>PAN Number</label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value)}
                    placeholder="Enter your PAN Number"
                  />
                </div>
              </div>

              <div className="form-row small-toggle">
                <label>Enable TDS</label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={enableTds}
                    onChange={(e) => setEnableTds(e.target.checked)}
                  />
                  <span className="slider" />
                </label>

                <label>Enable TCS</label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={enableTcs}
                    onChange={(e) => setEnableTcs(e.target.checked)}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="card-footer-note">
                <small>App Version: Demo · 100% Secure · ISO Certified</small>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="settings-right card">
              <div className="field-group">
                <label>Business Type (Select multiple, if applicable)</label>
                <select value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
                  <option value="">Select</option>
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="LLP">LLP</option>
                </select>
              </div>

              <div className="field-group">
                <label>Industry Type</label>
                <select value={industryType} onChange={(e) => setIndustryType(e.target.value)}>
                  <option value="">Select Industry Type</option>
                  <option value="Retail">Retail</option>
                  <option value="Education">Education</option>
                  <option value="IT Services">IT Services</option>
                </select>
              </div>

              <div className="field-group">
                <label>Business Registration Type</label>
                <select
                  value={registrationType}
                  onChange={(e) => setRegistrationType(e.target.value)}
                >
                  <option>Private Limited Company</option>
                  <option>Partnership</option>
                  <option>Proprietorship</option>
                </select>
              </div>

              <div className="form-row signature-row">
                <div>
                  <label>Signature</label>
                  <div className="signature-upload">
                    {signatureDataUrl ? (
                      <img src={signatureDataUrl} alt="signature preview" className="signature-preview" />
                    ) : (
                      <div className="signature-placeholder">+ Add Signature</div>
                    )}
                    <input type="file" accept="image/*" onChange={handleSignatureUpload} />
                  </div>
                </div>
              </div>

              <div className="extras-card">
                <label>Add Business Details</label>
                <div className="extra-row">
                  <input
                    type="text"
                    placeholder="Key (e.g., Website)"
                    value={extraKey}
                    onChange={(e) => setExtraKey(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., www.website.com)"
                    value={extraValue}
                    onChange={(e) => setExtraValue(e.target.value)}
                  />
                  <button className="btn small" onClick={handleAddExtra}>
                    Add
                  </button>
                </div>

                <div className="extras-list">
                  {extras.length === 0 ? (
                    <div className="empty">No additional business details added.</div>
                  ) : (
                    extras.map((ex, idx) => (
                      <div className="extra-item" key={idx}>
                        <div className="extra-kv">
                          <strong>{ex.key}:</strong> <span>{ex.value}</span>
                        </div>
                        <button className="btn small danger" onClick={() => handleRemoveExtra(idx)}>
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="right-bottom-note">
                <small>
                  Note: Terms & Conditions and Signature added below will be shown on your Invoices.
                </small>
              </div>
            </div>
          </div>

          {/* bottom add new business / exports */}
          <div className="bottom-row">
            <div className="left">
              <div className="tally-export card small">
                <h4>Data Export to Tally</h4>
                <p>Transfer vouchers, items and parties to Tally</p>
                <button className="btn small ghost">Configure</button>
              </div>
            </div>
            <div className="right" />
          </div>
        </div>
      </div>
    </>
  );
}

export default BusinessSettings;
