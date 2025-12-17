import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../applyLoan.css";
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import "bootstrap-icons/font/bootstrap-icons.css";

function ApplyLoan() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [viewMode, setViewMode] = useState("form"); // "form" or "applications"

  // Form state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [pincode, setPincode] = useState("");
  const [incorporationDate, setIncorporationDate] = useState("");
  const [businessType, setBusinessType] = useState("Proprietorship");
  const [ownProperty, setOwnProperty] = useState("No");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [email, setEmail] = useState("");

  // Applications data from database
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch applications from database/API
  useEffect(() => {
    if (viewMode === "applications") {
      fetchApplications();
    }
  }, [viewMode]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace this URL with your actual API endpoint
      const response = await fetch('/api/loan-applications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message);
      // For development: Use empty array if API is not available
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    alert("Loan application submitted successfully!");
    navigate(-1);
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content apply-loan-page" style={{ marginTop: "2%" }}>

          {/* Enhanced Header */}
          <div className="loan-header">
            <div className="header-left">
              <h2>
                <i className="bi bi-cash-stack"></i> Apply for Business Loan
              </h2>
              <p className="header-subtitle">
                <i className="bi bi-info-circle"></i> Get instant business loan with minimal documentation
              </p>
            </div>

            <div className="header-actions">
              <button
                className={`btn btn-sm ${viewMode === "applications" ? "btn-outline-primary" : "btn-primary"}`}
                onClick={() => setViewMode(viewMode === "form" ? "applications" : "form")}
              >
                <i className={`bi ${viewMode === "form" ? "bi-list-ul" : "bi-plus-circle"}`}></i>
                {viewMode === "form" ? "View Applications" : "New Application"}
              </button>
            </div>
          </div>


          {/* Progress Stepper - Only show in form mode */}
          {viewMode === "form" && (
            <div className="progress-stepper">
              <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <div className="step-circle">
                  {step > 1 ? <FiCheck /> : '1'}
                </div>
                <span className="step-label">Contact Info</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <div className="step-circle">
                  {step > 2 ? <FiCheck /> : '2'}
                </div>
                <span className="step-label">Business Details</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${step >= 3 ? 'active' : ''}`}>
                <div className="step-circle">3</div>
                <span className="step-label">Loan Information</span>
              </div>
            </div>
          )}

          {/* Step 1: Contact Information */}
          {viewMode === "form" && step === 1 && (
            <div className="loan-form-card">
              <div className="form-header">
                <div className="form-icon">
                  <i className="bi bi-telephone"></i>
                </div>
                <div>
                  <h3>Contact Information</h3>
                  <p>Please enter your contact details to get started</p>
                </div>
              </div>

              <div className="form-body">
                <div className="form-group">
                  <label>
                    <i className="bi bi-phone"></i> Phone Number *
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter 10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    maxLength="10"
                  />
                  <small className="form-text">We'll send OTP to this number for verification</small>
                </div>

                <div className="form-group">
                  <label>
                    <i className="bi bi-envelope"></i> Email Address *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="info-box">
                  <i className="bi bi-shield-check"></i>
                  <div>
                    <strong>Your information is secure</strong>
                    <p>We use bank-level encryption to protect your data</p>
                  </div>
                </div>
              </div>

              <div className="form-footer">
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                  <FiArrowLeft /> Cancel
                </button>
                <button className="btn btn-primary" onClick={handleNext}>
                  Next <FiArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Business Details */}
          {viewMode === "form" && step === 2 && (
            <div className="loan-form-card">
              <div className="form-header">
                <div className="form-icon">
                  <i className="bi bi-building"></i>
                </div>
                <div>
                  <h3>Business Details</h3>
                  <p>Tell us more about your business</p>
                </div>
              </div>

              <div className="form-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-shop"></i> Business Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your business name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-geo-alt"></i> Pincode *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="123456"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      maxLength="6"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-calendar3"></i> Business Incorporation Date *
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={incorporationDate}
                      onChange={(e) => setIncorporationDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-briefcase"></i> Business Type *
                    </label>
                    <select
                      className="form-select"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                    >
                      <option value="Proprietorship">Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Private Limited">Private Limited</option>
                      <option value="LLP">LLP</option>
                      <option value="Public Limited">Public Limited</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-credit-card"></i> PAN Number *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ABCDE1234F"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      maxLength="10"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-file-text"></i> GST Number (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="22AAAAA0000A1Z5"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      maxLength="15"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <i className="bi bi-house"></i> Do you own your business premises? *
                  </label>
                  <div className="toggle-buttons">
                    <button
                      className={`toggle-btn ${ownProperty === 'Yes' ? 'active' : ''}`}
                      onClick={() => setOwnProperty('Yes')}
                    >
                      <i className="bi bi-check-circle"></i> Yes
                    </button>
                    <button
                      className={`toggle-btn ${ownProperty === 'No' ? 'active' : ''}`}
                      onClick={() => setOwnProperty('No')}
                    >
                      <i className="bi bi-x-circle"></i> No
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-footer">
                <button className="btn btn-outline-secondary" onClick={handleBack}>
                  <FiArrowLeft /> Back
                </button>
                <button className="btn btn-primary" onClick={handleNext}>
                  Next <FiArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Loan Information */}
          {viewMode === "form" && step === 3 && (
            <div className="loan-form-card">
              <div className="form-header">
                <div className="form-icon">
                  <i className="bi bi-cash-coin"></i>
                </div>
                <div>
                  <h3>Loan Information</h3>
                  <p>Specify your loan requirements</p>
                </div>
              </div>

              <div className="form-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-currency-rupee"></i> Loan Amount Required *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter amount in ₹"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                    />
                    <small className="form-text">Minimum: ₹50,000 | Maximum: ₹50,00,000</small>
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-graph-up"></i> Monthly Revenue *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Average monthly revenue"
                      value={monthlyRevenue}
                      onChange={(e) => setMonthlyRevenue(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <i className="bi bi-list-ul"></i> Purpose of Loan *
                  </label>
                  <select
                    className="form-select"
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                  >
                    <option value="">Select purpose</option>
                    <option value="Working Capital">Working Capital</option>
                    <option value="Business Expansion">Business Expansion</option>
                    <option value="Equipment Purchase">Equipment Purchase</option>
                    <option value="Inventory Purchase">Inventory Purchase</option>
                    <option value="Debt Consolidation">Debt Consolidation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="info-box success">
                  <i className="bi bi-lightning-charge"></i>
                  <div>
                    <strong>Quick Approval Process</strong>
                    <p>Get loan approval within 24-48 hours with minimal documentation</p>
                  </div>
                </div>

                <div className="features-list">
                  <h4><i className="bi bi-star"></i> Loan Features</h4>
                  <ul>
                    <li><i className="bi bi-check2-circle"></i> Competitive interest rates starting from 12% p.a.</li>
                    <li><i className="bi bi-check2-circle"></i> Flexible repayment tenure up to 5 years</li>
                    <li><i className="bi bi-check2-circle"></i> No hidden charges or prepayment penalties</li>
                    <li><i className="bi bi-check2-circle"></i> Minimal documentation required</li>
                  </ul>
                </div>
              </div>

              <div className="form-footer">
                <button className="btn btn-outline-secondary" onClick={handleBack}>
                  <FiArrowLeft /> Back
                </button>
                <button className="btn btn-success btn-lg" onClick={handleSubmit}>
                  <i className="bi bi-send"></i> Submit Application
                </button>
              </div>
            </div>
          )}

          {/* Applications View */}
          {viewMode === "applications" && (
            <div className="applications-view">
              <div className="applications-header">
                <div>
                  <h3>
                    <i className="bi bi-list-check"></i> Your Loan Applications
                  </h3>
                  <p>Track the status of your submitted loan applications</p>
                </div>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => navigate(-1)}
                >
                  <i className="bi bi-x-circle"></i> Cancel
                </button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="loading-state">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p>Loading applications...</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="alert alert-warning" role="alert">
                  <i className="bi bi-exclamation-triangle"></i> {error}
                  <button
                    className="btn btn-sm btn-link"
                    onClick={fetchApplications}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Applications Table */}
              {!loading && !error && applications.length > 0 && (
                <div className="applications-table-card">
                  <div className="table-header-row">
                    <div className="header-cell">
                      <i className="bi bi-hash"></i> Application ID
                    </div>
                    <div className="header-cell">
                      <i className="bi bi-building"></i> Business Name
                    </div>
                    <div className="header-cell">
                      <i className="bi bi-currency-rupee"></i> Loan Amount
                    </div>
                    <div className="header-cell">
                      <i className="bi bi-list-ul"></i> Purpose
                    </div>
                    <div className="header-cell">
                      <i className="bi bi-calendar3"></i> Applied Date
                    </div>
                    <div className="header-cell">
                      <i className="bi bi-info-circle"></i> Status
                    </div>
                    <div className="header-cell">
                      <i className="bi bi-gear"></i> Actions
                    </div>
                  </div>

                  {applications.map((app) => (
                    <div key={app.id} className="table-row">
                      <div className="table-cell">
                        <span className="app-id">{app.id}</span>
                      </div>
                      <div className="table-cell">
                        <strong>{app.businessName}</strong>
                      </div>
                      <div className="table-cell">
                        <span className="amount-text">{app.amount}</span>
                      </div>
                      <div className="table-cell">{app.purpose}</div>
                      <div className="table-cell">{app.date}</div>
                      <div className="table-cell">
                        <span className={`status-badge ${app.status.toLowerCase().replace(' ', '-')}`}>
                          {app.status === "Approved" && <i className="bi bi-check-circle"></i>}
                          {app.status === "Pending" && <i className="bi bi-clock"></i>}
                          {app.status === "Under Review" && <i className="bi bi-eye"></i>}
                          {app.status}
                        </span>
                      </div>
                      <div className="table-cell">
                        <button className="btn btn-sm btn-outline-primary action-btn">
                          <i className="bi bi-eye"></i> View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && applications.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="bi bi-inbox"></i>
                  </div>
                  <h4>No Applications Found</h4>
                  <p>You haven't submitted any loan applications yet</p>
                  <button
                    className="btn btn-primary mt-3"
                    onClick={() => setViewMode("form")}
                  >
                    <i className="bi bi-plus-circle"></i> Apply for Loan
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div >
    </>
  );
}

export default ApplyLoan;
