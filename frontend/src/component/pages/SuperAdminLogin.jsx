import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BsShieldLockFill,
  BsKeyFill,
  BsEyeFill,
  BsEyeSlashFill,
  BsArrowRight,
  BsShieldCheck,
  BsExclamationTriangleFill,
  BsArrowLeft,
} from "react-icons/bs";
import Swal from "sweetalert2";
import { superAdminLogin } from "../../services/api";
import "../login.css";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ adminId: "", masterKey: "" });
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.adminId.trim() || !credentials.masterKey.trim()) {
      setErrorMsg("Enter both Super Admin ID and password.");
      return;
    }

    setLoading(true);
    try {
      const resp = await superAdminLogin(credentials.adminId.trim(), credentials.masterKey);

      if (resp && resp.token && resp.role === "SUPER_ADMIN") {
        localStorage.setItem("token", resp.token);
        localStorage.setItem("user", JSON.stringify({
          id: resp.userId,
          email: resp.email,
          ownerName: resp.ownerName || "Super Admin",
          role: "SUPER_ADMIN",
          permissions: ["ALL_CONTROL", "KILLSWITCH", "TENANT_FREEZE", "PLAN_MANAGE", "TICKETS", "BROADCAST"]
        }));

        Swal.fire({
          icon: "success",
          title: "Super Admin Authenticated",
          timer: 1400,
          showConfirmButton: false
        });
        navigate("/super-admin");
      } else {
        setErrorMsg(resp?.error || "Authentication failed.");
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.error;
      setErrorMsg(serverMsg || "Authentication failed. Check credentials or try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-split-wrapper" style={{ minHeight: "100vh" }}>
        {/* Left brand side */}
        <div className="auth-brand-side">
          <div className="brand-side-content">
            <div className="brand-pill">
              <BsShieldLockFill className="me-2" />
              <span>Restricted Access — Platform Control Plane</span>
            </div>

            <h1 className="brand-heading">TSAR IT Super Admin</h1>

            <p className="brand-subtext">
              The master console for the whole platform: every tenant, subscription,
              support ticket, and the full audit trail — protected by role-enforced
              server authentication.
            </p>

            <div className="brand-feature-list">
              <div className="brand-feature-item">
                <BsShieldCheck className="text-success fs-5" />
                <div>
                  <strong>Server-side authorization</strong>
                  <div className="text-muted small">Every control-plane call re-checks your role</div>
                </div>
              </div>
              <div className="brand-feature-item">
                <BsShieldCheck className="text-success fs-5" />
                <div>
                  <strong>Audited by design</strong>
                  <div className="text-muted small">Logins, freezes and plan changes are recorded</div>
                </div>
              </div>
            </div>

            <div className="brand-side-footer">
              <BsShieldLockFill className="me-2 text-warning" />
              <span>All admin actions are permanently logged</span>
            </div>
          </div>
        </div>

        {/* Right form side */}
        <div className="auth-form-side">
          <div className="auth-card-box shadow-lg animate-fade-in">
            <div className="auth-card-header">
              <h2>Super Admin Sign In</h2>
              <p>Platform credentials only — tenant accounts cannot access this console</p>
            </div>

            {errorMsg && (
              <div className="auth-alert alert alert-danger py-2 px-3 rounded-3 mb-4" role="alert">
                <div className="d-flex align-items-center gap-2">
                  <BsExclamationTriangleFill /> {errorMsg}
                </div>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="auth-form">
              <div className="form-group mb-3">
                <label className="form-label">Super Admin ID (Email)</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <BsKeyFill className="text-muted" />
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0 ps-0"
                    name="adminId"
                    placeholder="admin@tsaritservices.com"
                    value={credentials.adminId}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <BsKeyFill className="text-muted" />
                  </span>
                  <input
                    type={showKey ? "text" : "password"}
                    className="form-control border-start-0 ps-0"
                    name="masterKey"
                    placeholder="Enter your password"
                    value={credentials.masterKey}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="input-group-text bg-white border-start-0"
                    onClick={() => setShowKey(!showKey)}
                    aria-label="Toggle password visibility"
                  >
                    {showKey ? <BsEyeSlashFill className="text-muted" /> : <BsEyeFill className="text-muted" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-3 d-flex justify-content-center align-items-center gap-2" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" /> Verifying…
                  </>
                ) : (
                  <>Enter Command Center <BsArrowRight /></>
                )}
              </button>
            </form>

            <div className="auth-card-footer text-center mt-4">
              <Link to="/" className="small text-decoration-none d-inline-flex align-items-center gap-1">
                <BsArrowLeft /> Back to main site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
