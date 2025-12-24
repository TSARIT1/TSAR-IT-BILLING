import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { createCustomer, getCustomerById, updateCustomer } from "../../services/api";

export default function EditParty() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get customer ID from URL
  const isEditMode = Boolean(id); // Determine if we're editing or creating

  const [partyData, setPartyData] = useState({
    // Basic Details
    name: "",  // Maps to 'name' in customer table
    phone: "",  // Maps to 'phone' in customer table
    email: "",
    customer_type: "Customer",  // Maps to 'customer_type' in customer table
    status: "ACTIVE",  // Maps to 'status' enum in customer table

    // Address Details
    street_address: "",  // Maps to 'street_address' in customer table
    city: "",  // Maps to 'city' in customer table
    state: "",  // Maps to 'state' in customer table
    country: "",  // Maps to 'country' in customer table
    zip_code: "",  // Maps to 'zip_code' in customer table

    // Tax Details
    tax_id: "",  // Maps to 'tax_id' in customer table (GST/PAN)
    gstNumber: "",  // For UI compatibility
    panNumber: "",  // For UI compatibility

    // Additional Details
    notes: "",  // Maps to 'notes' in customer table

    // Legacy/Additional Fields (for backward compatibility)
    openingBalance: "",
    balanceType: "To Pay",
    partyCategory: "",
    billingAddress: "",
    shippingAddress: "",
    creditPeriod: "",
    creditLimit: "",
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      branchName: ""
    }
  });

  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch customer data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchCustomerData();
    }
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const customer = await getCustomerById(id);
      console.log("Fetched customer data:", customer);

      // Map backend camelCase fields to form snake_case fields
      setPartyData({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        customer_type: customer.customerType || "Customer",
        status: customer.status || "ACTIVE",
        street_address: customer.streetAddress || "",
        city: customer.city || "",
        state: customer.state || "",
        country: customer.country || "",
        zip_code: customer.zipCode || "",
        tax_id: customer.taxId || "",
        gstNumber: "",
        panNumber: "",
        notes: customer.notes || "",
        openingBalance: "",
        balanceType: "To Pay",
        partyCategory: "",
        billingAddress: "",
        shippingAddress: "",
        creditPeriod: "",
        creditLimit: "",
        bankDetails: {
          accountNumber: customer.bankDetails?.accountNumber || "",
          ifscCode: customer.bankDetails?.ifscCode || "",
          bankName: customer.bankDetails?.bankName || "",
          branchName: customer.bankDetails?.branchName || ""
        }
      });

      // Show bank form if bank details exist
      if (customer.bankDetails?.accountNumber) {
        setShowBankForm(true);
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      alert("Failed to load customer data. Redirecting to parties page.");
      navigate("/parties");
    } finally {
      setLoading(false);
    }
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get businessId from localStorage
    const businessId = localStorage.getItem("userBusinessId");

    if (!businessId && !isEditMode) {
      alert("Business ID not found. Please login again.");
      return;
    }

    // Prepare customer data matching backend entity field names (camelCase)
    const customerData = {
      businessId: businessId,  // UUID from localStorage
      name: partyData.name,
      phone: partyData.phone,
      email: partyData.email || null,
      customerType: partyData.customer_type,  // camelCase for backend
      status: partyData.status,
      streetAddress: partyData.street_address,  // camelCase for backend
      city: partyData.city || null,
      state: partyData.state || null,
      country: partyData.country || null,
      zipCode: partyData.zip_code,  // camelCase for backend
      taxId: partyData.tax_id,  // camelCase for backend
      notes: partyData.notes || null,

      // Bank Details (nested object - will be saved to bank_details table)
      bankDetails: {
        accountNumber: partyData.bankDetails.accountNumber || null,
        ifscCode: partyData.bankDetails.ifscCode || null,
        bankName: partyData.bankDetails.bankName || null,
        branchName: partyData.bankDetails.branchName || null
      }
    };

    try {
      console.log(isEditMode ? "Updating customer data:" : "Creating customer data:", customerData);

      let response;
      if (isEditMode) {
        // Update existing customer
        response = await updateCustomer(id, customerData);
        console.log("Customer updated successfully:", response);
        alert(`Customer "${partyData.name}" has been updated successfully!`);
      } else {
        // Create new customer
        response = await createCustomer(customerData);
        console.log("Customer created successfully:", response);
        alert(`Customer "${partyData.name}" has been added successfully!`);
      }

      // Navigate back to parties page to show updated customer list
      navigate('/parties');
    } catch (error) {
      console.error(isEditMode ? "Error updating customer:" : "Error creating customer:", error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} customer: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <>
      <Navbar />
      <Sidebar />

      <div className="edit-party-container">

        <div className="page-header">
          <h2 className="page-title">
            <BsPersonFill className="title-icon" /> {isEditMode ? 'Edit Party' : 'Add Party'}
          </h2>
          <p className="page-subtitle">
            {isEditMode ? 'Update customer and supplier information' : 'Manage your customer and supplier information'}
          </p>
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
                  <BsPersonFill className="label-icon" /> Customer Name *
                </label>
                <div className="input-with-icon">
                  <BsPersonFill className="field-icon" />
                  <input
                    type="text"
                    name="name"
                    className="form-input icon-padded"
                    placeholder="Enter customer name"
                    value={partyData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">
                  <BsTelephoneFill className="label-icon" /> Phone Number *
                </label>
                <div className="input-with-icon">
                  <BsTelephoneFill className="field-icon" />
                  <input
                    type="text"
                    name="phone"
                    className="form-input icon-padded"
                    placeholder="Enter phone number"
                    value={partyData.phone}
                    onChange={handleChange}
                    required
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
                <label className="form-label">Customer Type *</label>
                <select name="customer_type" className="form-input" value={partyData.customer_type} onChange={handleChange} required>
                  <option value="Customer">Customer</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>

            {/* Row 2: Status and Category */}
            <div className="form-grid-2" style={{ marginTop: "15px" }}>
              <div>
                <label className="form-label">Status *</label>
                <select name="status" className="form-input" value={partyData.status} onChange={handleChange} required>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label className="form-label">Category</label>
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
                <label className="form-label">Street Address</label>
                <textarea
                  name="street_address"
                  className="form-textarea"
                  value={partyData.street_address}
                  onChange={handleChange}
                  placeholder="Enter street address"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-grid-2" style={{ gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    placeholder="Enter city"
                    value={partyData.city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    className="form-input"
                    placeholder="Enter state"
                    value={partyData.state}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    name="country"
                    className="form-input"
                    placeholder="Enter country"
                    value={partyData.country}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">ZIP Code</label>
                  <input
                    type="text"
                    name="zip_code"
                    className="form-input"
                    placeholder="Enter ZIP code"
                    value={partyData.zip_code}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* TAX DETAILS */}
            <div className="section-header">
              <h3 className="section-heading">
                <BsCreditCard2Front className="section-icon" /> Tax Details
              </h3>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="form-label">Tax ID (GST/PAN/VAT)</label>
                <input
                  type="text"
                  name="tax_id"
                  className="form-input"
                  placeholder="Enter tax identification number"
                  value={partyData.tax_id}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label">GSTIN</label>
                <input
                  type="text"
                  name="gstNumber"
                  className="form-input"
                  placeholder="ex: 29XXXXX9438X1XX"
                  value={partyData.gstNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid-2" style={{ marginTop: "15px" }}>
              <div>
                <label className="form-label">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  className="form-input"
                  placeholder="Enter PAN number"
                  value={partyData.panNumber}
                  onChange={handleChange}
                />
              </div>
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
            </div>

            {/* --- CREDIT & BALANCE --- 
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
                   */}
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
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                className="form-textarea"
                value={partyData.notes}
                onChange={handleChange}
                placeholder="Add any additional notes or comments (max 2000 characters)"
                maxLength="2000"
                rows="4"
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
