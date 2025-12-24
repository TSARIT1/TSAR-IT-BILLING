import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../Navbar";
import { registerUser } from "../../services/api";
import "../registration.css";

export default function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    mobileNo: "",
    password: "",
    confirmPassword: "",
    referredBy: ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    if(email){
    if (!email.includes("@")) return "Email must contain @";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
    }
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    return "";
  };

  const validateMobileNo = (mobile) => {
    if (!mobile) return "Mobile number is required";
    if (!/^\d{10}$/.test(mobile)) return "Mobile number must be exactly 10 digits";
    return "";
  };

  const validateBusinessName = (name) => {
    if (!name) return "Business name is required";
    if (name.length < 3) return "Business name must be at least 3 characters";
    return "";
  };

  const validateOwnerName = (name) => {
    if (!name) return "Owner name is required";
    if (name.length < 2) return "Owner name must be at least 2 characters";
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  // Validate single field
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      case "confirmPassword":
        return validateConfirmPassword(value, formData.password);
      case "mobileNo":
        return validateMobileNo(value);
      case "businessName":
        return validateBusinessName(value);
      case "ownerName":
        return validateOwnerName(value);
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate on change if field was already touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });

    // Validate on blur
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      businessName: validateBusinessName(formData.businessName),
      ownerName: validateOwnerName(formData.ownerName),
      email: validateEmail(formData.email),
      mobileNo: validateMobileNo(formData.mobileNo),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password)
    };

    setErrors(newErrors);
    setTouched({
      businessName: true,
      ownerName: true,
      email: true,
      mobileNo: true,
      password: true,
      confirmPassword: true
    });

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== "");
    if (hasErrors) {
      alert("Please fix all errors before submitting");
      return;
    }

    setLoading(true);

    try {
      // Prepare data for Spring Boot (Exclude confirmPassword)
      const dataToSend = {
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        email: formData.email,
        mobileNo: formData.mobileNo,
        password: formData.password,
        referredBy: formData.referredBy || null
      };

      // Call Backend
      const response = await registerUser(dataToSend);

      console.log("Registration Success:", response);
      alert("Registration Successful! Please Login.");

      // Redirect to Login Page
      navigate("/login");

    } catch (error) {
      console.error("Registration Failed:", error);
      // Show error message from backend or default message
      alert(error.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="register-container">

        {/* LEFT SIDE - Branding (Navy Blue) */}
        <div className="register-banner">
          <div className="banner-content">
            <h1>Start Your Journey</h1>
            <p>
              Join thousands of businesses managing their billing, inventory, and accounting effortlessly.
            </p>
            <div className="decoration-circle"></div>
          </div>
        </div>

        {/* RIGHT SIDE - Registration Form (White) */}
        <div className="register-form-wrapper">
          <div className="register-box">
            <h2>Create Account</h2>
            <p className="sub-text">Fill in your details to get started.</p>

            <form onSubmit={handleSubmit}>

              {/* Two Column Grid */}
              <div className="row g-3">

                {/* Left Column */}
                <div className="col-md-6">
                  {/* Business Name */}
                  <div className="input-group">
                    <label htmlFor="businessName">Business Name</label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      placeholder="Enter your business name"
                      value={formData.businessName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.businessName && touched.businessName ? "error" : (touched.businessName && !errors.businessName ? "success" : "")}
                    />
                    {errors.businessName && touched.businessName && (
                      <span className="error-message">⚠ {errors.businessName}</span>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-md-6">
                  {/* Owner Name */}
                  <div className="input-group">
                    <label htmlFor="ownerName">Owner Name</label>
                    <input
                      type="text"
                      id="ownerName"
                      name="ownerName"
                      placeholder="Enter owner's name"
                      value={formData.ownerName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.ownerName && touched.ownerName ? "error" : (touched.ownerName && !errors.ownerName ? "success" : "")}
                    />
                    {errors.ownerName && touched.ownerName && (
                      <span className="error-message">⚠ {errors.ownerName}</span>
                    )}
                  </div>
                </div>

                {/* Email - Left Column */}
                <div className="col-md-6">
                  <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="text"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.email && touched.email ? "error" : (touched.email && !errors.email ? "success" : "")}
                    />
                    {errors.email && touched.email && (
                      <span className="error-message">⚠ {errors.email}</span>
                    )}
                  </div>
                </div>

                {/* Mobile Number - Right Column */}
                <div className="col-md-6">
                  <div className="input-group">
                    <label htmlFor="mobileNo">Mobile Number</label>
                    <input
                      type="text"
                      id="mobileNo"
                      name="mobileNo"
                      placeholder="Enter 10-digit mobile number"
                      value={formData.mobileNo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.mobileNo && touched.mobileNo ? "error" : (touched.mobileNo && !errors.mobileNo ? "success" : "")}
                    />
                    {errors.mobileNo && touched.mobileNo && (
                      <span className="error-message">⚠ {errors.mobileNo}</span>
                    )}
                  </div>
                </div>

                {/* Password - Left Column */}
                <div className="col-md-6">
                  <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Min 8 chars, 1 upper, 1 lower, 1 number"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.password && touched.password ? "error" : (touched.password && !errors.password ? "success" : "")}
                    />
                    {errors.password && touched.password && (
                      <span className="error-message">⚠ {errors.password}</span>
                    )}
                  </div>
                </div>

                {/* Confirm Password - Right Column */}
                <div className="col-md-6">
                  <div className="input-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.confirmPassword && touched.confirmPassword ? "error" : (touched.confirmPassword && !errors.confirmPassword ? "success" : "")}
                    />
                    {errors.confirmPassword && touched.confirmPassword && (
                      <span className="error-message">⚠ {errors.confirmPassword}</span>
                    )}
                  </div>
                </div>

                {/* Referred By - Full Width */}
                <div className="col-12">
                  <div className="input-group">
                    <label htmlFor="referredBy">Referred By (Optional)</label>
                    <input
                      type="text"
                      id="referredBy"
                      name="referredBy"
                      placeholder="Referral code or name"
                      value={formData.referredBy}
                      onChange={handleChange}
                    />
                  </div>
                </div>

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="register-submit-btn"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            {/* Login Redirection */}
            <div className="login-link">
              <p>
                Already have an account?{" "}
                <Link to="/login">Login Here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
