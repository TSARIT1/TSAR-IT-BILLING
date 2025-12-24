import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../businessSettings.css";

function Settings() {
    // Multi-business state
    const [businesses, setBusinesses] = useState([]);
    const [currentBusinessIndex, setCurrentBusinessIndex] = useState(0);
    const [showBusinessMenu, setShowBusinessMenu] = useState(null);

    // Current business form states
    const [logoDataUrl, setLogoDataUrl] = useState("");
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
    const [businessType, setBusinessType] = useState("");
    const [industryType, setIndustryType] = useState("");
    const [registrationType, setRegistrationType] = useState("Private Limited Company");
    const [signatureDataUrl, setSignatureDataUrl] = useState("");
    const [extraKey, setExtraKey] = useState("");
    const [extraValue, setExtraValue] = useState("");
    const [extras, setExtras] = useState([]);

    // Load all businesses from localStorage on mount
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("businessProfiles")) || [];
        if (saved.length > 0) {
            setBusinesses(saved);
            loadBusinessData(saved[0]);
        }
    }, []);

    // Load specific business data into form
    const loadBusinessData = (business) => {
        setLogoDataUrl(business.logoDataUrl || "");
        setBusinessName(business.businessName || "");
        setCompanyPhone(business.companyPhone || "");
        setCompanyEmail(business.companyEmail || "");
        setBillingAddress(business.billingAddress || "");
        setStateName(business.stateName || "");
        setCity(business.city || "");
        setPincode(business.pincode || "");
        setIsGstRegistered(business.isGstRegistered || "Yes");
        setEnableEInvoicing(business.enableEInvoicing || false);
        setPanNumber(business.panNumber || "");
        setEnableTds(business.enableTds || false);
        setEnableTcs(business.enableTcs || false);
        setBusinessType(business.businessType || "");
        setIndustryType(business.industryType || "");
        setRegistrationType(business.registrationType || "Private Limited Company");
        setSignatureDataUrl(business.signatureDataUrl || "");
        setExtras(business.extras || []);
    };

    // Get current form data as object
    const getCurrentFormData = () => ({
        id: businesses[currentBusinessIndex]?.id || Date.now().toString(),
        isPrimary: businesses[currentBusinessIndex]?.isPrimary || false,
        createdAt: businesses[currentBusinessIndex]?.createdAt || Date.now(),
        logoDataUrl,
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
    });

    // Save current business
    const handleSave = () => {
        if (!businessName.trim()) {
            alert("Please enter a business name");
            return;
        }

        const updatedBusinesses = [...businesses];
        const currentData = getCurrentFormData();

        if (updatedBusinesses[currentBusinessIndex]) {
            updatedBusinesses[currentBusinessIndex] = currentData;
        } else {
            updatedBusinesses.push(currentData);
        }

        setBusinesses(updatedBusinesses);
        localStorage.setItem("businessProfiles", JSON.stringify(updatedBusinesses));
        alert("Business settings saved successfully!");
    };

    // Add new business
    const handleAddNewBusiness = () => {
        // Save current business first if it has data
        if (businessName.trim()) {
            handleSave();
        }

        const newBusiness = {
            id: Date.now().toString(),
            isPrimary: businesses.length === 0, // First business is primary
            createdAt: Date.now(),
            logoDataUrl: "",
            businessName: "",
            companyPhone: "",
            companyEmail: "",
            billingAddress: "",
            stateName: "",
            city: "",
            pincode: "",
            isGstRegistered: "Yes",
            enableEInvoicing: false,
            panNumber: "",
            enableTds: false,
            enableTcs: false,
            businessType: "",
            industryType: "",
            registrationType: "Private Limited Company",
            signatureDataUrl: "",
            extras: [],
        };

        const updatedBusinesses = [...businesses, newBusiness];
        setBusinesses(updatedBusinesses);
        setCurrentBusinessIndex(updatedBusinesses.length - 1);
        loadBusinessData(newBusiness);
        localStorage.setItem("businessProfiles", JSON.stringify(updatedBusinesses));
    };

    // Switch to different business
    const handleSwitchBusiness = (index) => {
        // Save current business before switching
        if (businesses[currentBusinessIndex] && businessName.trim()) {
            const updatedBusinesses = [...businesses];
            updatedBusinesses[currentBusinessIndex] = getCurrentFormData();
            setBusinesses(updatedBusinesses);
            localStorage.setItem("businessProfiles", JSON.stringify(updatedBusinesses));
        }

        setCurrentBusinessIndex(index);
        loadBusinessData(businesses[index]);
        setShowBusinessMenu(null);
    };

    // Set business as primary
    const handleSetAsPrimary = (index) => {
        const updatedBusinesses = businesses.map((business, idx) => ({
            ...business,
            isPrimary: idx === index,
        }));
        setBusinesses(updatedBusinesses);
        localStorage.setItem("businessProfiles", JSON.stringify(updatedBusinesses));
        setShowBusinessMenu(null);
        alert("Primary business updated successfully!");
    };

    // Delete business
    const handleDeleteBusiness = (index) => {
        if (businesses[index].isPrimary) {
            alert("Cannot delete primary business. Please set another business as primary first.");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this business?")) {
            return;
        }

        const updatedBusinesses = businesses.filter((_, idx) => idx !== index);
        setBusinesses(updatedBusinesses);
        localStorage.setItem("businessProfiles", JSON.stringify(updatedBusinesses));

        // Switch to first business
        if (updatedBusinesses.length > 0) {
            setCurrentBusinessIndex(0);
            loadBusinessData(updatedBusinesses[0]);
        }
        setShowBusinessMenu(null);
    };

    // Create first business
    const handleCreateFirstBusiness = () => {
        const firstBusiness = {
            id: Date.now().toString(),
            isPrimary: true,
            createdAt: Date.now(),
            logoDataUrl: "",
            businessName: "",
            companyPhone: "",
            companyEmail: "",
            billingAddress: "",
            stateName: "",
            city: "",
            pincode: "",
            isGstRegistered: "Yes",
            enableEInvoicing: false,
            panNumber: "",
            enableTds: false,
            enableTcs: false,
            businessType: "",
            industryType: "",
            registrationType: "Private Limited Company",
            signatureDataUrl: "",
            extras: [],
        };

        setBusinesses([firstBusiness]);
        setCurrentBusinessIndex(0);
        loadBusinessData(firstBusiness);
    };

    // Cancel changes
    const handleCancel = () => {
        if (!window.confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) return;

        if (businesses[currentBusinessIndex]) {
            loadBusinessData(businesses[currentBusinessIndex]);
        }
    };

    // Logo upload
    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File size should not exceed 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => setLogoDataUrl(ev.target.result);
        reader.readAsDataURL(file);
    };

    // Signature upload
    const handleSignatureUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setSignatureDataUrl(ev.target.result);
        reader.readAsDataURL(file);
    };

    // Add extra business detail
    const handleAddExtra = () => {
        if (!extraKey || !extraValue) {
            alert("Please enter both key and value");
            return;
        }
        setExtras((prev) => [...prev, { key: extraKey, value: extraValue }]);
        setExtraKey("");
        setExtraValue("");
    };

    const handleRemoveExtra = (idx) => {
        setExtras((prev) => prev.filter((_, i) => i !== idx));
    };

    // Empty state - no businesses
    if (businesses.length === 0) {
        return (
            <>
                <Navbar />
                <div className="dashboard-layout">
                    <Sidebar />
                    <div className="dashboard-content business-settings-page">
                        <div className="empty-state">
                            <div className="empty-state-icon">🏢</div>
                            <h2>Welcome to Business Settings</h2>
                            <p>Create your first business profile to get started</p>
                            <button className="btn primary large" onClick={handleCreateFirstBusiness}>
                                + Create Your First Business
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="dashboard-layout">
                <Sidebar />
                <div className="dashboard-content business-settings-page">
                    {/* Business Tabs */}
                    <div className="business-tabs-container">
                        <div className="business-tabs">
                            {businesses.map((business, index) => (
                                <div
                                    key={business.id}
                                    className={`business-tab ${index === currentBusinessIndex ? "active" : ""}`}
                                    onClick={() => handleSwitchBusiness(index)}
                                >
                                    <div className="tab-content">
                                        <span className="tab-name">
                                            {business.businessName || `Business ${index + 1}`}
                                        </span>
                                        {business.isPrimary && <span className="primary-badge">Primary</span>}
                                    </div>
                                    <button
                                        className="tab-menu-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowBusinessMenu(showBusinessMenu === index ? null : index);
                                        }}
                                    >
                                        ⋮
                                    </button>
                                    {showBusinessMenu === index && (
                                        <div className="business-menu">
                                            {!business.isPrimary && (
                                                <button onClick={() => handleSetAsPrimary(index)}>
                                                    ⭐ Set as Primary
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteBusiness(index)}
                                                disabled={business.isPrimary}
                                                className={business.isPrimary ? "disabled" : "danger"}
                                            >
                                                🗑️ Delete Business
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button className="add-business-btn" onClick={handleAddNewBusiness}>
                                + Add Business
                            </button>
                        </div>
                    </div>

                    {/* Page Toolbar */}
                    <div className="page-toolbar">
                        <h2>
                            {businesses[currentBusinessIndex]?.isPrimary ? "Primary" : "Secondary"} Business Settings
                        </h2>
                        <div className="toolbar-actions">
                            <button className="btn ghost" onClick={handleCancel}>
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
                            {/* Logo Upload Section */}
                            <div className="form-row">
                                <div className="upload-box">
                                    <label className="upload-label">Upload Logo</label>
                                    {logoDataUrl ? (
                                        <div className="logo-preview-container">
                                            <img src={logoDataUrl} alt="Business Logo" className="logo-preview" />
                                            <button
                                                className="btn small ghost"
                                                onClick={() => setLogoDataUrl("")}
                                                style={{ marginTop: '10px' }}
                                            >
                                                Remove Logo
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                id="logo-upload"
                                                style={{ display: 'none' }}
                                            />
                                            <label htmlFor="logo-upload" className="upload-placeholder">
                                                <div className="upload-icon">📷</div>
                                                <div>Click to upload logo</div>
                                            </label>
                                        </>
                                    )}
                                    <small>PNG/JPG, max 5 MB</small>
                                </div>

                                <div className="field-group wide">
                                    <label>Business Name *</label>
                                    <input
                                        type="text"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        placeholder="Enter Business Name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Company Phone and Email */}
                            <div className="form-row">
                                <div className="field-group">
                                    <label>Company Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={companyPhone}
                                        onChange={(e) => setCompanyPhone(e.target.value)}
                                        placeholder="Enter phone number"
                                        required
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Company E-Mail *</label>
                                    <input
                                        type="email"
                                        value={companyEmail}
                                        onChange={(e) => setCompanyEmail(e.target.value)}
                                        placeholder="Enter company e-mail"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Billing Address */}
                            <div className="form-row">
                                <div className="field-group wide">
                                    <label>Billing Address *</label>
                                    <textarea
                                        value={billingAddress}
                                        onChange={(e) => setBillingAddress(e.target.value)}
                                        placeholder="Enter Billing Address"
                                        rows="3"
                                        required
                                    />
                                </div>
                            </div>

                            {/* State and Pincode */}
                            <div className="form-row">
                                <div className="field-group">
                                    <label>State *</label>
                                    <select value={stateName} onChange={(e) => setStateName(e.target.value)} required>
                                        <option value="">Enter State</option>
                                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                        <option value="Assam">Assam</option>
                                        <option value="Bihar">Bihar</option>
                                        <option value="Chhattisgarh">Chhattisgarh</option>
                                        <option value="Goa">Goa</option>
                                        <option value="Gujarat">Gujarat</option>
                                        <option value="Haryana">Haryana</option>
                                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                                        <option value="Jharkhand">Jharkhand</option>
                                        <option value="Karnataka">Karnataka</option>
                                        <option value="Kerala">Kerala</option>
                                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                                        <option value="Maharashtra">Maharashtra</option>
                                        <option value="Manipur">Manipur</option>
                                        <option value="Meghalaya">Meghalaya</option>
                                        <option value="Mizoram">Mizoram</option>
                                        <option value="Nagaland">Nagaland</option>
                                        <option value="Odisha">Odisha</option>
                                        <option value="Punjab">Punjab</option>
                                        <option value="Rajasthan">Rajasthan</option>
                                        <option value="Sikkim">Sikkim</option>
                                        <option value="Tamil Nadu">Tamil Nadu</option>
                                        <option value="Telangana">Telangana</option>
                                        <option value="Tripura">Tripura</option>
                                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                                        <option value="Uttarakhand">Uttarakhand</option>
                                        <option value="West Bengal">West Bengal</option>
                                        <option value="Delhi">Delhi</option>
                                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                        <option value="Ladakh">Ladakh</option>
                                        <option value="Puducherry">Puducherry</option>
                                        <option value="Chandigarh">Chandigarh</option>
                                    </select>
                                </div>

                                <div className="field-group">
                                    <label>Pincode *</label>
                                    <input
                                        type="text"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value)}
                                        placeholder="Enter Pincode"
                                        maxLength="6"
                                        required
                                    />
                                </div>
                            </div>

                            {/* City and GST Registration */}
                            <div className="form-row">
                                <div className="field-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Enter City"
                                        required
                                    />
                                </div>

                                <div className="field-group radio-group">
                                    <label>Are you GST Registered? *</label>
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

                            {/* E-Invoicing Toggle */}
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

                            {/* PAN Number */}
                            <div className="form-row">
                                <div className="field-group wide">
                                    <label>PAN Number</label>
                                    <input
                                        type="text"
                                        value={panNumber}
                                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                                        placeholder="Enter your PAN Number"
                                        maxLength="10"
                                    />
                                </div>
                            </div>

                            {/* TDS and TCS Toggles */}
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
                                <small>App Version: 1.0.0 · 100% Secure · ISO Certified</small>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="settings-right card">
                            {/* Business Type */}
                            <div className="field-group">
                                <label>Business Type (Select multiple, if applicable)</label>
                                <select value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="Proprietorship">Proprietorship</option>
                                    <option value="Partnership">Partnership</option>
                                    <option value="LLP">LLP</option>
                                    <option value="Private Limited">Private Limited</option>
                                    <option value="Public Limited">Public Limited</option>
                                    <option value="One Person Company">One Person Company</option>
                                </select>
                            </div>

                            {/* Industry Type */}
                            <div className="field-group">
                                <label>Industry Type</label>
                                <select value={industryType} onChange={(e) => setIndustryType(e.target.value)}>
                                    <option value="">Select Industry Type</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Wholesale">Wholesale</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Education">Education</option>
                                    <option value="IT Services">IT Services</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Hospitality">Hospitality</option>
                                    <option value="Real Estate">Real Estate</option>
                                    <option value="Construction">Construction</option>
                                    <option value="Agriculture">Agriculture</option>
                                    <option value="Transportation">Transportation</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Consulting">Consulting</option>
                                    <option value="E-commerce">E-commerce</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Business Registration Type */}
                            <div className="field-group">
                                <label>Business Registration Type</label>
                                <select
                                    value={registrationType}
                                    onChange={(e) => setRegistrationType(e.target.value)}
                                >
                                    <option>Private Limited Company</option>
                                    <option>Partnership</option>
                                    <option>Proprietorship</option>
                                    <option>LLP</option>
                                    <option>Public Limited Company</option>
                                    <option>One Person Company</option>
                                    <option>Unregistered</option>
                                </select>
                            </div>

                            {/* Signature Upload */}
                            <div className="form-row signature-row">
                                <div>
                                    <label>Signature</label>
                                    <div className="signature-upload">
                                        {signatureDataUrl ? (
                                            <div className="signature-preview-container">
                                                <img src={signatureDataUrl} alt="signature preview" className="signature-preview" />
                                                <button
                                                    className="btn small ghost"
                                                    onClick={() => setSignatureDataUrl("")}
                                                    style={{ marginTop: '10px' }}
                                                >
                                                    Remove Signature
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleSignatureUpload}
                                                    id="signature-upload"
                                                    style={{ display: 'none' }}
                                                />
                                                <label htmlFor="signature-upload" className="signature-placeholder">
                                                    + Add Signature
                                                </label>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Business Details */}
                            <div className="extras-card">
                                <label>Add Business Details</label>
                                <small style={{ display: 'block', marginBottom: '10px', color: '#666' }}>
                                    Add additional business information such as MSME number, Website, etc.
                                </small>
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

                    {/* Bottom Row - Additional Features */}
                    <div className="bottom-row">
                        <div className="left">
                            <div className="tally-export card small">
                                <h4>Business Count</h4>
                                <p>You have {businesses.length} business profile{businesses.length !== 1 ? 's' : ''} configured</p>
                                <button className="btn small primary" onClick={handleAddNewBusiness}>
                                    + Add Another Business
                                </button>
                            </div>
                        </div>
                        <div className="right">
                            <div className="tally-export card small">
                                <h4>Data Export to Tally</h4>
                                <p>Transfer vouchers, items and parties to Tally</p>
                                <button className="btn small ghost">Configure</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Settings;
