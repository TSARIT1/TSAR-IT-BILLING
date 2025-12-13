import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../businessSettings.css"; 
import { useNavigate } from "react-router-dom";
import {
  saveBusinessSettings,
  getBusinessSettings,
} from "../../services/api";

function BusinessSettings() {
  const navigate = useNavigate();
  // Company details state
  const [gstNumber, setGstNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [isGstRegistered, setIsGstRegistered] = useState("");
  const [enableEInvoicing, setEnableEInvoicing] = useState(false);
  const [panNumber, setPanNumber] = useState("");
  const [enableTds, setEnableTds] = useState(false);
  const [enableTcs, setEnableTcs] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  // Right column / additional details
  const [businessType, setBusinessType] = useState("");
  const [industryType, setIndustryType] = useState("");
  const [registrationType, setRegistrationType] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [extraKey, setExtraKey] = useState("");
  const [extraValue, setExtraValue] = useState("");
  const [extras, setExtras] = useState([]);
  const [logoPreview, setLogoPreview] = useState("");
  const [panError, setPanError] = useState("");
  const validatePan = (value) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

  if (!panRegex.test(value)) {
    setPanError("PAN must be in format AAAPA1234A");
  } else {
    setPanError("");
  }
};
  // Load saved settings from localStorage on mount
  useEffect(() => {
  const userId = localStorage.getItem("userId");

  // Redirect if user not logged in
  if (!userId) {
    console.warn("User not logged in → redirecting to login");
    navigate("/login", { replace: true });
    return;
  }

  getBusinessSettings(userId)
    .then((data) => {
      console.log("Fetched business settings:", data);
      if (!data) return;

      setBusinessName(data.businessName || "");
      setCompanyPhone(data.companyPhone || "");
      setCompanyEmail(data.companyEmail || "");
      setBillingAddress(data.billingAddress || "");
      setStateName(data.state || "");
      setCity(data.city || "");
      setPincode(data.pincode || "");
      setIsGstRegistered(data.gstRegistered || "Yes");
      setEnableEInvoicing(data.enableEInvoicing || false);
      setPanNumber(data.panNumber || "");
      setEnableTds(data.enableTds || false);
      setEnableTcs(data.enableTcs || false);
      setBusinessType(data.businessType || "");
      setIndustryType(data.industryType || "");
      setRegistrationType(data.registrationType || "");
      setExtras(data.extras || []);

      // FIXED: IMAGE PREVIEW HANDLING
      if (data.logo) {
        setLogoPreview(`data:image/png;base64,${data.logo}`);
      }

      if (data.signature) {
        setSignatureDataUrl(`data:image/png;base64,${data.signature}`);
      }
   // Store into localStorage for quick retrieval
      localStorage.setItem("businessSettings", JSON.stringify(data));
    })
    .catch((err) => console.log("Error fetching business settings:", err));
}, [navigate]);

  // Save to localStorage (simulate Save Changes)
  const handleSave = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
    alert("Session expired. Please login again.");
    navigate("/login", { replace: true });
    return;
  }
    console.log(" Saving Business Settings for user:", userId);

  // Block save if PAN invalid
  if (panError) {
    alert("Please enter a valid PAN number");
    return;
  }
  if (isGstRegistered === "Yes" && !gstNumber) {
  alert("Please enter GST Number");
  return;
}

const business = {
    userId: Number(userId),
    businessName,
    companyPhone,
    companyEmail,
    billingAddress,
    state: stateName,
    city,
    pincode,
    panNumber,

    businessType,          // enum: Proprietorship / Partnership / LLP
    industryType,
    registrationType,

    gstRegistered: isGstRegistered === "Yes",
    gstNo: isGstRegistered === "Yes" ? gstNumber : null,

    enableEInvoicing,
    enableTds,
    enableTcs,

    extras
  };

const formData = new FormData();

// REQUIRED: business as JSON
  formData.append(
    "business",
    new Blob([JSON.stringify(business)], {
      type: "application/json",
    })
  );

  // Optional logo
  if (logoFile) {
    formData.append("logo", logoFile);
  }

  // Optional signature
  if (signatureDataUrl) {
    const blob = await fetch(signatureDataUrl).then(res => res.blob());
    formData.append("signature", blob, "signature.png");
  }
   try {
    const data = await saveBusinessSettings(formData);
    console.log("Backend response after save:", data);

    alert("Business Settings saved successfully");
    localStorage.setItem("businessSettings", JSON.stringify(data));

  } catch (err) {
    console.error("Error saving business settings:", err);
    alert("Failed to save Business Settings");
  }
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
    setRegistrationType("");
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
                  {logoPreview && (
                                <img
                                  src={logoPreview}
                                  alt="Business Logo"
                                  className="logo-preview"
                                       />
                                    )}
                        <input
                         type="file"
                         accept="image/*"
                         onChange={(e) => {
                         const file = e.target.files[0];
                         setLogoFile(file);
                         setLogoPreview(URL.createObjectURL(file)); // instant preview
                             }}
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
                {isGstRegistered === "Yes" && (
               <div className="form-row">
               <div className="field-group wide">
              <label>GST Number</label>
             <input
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
               placeholder="Enter GST Number"
             />
            </div>
            </div>
                )}
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
                   maxLength={10}
                   onChange={(e) => {
                   const value = e.target.value.toUpperCase();
                   setPanNumber(value);
                   validatePan(value);
                  }}
                  placeholder="Enter your PAN Number"
                    />

                    {panError && (
                    <small style={{ color: "red" }}>{panError}</small>
                        )}
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
                  <option value="Proprietorship">PROPRIETORSHIP</option>
                  <option value="Partnership">PARTNERSHIP</option>
                  <option value="LLP">LLP</option>
                  <option value="PRIVATE">PRIVATE</option>
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

          {/* bottom add new business / exports 
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
          */}
        </div>
        
      </div>
    </>
  );
}

export default BusinessSettings;
