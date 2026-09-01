import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  BsShieldLockFill, 
  BsPersonFill, 
  BsBuildingsFill, 
  BsEnvelopeFill, 
  BsTelephoneFill, 
  BsKeyFill, 
  BsEyeFill, 
  BsEyeSlashFill, 
  BsArrowRight,
  BsCheckCircleFill,
  BsRocketTakeoffFill
} from "react-icons/bs";
import Navbar from "../Navbar";
import { registerUser } from "../../services/api";
import Swal from "sweetalert2";
import "../login.css";

export default function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ownerName: "",
    businessName: "",
    email: "",
    mobileNo: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.ownerName.trim() || !formData.businessName.trim() || !formData.mobileNo.trim() || !formData.password.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser(formData);

      Swal.fire({
        icon: "success",
        title: "Account Registered Successfully!",
        text: `Welcome to TSAR IT Billing, ${formData.ownerName}! Please login to access your dashboard.`,
        confirmButtonColor: "#4f46e5"
      }).then(() => {
        navigate("/login");
      });

    } catch (err) {
      console.error("Registration error:", err);
      // api.js throws error.response.data directly (not the full Axios error)
      // so err IS the data object — access .error or .message directly
      const serverMsg = (err && (err.error || err.message)) || "Registration failed. Please check your information or try another mobile number.";
      setErrorMsg(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <Navbar />

      <div className="auth-split-wrapper">
        {/* Left Side: Brand Showcase */}
        <div className="auth-brand-side">
          <div className="brand-side-content">
            <div className="brand-pill">
              <BsRocketTakeoffFill className="text-warning me-2" />
              <span>14-Day Free Access</span>
            </div>

            <h1 className="brand-heading">
              Join 100,000+ Smart Businesses Across India
            </h1>

            <p className="brand-subtext">
              Set up your business profile in 2 minutes. Start creating GST invoices, managing multi-godown stock, and processing POS bills today.
            </p>

            <div className="brand-feature-list">
              <div className="brand-feature-item">
                <BsCheckCircleFill className="text-success fs-5" />
                <div>
                  <strong>No Credit Card Required</strong>
                  <div className="text-muted small">Full access to all enterprise features for 14 days</div>
                </div>
              </div>

              <div className="brand-feature-item">
                <BsCheckCircleFill className="text-success fs-5" />
                <div>
                  <strong>Free Assisted Data Migration</strong>
                  <div className="text-muted small">Import items and customer ledgers from Excel/Tally</div>
                </div>
              </div>

              <div className="brand-feature-item">
                <BsCheckCircleFill className="text-success fs-5" />
                <div>
                  <strong>24/7 Dedicated Support</strong>
                  <div className="text-muted small">Live chat and phone support for fast onboarding</div>
                </div>
              </div>
            </div>

            <div className="brand-side-footer">
              <BsShieldLockFill className="me-2 text-primary" />
              <span>100% Data Privacy • GST Compliant • ISO Certified</span>
            </div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="auth-form-side">
          <div className="auth-card-box shadow-lg animate-fade-in">
            <div className="auth-card-header">
              <h2>Register Business</h2>
              <p>Create your billing portal administrator account</p>
            </div>

            {errorMsg && (
              <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3" role="alert">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Row 1: Owner Name & Business Name */}
              <div className="row g-2 mb-2">
                <div className="col-md-6">
                  <label className="form-label small">Owner / Full Name *</label>
                  <div className="input-with-icon">
                    <BsPersonFill className="input-icon" />
                    <input
                      type="text"
                      name="ownerName"
                      className="form-control auth-input"
                      placeholder="e.g. Rajesh Kumar"
                      value={formData.ownerName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small">Business / Shop Name *</label>
                  <div className="input-with-icon">
                    <BsBuildingsFill className="input-icon" />
                    <input
                      type="text"
                      name="businessName"
                      className="form-control auth-input"
                      placeholder="e.g. Apex Enterprises"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Mobile Number & Email */}
              <div className="row g-2 mb-2">
                <div className="col-md-6">
                  <label className="form-label small">Mobile Number *</label>
                  <div className="input-with-icon">
                    <BsTelephoneFill className="input-icon" />
                    <input
                      type="tel"
                      name="mobileNo"
                      className="form-control auth-input"
                      placeholder="10-digit Mobile No"
                      value={formData.mobileNo}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small">Business Email (Optional)</label>
                  <div className="input-with-icon">
                    <BsEnvelopeFill className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      className="form-control auth-input"
                      placeholder="name@business.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Industry & Sector */}
              <div className="form-group mb-2">
                <label className="form-label small">Industry / Business Sector *</label>
                <select
                  name="industryType"
                  className="form-select auth-input py-2"
                  value={formData.industryType || "Retail"}
                  onChange={handleChange}
                >
                  <optgroup label="Core Sectors">
                    <option value="Retail">Retail Store / Supermarket</option>
                    <option value="Wholesale">Wholesale & B2B Trading</option>
                    <option value="Distribution">Distributor & Logistics</option>
                    <option value="Manufacturing">Manufacturing & Production</option>
                    <option value="Service-Based">Service Provider / IT Consultancy</option>
                  </optgroup>
                  <optgroup label="Specialized Industries">
                    <option value="Pharmacy">Pharmacy / Chemist & Medical</option>
                    <option value="Restaurants">Restaurant / Cafe & Food Court</option>
                    <option value="Hotel">Hotel / Hospitality</option>
                    <option value="FMCG">FMCG & Consumer Goods</option>
                    <option value="Textile">Textile, Apparel & Garments</option>
                    <option value="Electronics">Electronics, Mobile & Hardware</option>
                  </optgroup>
                </select>
              </div>

              {/* Row 4: Password */}
              <div className="form-group mb-3">
                <label className="form-label small">Create Password *</label>
                <div className="input-with-icon">
                  <BsKeyFill className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control auth-input"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <BsEyeSlashFill /> : <BsEyeFill />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" id="termsCheck" required defaultChecked />
                <label className="form-check-label small text-muted" htmlFor="termsCheck">
                  I agree to the <a href="#terms" className="text-primary text-decoration-none">Terms of Service</a> & <a href="#privacy" className="text-primary text-decoration-none">Privacy Policy</a>
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn-saas-primary w-100 py-3 mb-2"
                disabled={loading}
              >
                {loading ? "Creating Business Account..." : "Create Free Account"} <BsArrowRight />
              </button>
            </form>

            <div className="auth-card-footer text-center">
              <p className="text-muted small mb-0">
                Already registered?{" "}
                <Link to="/login" className="text-primary fw-bold text-decoration-none">
                  Sign In to Existing Account
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
