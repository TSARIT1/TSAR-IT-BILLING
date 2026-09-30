import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  BsShieldLockFill, 
  BsEnvelopeFill, 
  BsKeyFill, 
  BsEyeFill, 
  BsEyeSlashFill, 
  BsArrowRight,
  BsCheckCircleFill,
  BsRocketTakeoffFill
} from "react-icons/bs";
import NavbarV6 from "../NavbarV6";
import { loginUser } from "../../services/api";
import Swal from "sweetalert2";
import "../login.css";
import "../landing-v6.css";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showLoginHelp, setShowLoginHelp] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
    setShowLoginHelp(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      setErrorMsg("Please enter both email/mobile and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(formData);

      if (response && response.token) {
        localStorage.setItem("token", response.token);
        const tenantRole = response.role || response.userRole || "TENANT_OWNER";
        if (response.user) {
          localStorage.setItem("user", JSON.stringify({
            ...response.user,
            role: tenantRole,
            businessId: response.businessId,
            userBusinessId: response.userBusinessId
          }));
          localStorage.setItem("businessData", JSON.stringify({
            businessName: response.businessName || response.user.businessName || "My Business",
            ownerName: response.user.ownerName || response.user.userName || "",
            phoneNo: response.user.mobileNo || "",
            email: response.user.email || ""
          }));
        }
        if (response.userId) {
          localStorage.setItem("userId", response.userId);
        }
        if (response.businessId) {
          localStorage.setItem("businessId", response.businessId);
        }
        if (response.userBusinessId) {
          localStorage.setItem("userBusinessId", response.userBusinessId);
        }
        localStorage.setItem("userRole", tenantRole);
        if (response.activePlan) {
          localStorage.setItem("userPlan", response.activePlan);
        }
        if (response.planId) {
          localStorage.setItem("userPlanId", response.planId);
        }
        if (response.daysRemaining !== undefined) {
          localStorage.setItem("trialDaysRemaining", String(response.daysRemaining));
        }

        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: `Welcome back to TSAR IT Billing!`,
          timer: 1200,
          showConfirmButton: false
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);
      } else {
        setErrorMsg("Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Login error:", err);
      }
      // api.js throws error.response.data directly (not the full Axios error)
      // so err IS the data object — access .error or .message directly
      const serverMsg = (err && (err.error || err.message)) || "Invalid email/mobile or password. Please try again.";
      const isInvalidLogin = serverMsg === "Invalid email/mobile or password";
      setErrorMsg(isInvalidLogin ? "Login failed. Check your password or register this business first." : serverMsg);
      setShowLoginHelp(isInvalidLogin);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <NavbarV6 />

      <div className="auth-split-wrapper">
        {/* Left Side: Brand Showcase */}
        <div className="auth-brand-side">
          <div className="brand-side-content">
            <div className="brand-pill">
              <BsRocketTakeoffFill className="text-warning me-2" />
              <span>All In One Bill</span>
            </div>

            <h1 className="brand-heading">
              Manage GST Bills, Stock & Payroll with Complete Precision
            </h1>

            <p className="brand-subtext">
              Log in to access your business ledger, multi-godown inventory, POS terminals, and audit-ready tax reports.
            </p>

            <div className="brand-feature-list">
              <div className="brand-feature-item">
                <BsCheckCircleFill className="text-success fs-5" />
                <div>
                  <strong>GST Compliant Invoicing</strong>
                  <div className="text-muted small">Automatic tax calculations & PDF exports</div>
                </div>
              </div>

              <div className="brand-feature-item">
                <BsCheckCircleFill className="text-success fs-5" />
                <div>
                  <strong>Real-Time Stock Sync</strong>
                  <div className="text-muted small">Multi-warehouse & barcode scanner support</div>
                </div>
              </div>

              <div className="brand-feature-item">
                <BsCheckCircleFill className="text-success fs-5" />
                <div>
                  <strong>Staff Payroll & Attendance</strong>
                  <div className="text-muted small">Automated deductions and monthly salary slips</div>
                </div>
              </div>
            </div>

            <div className="brand-side-footer">
              <BsShieldLockFill className="me-2 text-primary" />
              <span>Bank-grade 256-bit encryption • 99.99% cloud uptime</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="auth-form-side">
          <div className="auth-card-box shadow-lg animate-fade-in">
            <div className="auth-card-header">
              <h2>Welcome Back</h2>
              <p>Enter your registered email or mobile number to log in</p>
            </div>

            {errorMsg && (
              <div className="auth-alert alert alert-danger py-2 px-3 rounded-3 mb-4" role="alert">
                <div>{errorMsg}</div>
                {showLoginHelp && (
                  <div className="auth-alert-actions">
                    <Link to="/register">Register Business Free</Link>
                    <Link to="/forgot-password">Reset Password</Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email / Mobile Field */}
              <div className="form-group mb-3">
                <label className="form-label">Email or Mobile Number</label>
                <div className="input-with-icon">
                  <BsEnvelopeFill className="input-icon" />
                  <input
                    type="text"
                    name="username"
                    className="form-control auth-input"
                    placeholder="e.g. admin@tsarit.com or 9876543210"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label mb-0">Password</label>
                  <Link to="/forgot-password" className="small text-primary text-decoration-none fw-semibold">
                    Forgot Password?
                  </Link>
                </div>
                <div className="input-with-icon">
                  <BsKeyFill className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control auth-input"
                    placeholder="Enter your password"
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

              {/* Remember Me */}
              <div className="form-check mb-4">
                <input className="form-check-input" type="checkbox" id="rememberMe" defaultChecked />
                <label className="form-check-label small text-muted" htmlFor="rememberMe">
                  Remember this device for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn-saas-primary w-100 py-3 mb-3"
                disabled={loading}
              >
                {loading ? "Verifying Credentials..." : "Sign In to Portal"} <BsArrowRight />
              </button>

            </form>

            <div className="auth-card-footer text-center">
              <p className="text-muted small mb-0">
                Don't have an account yet?{" "}
                <Link to="/register" className="text-primary fw-bold text-decoration-none">
                  Register Business Free
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
