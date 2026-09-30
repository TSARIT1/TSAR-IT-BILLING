import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Safely parse user from localStorage — corrupt JSON should not crash the app
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (e) {
    // If user JSON is corrupt, treat as logged out
    localStorage.removeItem("user");
  }

  // Authentication check — no token means redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authorization Role Check — if requiredRole is set, user MUST have that exact role
  // (or be a SUPER_ADMIN). If user.role is missing/undefined, access is denied.
  if (requiredRole) {
    // Login responses keep tenant role at the top level, while older sessions
    // store it in the user object. Support both formats consistently.
    const userRole = user.role || localStorage.getItem("userRole");
    if (!userRole || (userRole !== requiredRole && userRole !== "SUPER_ADMIN")) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
