import React, { useState } from "react";
import { FiCalendar } from "react-icons/fi";
import { MdCurrencyRupee } from "react-icons/md";
import {
  BsPersonFill,
  BsTelephoneFill,
  BsEnvelopeFill,
  BsCreditCard2Front,
  BsBuilding,
  BsGeoAlt,
  BsBank,
  BsCalendar3,
  BsPerson
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "../editParty.css";

export default function EditParty() {
  const [partyData, setPartyData] = useState({
    partyName: "",
    mobile: "",
    email: "",
    openingBalance: "",
    balanceType: "To Pay",
    gstNumber: "",
    panNumber: "",
    partyType: "Customer",
    partyCategory: "",
    billingAddress: "",
    shippingAddress: "",
    creditPeriod: "", // New Field
    creditLimit: "",
    additionalDetails: "",
    bankDetails: {    // New Bank Data Object
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      branchName: ""
    }
  });

  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target;

    setPartyData((prevData) => {
      const newData = { ...prevData, [name]: value };

      // If updating billing address and "Same as billing" is checked, update shipping too
      if (sameAsBilling && name === "billingAddress") {
        newData.shippingAddress = value;
      }

      return newData;
    });
  };
  // Bank Details Handle Change
  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setPartyData((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [name]: value }
    }));
  };

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setSameAsBilling(isChecked);

    if (isChecked) {
      setPartyData((prev) => ({
        ...prev,
        shippingAddress: prev.billingAddress,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Party Details Saved:", partyData);
    alert("Party details saved successfully!");
  };

  return (
    <>
      <Navbar />
      <Sidebar />

      <div className="edit-party-container">

        <div className="page-header">
          <h2 className="page-title">
            <BsPersonFill className="title-icon" /> Add Party
          </h2>
          <p className="page-subtitle">Manage your customer and supplier information</p>
        </div>

        <div className="edit-party-card">
          <form onSubmit={handleSubmit}>

            {/* BASIC DETAILS */}
            <div className="section-header">
              <h3 className="section-heading">
                <BsPersonFill className="section-icon" /> Basic Details
              </h3>
            </div>

            <div className="form-grid-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", }}>
              <div>
                <label className="form-label">
                  <BsPersonFill className="label-icon" /> Party Name *
                </label>
                <div className="input-with-icon">
                  <BsPersonFill className="field-icon" />
                  <input
                    type="text"
                    name="partyName"
                    className="form-input icon-padded"
                    placeholder="Enter party name"
                    value={partyData.partyName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">
                  <BsTelephoneFill className="label-icon" /> Mobile Number
                </label>
                <div className="input-with-icon">
                  <BsTelephoneFill className="field-icon" />
                  <input
                    type="text"
                    name="mobile"
                    className="form-input icon-padded"
                    placeholder="Enter mobile number"
                    value={partyData.mobile}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">
                  <BsEnvelopeFill className="label-icon" /> Email
                </label>
                <div className="input-with-icon">
                  <BsEnvelopeFill className="field-icon" />
                  <input
                    type="email"
                    name="email"
                    className="form-input icon-padded"
                    placeholder="Enter email address"
                    value={partyData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Opening Balance</label>
                <div className="balance-group">
                  <div className="icon-input-wrapper">
                    <MdCurrencyRupee className="input-icon" />
                    <input type="number" name="openingBalance" className="form-input" placeholder="0" value={partyData.openingBalance} onChange={handleChange} />
                    <select name="balanceType" className="form-select-small" value={partyData.balanceType} onChange={handleChange}>
                      <option value="To Pay">To Pay</option>
                      <option value="To Collect">To Collect</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Party Type, Party Category */}
            <div className="form-grid-2" style={{ marginTop: "15px" }}>
              <div>
                <label className="form-label">Party Type *</label>
                <select name="partyType" className="form-input" value={partyData.partyType} onChange={handleChange}>
                  <option value="Customer">Customer</option>
                  <option value="Supplier">Supplier</option>
                </select>
              </div>
              <div>
                <label className="form-label">Party Category</label>
                <select name="partyCategory" className="form-input" value={partyData.partyCategory} onChange={handleChange}>
                  <option value="">Select Category</option>
                  <option value="VIP">VIP</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Retail">Retail</option>
                </select>
              </div>
            </div>

            {/* ADDRESS DETAILS */}
            <div className="section-header">
              <h3 className="section-heading">
                <BsGeoAlt className="section-icon" /> Address Details
              </h3>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="form-label">Billing Address</label>
                <textarea
                  name="billingAddress"
                  className="form-textarea"
                  value={partyData.billingAddress}
                  onChange={handleChange}
                  placeholder="Enter Billing Address"
                ></textarea>
              </div>

              <div>
                {/* 3. Checkbox moved here inside a header container */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                  <label className="form-label" style={{ margin: 0 }}>Shipping Address</label>

                  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px", color: "#555" }}>
                    <input
                      type="checkbox"
                      id="sameAddress"
                      checked={sameAsBilling}
                      onChange={handleCheckboxChange}
                      style={{ cursor: "pointer", height: "15px", width: "15px" }}
                    />
                    <label htmlFor="sameAddress" style={{ cursor: "pointer", margin: 0 }}>
                      Same as Billing
                    </label>
                  </div>
                </div>

                <textarea
                  name="shippingAddress"
                  className="form-textarea"
                  value={partyData.shippingAddress}
                  onChange={handleChange}
                  readOnly={sameAsBilling} // This prevents editing
                  style={sameAsBilling ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}}
                  placeholder="Enter Shipping Address"
                ></textarea>
              </div>
            </div>

            {/* GST DETAILS */}
            <div className="section-header">
              <h3 className="section-heading">
                <BsCreditCard2Front className="section-icon" /> GST Details
              </h3>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="form-label">GST Treatment</label>
                <select
                  name="gstTreatment"
                  className="form-input"
                  value={partyData.gstTreatment}
                  onChange={handleChange}
                >
                  <option value="">Select GST Treatment</option>
                  <option value="Registered">Registered</option>
                  <option value="Unregistered">Unregistered</option>
                </select>
              </div>

              <div className="form-grid-2" style={{ marginTop: "15px" }}>
                <div>
                  <label className="form-label">GSTIN</label>
                  <div className="input-group-btn">
                    <input type="text" name="gstNumber" className="form-input" placeholder="ex: 29XXXXX9438X1XX" value={partyData.gstNumber} onChange={handleChange} />
                    <button type="button" className="get-details-btn">Get Details</button>
                  </div>
                </div>
                <div>
                  <label className="form-label">PAN Number</label>
                  <input type="text" name="panNumber" className="form-input" placeholder="Enter party PAN Number" value={partyData.panNumber} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* --- CREDIT & BALANCE --- */}
            <div className="section-header" style={{ marginTop: "30px" }}>
              <h3 className="section-heading">
                <BsCreditCard2Front className="section-icon" /> Credit & Balance
              </h3>
            </div>
            <div className="form-grid-2">
              <div>
                <label className="form-label">Credit Period (Days)</label>
                <input type="number" name="creditPeriod" className="form-input" placeholder="0" value={partyData.creditPeriod} onChange={handleChange} />
              </div>
              <div>
                <label className="form-label">Credit Limit</label>
                <div className="icon-input-wrapper">
                  <MdCurrencyRupee className="input-icon" />
                  <input type="number" name="creditLimit" className="form-input" placeholder="₹ 0" value={partyData.creditLimit} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* CONTACT PERSON DETAILS (Matches Screenshot & Uses Calendar) */}
            <div className="section-header" style={{ marginTop: "30px" }}>
              <h3 className="section-heading">
                <BsPerson className="section-icon" /> Contact Person Details
              </h3>
            </div>
            <div className="form-grid-2">
              <div>
                <label className="form-label">
                  <BsPerson className="label-icon" /> Contact Person Name
                </label>
                <div className="input-with-icon">
                  <BsPerson className="field-icon" />
                  <input
                    type="text"
                    name="contactPersonName"
                    className="form-input icon-padded"
                    placeholder="Enter contact person name"
                    value={partyData.contactPersonName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">
                  <BsCalendar3 className="label-icon" /> Date of Birth
                </label>
                <div className="input-with-icon calendar-input">
                  <BsCalendar3 className="field-icon" />
                  <input
                    type="date"
                    name="dob"
                    className="form-input icon-padded"
                    value={partyData.dob}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Additional Notes</label>
              <textarea
                name="additionalDetails"
                className="form-textarea"
                value={partyData.additionalDetails}
                onChange={handleChange}
              ></textarea>
            </div>
            {/* --- PARTY BANK ACCOUNT --- */}
            <div className="section-header" style={{ marginTop: "30px" }}>
              <h3 className="section-heading">
                <BsBank className="section-icon" /> Party Bank Account
              </h3>
            </div>

            <div className="bank-section">
              {!showBankForm ? (
                <div className="add-bank-placeholder" onClick={() => setShowBankForm(true)}>
                  <BsBank className="bank-icon" />
                  <p>Add party bank information to manage transactions</p>
                  <button type="button" className="add-bank-link">
                    <BsBank /> Add Bank Account
                  </button>
                </div>
              ) : (
                <div className="bank-form fade-in">
                  <div className="form-grid-2">
                    <div>
                      <label className="form-label">Account Number</label>
                      <input type="text" name="accountNumber" className="form-input" value={partyData.bankDetails.accountNumber} onChange={handleBankChange} />
                    </div>
                    <div>
                      <label className="form-label">IFSC Code</label>
                      <input type="text" name="ifscCode" className="form-input" value={partyData.bankDetails.ifscCode} onChange={handleBankChange} />
                    </div>
                    <div>
                      <label className="form-label">Bank Name</label>
                      <input type="text" name="bankName" className="form-input" value={partyData.bankDetails.bankName} onChange={handleBankChange} />
                    </div>
                    <div>
                      <label className="form-label">Branch Name</label>
                      <input type="text" name="branchName" className="form-input" value={partyData.bankDetails.branchName} onChange={handleBankChange} />
                    </div>
                  </div>
                  <button type="button" className="cancel-bank-btn" onClick={() => setShowBankForm(false)}>Cancel</button>
                </div>
              )}
            </div>


            {/* SAVE BUTTON */}
            <div className="form-actions">
              <button type="submit" className="save-party-btn">
                <BsPersonFill /> Save Party Details
              </button>
              <button type="button" className="cancel-party-btn" onClick={() => window.history.back()}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
