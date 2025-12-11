import { Link } from "react-router-dom";
import "../index.css";
import "./navbar.css"
import "./style.css"
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom'; // import navigation hook
import { BsPersonCircle, BsGear } from "react-icons/bs"; // Import Bootstrap icons
import image from "../asstes/billbook.png"
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // get current route
  const [drop, setDrop] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const dropdownRef = useRef(null);
  // Only show Login/Register links on specific pages
  const showFullNavbarRoutes = ["/", "/login", "/register"];
  const showFullNavbar = showFullNavbarRoutes.includes(location.pathname);
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDrop(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  const toggleMenu = (menuName, e) => {
    e.preventDefault();
    // If clicking the same menu, close it. Otherwise, open the new one.
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };
  const goToRegister = () => {
    navigate("/register"); // redirect to registration route
  };
  const goToLogin = () => {
    navigate("/login"); // redirect to login route
  };
  // Check if the current route is dashboard
  // const isDashboard = location.pathname === "/dashboard" ,isDashboard = location.pathname === "/dashboard" ;

  return (
    <div className="main-content">
      <nav id="navbar">
        <div className="logo">
          <img src={image} alt="logo" />
        </div>
        {showFullNavbar && (
          <>
            <div className={`nav-links ${mobileMenu ? "active" : ""}`} id="nav-links">
              <div className="dropdown" ref={dropdownRef}>
                <a href="#" className="dropdown-button" onClick={(e) => {
                  e.preventDefault();
                  setDrop(!drop);
                }}>Features</a>
                <ul className={`dropdown-menu ${drop ? "open" : ""}`}>
                  <li><a href="#">GST Billing & Invoicing</a></li>
                  <li><a href="#">Inventory Management</a></li>
                  <li><a href="#">BookKeeping</a></li>
                  <li><a href="#">POS Billing</a></li>
                  <li><a href="#">Business Marketing</a></li>
                  <li><a href="#">eWay Billing</a></li>
                  <li><a href="#">eInvoicing</a></li>
                </ul>
              </div>

              <div className="dropdown" ref={dropdownRef}>

                <a href="#" className="dropdown-button" onClick={(e) => {
                  e.preventDefault();
                  setDrop(!drop);
                }}>Solutions</a>
                <div className={`dropdown-menu ${drop ? "open" : ""}`}>
                  <div className="menu-column">
                    {/*  <h4>Industry Type</h4>*/}
                    <div className="column">
                      <li><a href="#">Retail</a></li>
                      <li><a href="#">Distribution</a> </li>
                      <li><a href="#">Wholesale</a> </li>
                      <li><a href="#">Manufacturing</a> </li>
                      <li><a href="#">Service-Based</a> </li>
                    </div>
                  </div>
                  {/*
               <div className="menu-column">
                <h4>Sectors</h4>
                <div className="column">
                <li><a href="#">Restaurant</a></li>
                <li><a href="#">Hotels</a></li>
                <li><a href="#">pharmacy</a></li>
                 <li><a href="#">Textile</a></li>
                 <li><a href="#">Electronics</a></li>
              </div>
              </div>
*/}
                </div>
              </div>
              <div className="dropdown" ref={dropdownRef}>
                <a href="#" className="dropdown-button" onClick={(e) => {
                  e.preventDefault();
                  setDrop(!drop);
                }}>Knowledge Center</a>
                <ul className={`dropdown-menu ${drop ? "open" : ""}`}>
                  <li><a href="#">Knowledge Base</a></li>
                  <li><a href="#">Testimonials</a></li>
                  <li><a href="#">Services</a></li>
                  <li><a href="#">Blogs</a></li>

                </ul>
              </div>
              <div className="dropdown" ref={dropdownRef}>
                <a href="#" className="dropdown-button" onClick={(e) => {
                  e.preventDefault();
                  setDrop(!drop);
                }}>Pricing</a>
              </div>

            </div>

            <div className="nav-buttons">
              {/* Only show Login/Register if NOT on dashboard */}
              {location.pathname == "/" && (
                <>
                  <button className="login-btn" onClick={goToLogin}>Login</button>
                  {/*<button className="register-btn" onClick={goToRegister}>Register</button> */}
                  <button className="demo-btn">Book Free Demo</button>
                  <button className="start-free">Start Free Billing →</button>
                </>
              )}

              {/* Show Profile/Settings button only on dashboard pages */}
              {!showFullNavbar && (
                <div className="profile-section">
                  <button
                    className="profile-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDrop(!drop);
                    }}
                  >
                    <BsPersonCircle className="profile-icon" />
                    <span className="profile-text">Profile</span>
                  </button>

                  {drop && (
                    <div className="profile-dropdown">
                      <div className="profile-dropdown-item" onClick={() => navigate("/profile")}>
                        <BsPersonCircle /> My Profile
                      </div>
                      <div className="profile-dropdown-item" onClick={() => navigate("/settings")}>
                        <BsGear /> Settings
                      </div>
                      <div className="profile-dropdown-divider"></div>
                      <div className="profile-dropdown-item logout" onClick={() => navigate("/")}>
                        Logout
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* <Link to="/dashboard">
          
        </Link>
        */}
              {/*
        <button className="demo-btn">Book Free Demo</button>
        <button className="start-btn">Start Free Billing →</button>
        */}
            </div>

            {/* MOBILE MENU BUTTON */}
            <div
              className="hamburger"
              id="hamburger"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              <i className="fa-solid fa-bars"></i>
            </div>
          </>
        )}
      </nav>
    </div>
  );
}

export default Navbar;
