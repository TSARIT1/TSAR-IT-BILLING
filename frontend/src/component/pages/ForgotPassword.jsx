import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BsEnvelopeFill, 
  BsKeyFill, 
  BsArrowLeft, 
  BsCheckCircleFill, 
  BsShieldLockFill,
  BsArrowRight,
  BsEyeFill,
  BsEyeSlashFill
} from "react-icons/bs";
import Swal from "sweetalert2";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "../login.css";
import { forgotPassword, resetPassword } from "../../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request OTP/Reset Link, 2: Enter OTP & New Password
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendReset = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      Swal.fire("Error", "Please enter your registered email or 10-digit mobile number.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword(identifier.trim());
      setLoading(false);
      setStep(2);
      const codeHint = res.otp ? ` (Verification code: ${res.otp})` : "";
      Swal.fire({
        icon: "success",
        title: "Verification Code Sent!",
        text: `A 6-digit security reset code has been sent to ${identifier}.${codeHint}`,
        confirmButtonColor: "#4f46e5"
      });
    } catch (err) {
      setLoading(false);
      const msg = typeof err === "object" && err.error ? err.error : (err.message || "Failed to send reset code.");
      Swal.fire("Error", msg, "error");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      Swal.fire("Error", "Password must be at least 6 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire("Error", "New password and confirmation do not match.", "error");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({
        identifier: identifier.trim(),
        otp: otp.trim(),
        newPassword
      });
      setLoading(false);
      Swal.fire({
        icon: "success",
        title: "Password Updated Successfully!",
        text: "Your password has been reset. You can now log in with your new credentials.",
        confirmButtonColor: "#4f46e5"
      }).then(() => {
        navigate("/login");
      });
    } catch (err) {
      setLoading(false);
      const msg = typeof err === "object" && err.error ? err.error : (err.message || "Failed to reset password.");
      Swal.fire("Error", msg, "error");
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Navbar />

      <div className="auth-split-container" style={{ paddingTop: "100px", paddingBottom: "60px" }}>
        <div className="auth-form-side mx-auto" style={{ maxWidth: "500px", width: "100%" }}>
          <div className="auth-card-box shadow-lg animate-fade-in p-4 p-md-5 rounded-4 bg-white border">
            <div className="text-center mb-4">
              <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary fs-3 mb-2">
                <BsShieldLockFill />
              </div>
              <h2 className="fw-bold text-dark mb-1">
                {step === 1 ? "Reset Your Password" : "Set New Password"}
              </h2>
              <p className="text-muted small">
                {step === 1 
                  ? "Enter your registered email address or mobile number to receive a verification reset code."
                  : "Enter the 6-digit verification code and choose your new secure password."}
              </p>
            </div>

            {step === 1 ? (
              <form onSubmit={handleSendReset}>
                <div className="form-group mb-3">
                  <label className="form-label small fw-bold text-secondary">Email or 10-Digit Mobile Number *</label>
                  <div className="input-with-icon">
                    <BsEnvelopeFill className="input-icon" />
                    <input
                      type="text"
                      className="form-control auth-input"
                      placeholder="e.g. rahul@business.com or 9876543210"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  disabled={loading}
                >
                  {loading ? "Sending Reset Code..." : "Send Verification Code"} <BsArrowRight />
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="form-group mb-3">
                  <label className="form-label small fw-bold text-secondary">6-Digit Code (Demo: 123456) *</label>
                  <input
                    type="text"
                    className="form-control auth-input text-center fw-bold fs-5 letter-spacing-2"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label small fw-bold text-secondary">New Password (Min 6 chars) *</label>
                  <div className="input-with-icon">
                    <BsKeyFill className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control auth-input"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                <div className="form-group mb-4">
                  <label className="form-label small fw-bold text-secondary">Confirm New Password *</label>
                  <div className="input-with-icon">
                    <BsKeyFill className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control auth-input"
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm mb-2"
                  disabled={loading}
                >
                  {loading ? "Updating Password..." : "Update Password & Log In"} <BsCheckCircleFill />
                </button>

                <button
                  type="button"
                  className="btn btn-link text-muted w-100 text-decoration-none small"
                  onClick={() => setStep(1)}
                >
                  Change Email or Mobile Number
                </button>
              </form>
            )}

            <div className="text-center mt-4 pt-3 border-top">
              <Link to="/login" className="text-primary small text-decoration-none fw-bold d-inline-flex align-items-center gap-1">
                <BsArrowLeft /> Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
