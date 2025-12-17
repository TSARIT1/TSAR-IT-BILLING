import React, { useState } from "react";
import "../login.css";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../Navbar";
import { loginUser } from "../../services/api";
import Swal from "sweetalert2";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(""); // Clear error when user types
  };
  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter email and password!",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Login Successful!",
      showConfirmButton: false,
      timer: 1500,
    });

    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add your login logic here (API call)
    try {
      // 1. Call Backend
      const response = await loginUser(formData);
      console.log("FULL LOGIN API RESPONSE => ", response);

      // 2. Save Token/User to LocalStorage (Adjust based on your Spring Boot response)
      // Example: If Spring Boot returns { token: "abc", user: {...} }
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      // Save userId separately
      if (response.userId) {
        localStorage.setItem("userId", response.userId);
        console.log("User ID Stored:", response.userId);
      } else {
        console.error("ERROR: userId not found in response");
      }
      // 3. Redirect to Dashboard
      navigate("/dashboard"); // Or navigate("/dashboard")

    } catch (error) {
      console.error("Login Failed:", error);
      setErrorMsg("Invalid username or password.");
    }
    console.log("Login Data:", formData);

    // For demo purposes, navigate to dashboard
    // navigate("/dashboard");
  };

  return (
    <>
      <Navbar />
      <div className="login-container">

        {/* LEFT SIDE - Branding & Theme */}
        <div className="login-banner">
          <div className="banner-content">
            <h1>Welcome Back!</h1>
            <p>
              Manage your Invoices, Inventory, and GST Billing all in one place.
            </p>
            {/* You can add an <img> tag here for a billing illustration */}
            <div className="decoration-circle"></div>
          </div>
        </div>

        {/* RIGHT SIDE - Login Form */}
        <div className="login-form-wrapper">
          <div className="login-box">
            <h2>Login to BillingBook</h2>
            <p className="sub-text">Please enter your details to continue.</p>
            {errorMsg && <p style={{ color: 'red', marginBottom: '15px' }}>{errorMsg}</p>}
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="username">Email Address</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your email"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <i className="bi bi-envelope-fill"></i>
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <i className="bi bi-lock-fill"></i>
              </div>

              <div className="form-actions">
                <label className="remember-me">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" className="forgot-password">Forgot Password?</a>
              </div>

              <button type="submit" className="login-submit-btn">
                <i className="bi bi-box-arrow-in-right me-2"></i>Login
              </button>
            </form>

            <div className="register-link">
              <p>
                Don't have an account?{" "}
                <Link to="/register">Register Here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};



