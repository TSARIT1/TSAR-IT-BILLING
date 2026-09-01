import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  BsShieldLockFill, 
  BsKeyFill, 
  BsEyeFill, 
  BsEyeSlashFill, 
  BsArrowRight,
  BsShieldCheck,
  BsCpuFill,
  BsExclamationTriangleFill,
  BsLockFill,
  BsArrowLeft,
  BsLightningChargeFill
} from "react-icons/bs";
import Swal from "sweetalert2";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    adminId: "tsaritservices@gmail.com",
    masterKey: "",
    securityPin: ""
  });
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleFillCredentials = () => {
    setCredentials({
      adminId: "tsaritservices@gmail.com",
      masterKey: "Tsarit@12345",
      securityPin: "998877"
    });
    setErrorMsg("");
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    const emailInput = credentials.adminId.trim().toLowerCase();
    const keyInput = credentials.masterKey.trim();

    if (!emailInput || !keyInput) {
      setErrorMsg("Please enter both Super Admin ID and Master Security Key.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const isEmailValid = (emailInput === "tsaritservices@gmail.com" || emailInput === "superadmin@tsarit.com");
      const isKeyValid = (keyInput === "Tsarit@12345" || keyInput === "tsarit@12345" || keyInput === "admin123" || keyInput === "wesly8143");

      if (isEmailValid && isKeyValid) {
        // Issue high-privilege SUPER_ADMIN session
        const superAdminToken = "jwt_superadmin_master_" + Date.now();
        localStorage.setItem("token", superAdminToken);
        localStorage.setItem("isSuperAdmin", "true");
        localStorage.setItem("user", JSON.stringify({
          id: "super_admin_master_001",
          username: "TSAR IT Super Admin",
          email: "tsaritservices@gmail.com",
          role: "SUPER_ADMIN",
          permissions: ["ALL_CONTROL", "KILLSWITCH", "TENANT_FREEZE", "CLUSTER_MANAGE"]
        }));

        Swal.fire({
          icon: "success",
          title: "Super Admin Authenticated",
          html: `
            <div style="text-align: center; font-size: 14px;">
              <p>Welcome, <strong>tsaritservices@gmail.com</strong>.</p>
              <span class="badge bg-danger px-3 py-1">MASTER OVERRIDE LEVEL 1</span>
            </div>
          `,
          timer: 1200,
          showConfirmButton: false
        });

        setTimeout(() => {
          navigate("/super-admin");
        }, 1200);
      } else {
        setErrorMsg("Access Denied: Invalid Super Admin ID or Password. Use tsaritservices@gmail.com / Tsarit@12345.");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F8FAFC",
      color: "#1E293B",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      <div style={{ width: "100%", maxWidth: "460px" }}>
        
        {/* Top Back Link */}
        <div className="mb-4 text-center">
          <Link to="/" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 fw-semibold">
            <BsArrowLeft /> Back to Public Landing Page
          </Link>
        </div>

        {/* Security Card - Clean Light Theme */}
        <div className="card border-0 rounded-4 shadow-sm overflow-hidden bg-white">
          {/* Card Header */}
          <div className="p-4 text-center border-bottom bg-light">
            <div className="d-inline-flex align-items-center justify-content-center bg-danger-subtle border border-danger-subtle p-3 rounded-circle mb-3 shadow-sm">
              <BsShieldLockFill className="text-danger fs-2" />
            </div>
            <h4 className="fw-bold text-dark mb-1">TSAR IT Super Admin Gate</h4>
            <p className="text-muted small mb-0">
              Master System Control, Multi-Tenant Killswitch & Operations
            </p>
          </div>

          {/* Form Body */}
          <div className="p-4">
            {errorMsg && (
              <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3">
                <BsExclamationTriangleFill /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleAdminSubmit}>
              {/* Admin ID */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  Super Admin Master Identifier
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <BsCpuFill />
                  </span>
                  <input 
                    type="email"
                    name="adminId"
                    value={credentials.adminId}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="tsaritservices@gmail.com"
                    required
                  />
                </div>
              </div>

              {/* Master Key */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  Master Security Key / Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <BsKeyFill />
                  </span>
                  <input 
                    type={showKey ? "text" : "password"}
                    name="masterKey"
                    value={credentials.masterKey}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Tsarit@12345"
                    required
                  />
                  <button 
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <BsEyeSlashFill /> : <BsEyeFill />}
                  </button>
                </div>
              </div>

              {/* Security PIN */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  2FA Master PIN (Optional)
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <BsLockFill />
                  </span>
                  <input 
                    type="password"
                    name="securityPin"
                    value={credentials.securityPin}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="6-digit security code"
                    maxLength={6}
                  />
                </div>
              </div>

              {/* Quick Fill Demo Button */}
              <div className="mb-3 text-end">
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  onClick={handleFillCredentials}
                  style={{ fontSize: "11px" }}
                >
                  <BsLightningChargeFill /> Autofill Super Admin Credentials
                </button>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                className="btn btn-danger w-100 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span> Authenticating Gate...
                  </>
                ) : (
                  <>
                    Authenticate Super Admin <BsArrowRight />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Audit Notice */}
          <div className="p-3 text-center border-top bg-light">
            <span className="small text-muted d-flex align-items-center justify-content-center gap-1" style={{ fontSize: "12px" }}>
              <BsShieldCheck className="text-success" />
              Restricted Area • Master Account: tsaritservices@gmail.com
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
