import React, { useState } from "react";
import { useNavigate ,Link} from "react-router-dom";
import Navbar from "../Navbar";
import { registerUser } from "../../services/api";
import "../registration.css";

export  default function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "" 
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
     setLoading(true);

    try {
      // 2. Prepare data for Spring Boot (Exclude confirmPassword)
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      // 3. Call Backend
      const response = await registerUser(dataToSend);
      
      console.log("Registration Success:", response);
      alert("Registration Successful! Please Login.");
      
      // 4. Redirect to Login Page
      navigate("/login");

    } catch (error) {
      console.error("Registration Failed:", error);
      // Show error message from backend or default message
      alert(error.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
    
    console.log("Register Data:", formData);
    // Add API call here
    // navigate("/login");
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
            
            {/* Full Name */}
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Confirm Password (Optional but recommended) */}
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="register-submit-btn">
              Register
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
