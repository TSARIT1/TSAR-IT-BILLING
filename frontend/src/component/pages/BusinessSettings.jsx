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
      businessName,
      phoneNo: companyPhone,
      email: companyEmail,
      address: billingAddress,
      state: stateName,
      city,
      pincode,
      panNumber,

      businessType,          // enum: Proprietorship / Partnership / LLP
      industryType,
      registrationType,

      isEnableEinvoicing: enableEInvoicing,
      isEnableTds: enableTds,
      isEnableTcs: enableTcs,
      extras
    };

    const formData = new FormData();

    // REQUIRED
    formData.append(
      "business",
      new Blob([JSON.stringify(business)], {
        type: "application/json"
      })
    );

    formData.append("userId", userId);

    formData.append(
      "isGstRegistered",
      isGstRegistered === "Yes" ? "true" : "false"
    );

    if (isGstRegistered === "Yes") {
      formData.append("gstNo", gstNumber);
    }

    // OPTIONAL FILES
    if (logoFile) {
      formData.append("businessLogo", logoFile);
    }

    if (signatureDataUrl) {
      const blob = await fetch(signatureDataUrl).then(res => res.blob());
      formData.append("signature", blob, "signature.png");
    }

    try {
      const response = await saveBusinessSettings(formData);
      console.log("========== BUSINESS SETTINGS SAVE DEBUG ==========");
      console.log("Full response:", response);
      console.log("Response keys:", Object.keys(response));

      // Extract businessId and userBusinessId from response
      const businessId = response.businessId || response.data?.businessId;
      const userBusinessId = response.userBusinessId || response.data?.userBusinessId || response.id || response.data?.id;

      console.log("Checking for IDs in response:");
      console.log("  response.businessId:", response.businessId);
      console.log("  response.userBusinessId:", response.userBusinessId);
      console.log("  response.id:", response.id);
      console.log("  response.data?.businessId:", response.data?.businessId);
      console.log("  response.data?.userBusinessId:", response.data?.userBusinessId);
      console.log("  response.data?.id:", response.data?.id);
      console.log("Final businessId:", businessId);
      console.log("Final userBusinessId:", userBusinessId);

      // Store businessId in localStorage
      if (businessId) {
        localStorage.setItem("businessId", businessId);
        console.log("✅ businessId stored:", businessId);

        // IMPORTANT: Backend doesn't return userBusinessId, so we use businessId for both
        // This allows godown creation to work with the FK requirement
        localStorage.setItem("userBusinessId", userBusinessId || businessId);
        console.log("✅ userBusinessId stored (using businessId):", businessId);

        // VERIFICATION: Check if userBusinessId is actually in localStorage
        const verifyUserBusinessId = localStorage.getItem("userBusinessId");
        console.log("========== VERIFICATION ==========");
        console.log("✅ Reading back from localStorage:");
        console.log("   userBusinessId:", verifyUserBusinessId);
        console.log("   Match:", verifyUserBusinessId === businessId ? "✅ SUCCESS" : "❌ FAILED");
        console.log("==================================");

        alert(`Business Settings saved successfully!\nBusiness ID: ${businessId}\nUserBusiness ID: ${verifyUserBusinessId}\n\nYou can now access Godown Management.`);
      } else {
        console.error("❌ businessId NOT FOUND in response!");
        console.error("Response structure:", JSON.stringify(response, null, 2));
        alert("Business Settings saved, but businessId not found in response.\nPlease check the console.");
      }
      console.log("==================================================");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save Business Settings");
    }
  };

  const handleRemoveExtra = (idx) => {
    setExtras((prev) => prev.filter((_, i) => i !== idx));
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

    setExtras((prev) => [
      ...prev,
      {
        extraKey: extraKey,
        extraValue: extraValue
      }
    ]);

    setExtraKey("");
    setExtraValue("");
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
                  <option value="OTHERS">Others</option>
                </select>
              </div>

              <div className="field-group">
                <label>Industry Type</label>
                <select value={industryType} onChange={(e) => setIndustryType(e.target.value)}>
                  <option value="">Select Industry Type</option>
                  <option value="Retail">Retail</option>
                  <option value="Education">Education</option>
                  <option value="IT Services">IT Services</option>
                  <option value="OTHERS">Others</option>
                </select>
              </div>

              <div className="field-group">
                <label>Business Registration Type</label>
                <select
                  value={registrationType}
                  onChange={(e) => setRegistrationType(e.target.value)}
                >
                  <option value="PRIVATE LIMITED COMPANY">Private Limited Company</option>
                  <option value="PARTNERSHIP">Partnership</option>
                  <option value="PROPRIETORSHIP">Proprietorship</option>
                  <option value="OTHERS">Others</option>
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
                  {extras.map((ex, idx) => (
                    <div className="extra-item" key={idx}>
                      <div className="extra-kv">
                        <strong>{ex.extraKey}:</strong> <span>{ex.extraValue}</span>
                      </div>
                      <button
                        className="btn small danger"
                        onClick={() => handleRemoveExtra(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
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
