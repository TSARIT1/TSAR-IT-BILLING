import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  BsReceiptCutoff, 
  BsBoxSeam, 
  BsShop, 
  BsBuildings, 
  BsPeopleFill, 
  BsFileEarmarkCheck, 
  BsList, 
  BsX, 
  BsArrowRight,
  BsSpeedometer2,
  BsPersonCircle,
  BsShieldCheck,
  BsAndroid2,
  BsChevronDown,
  BsTruck,
  BsGearWideConnected,
  BsCapsule,
  BsTagFill,
  BsBoxArrowRight,
  BsTelephoneFill,
  BsStars,
  BsBoxes,
  BsLaptopFill,
  BsPatchCheckFill,
  BsQuestionCircleFill
} from "react-icons/bs";
import tsarItLogo from "../asstes/tsar_it_logo.jpg";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  // Safe user parse
  let storedUser = null;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) {
      storedUser = null;
    }
  }
  const isLoggedIn = !!token && !!storedUser;
  const ownerName = (storedUser && (storedUser.ownerName || storedUser.businessName)) || "User";
  const userProfileImage = localStorage.getItem("userProfileImage") || "";
  const companyLogo = localStorage.getItem("companyLogo") || "";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleMouseEnter = (name) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <>
      {/* Top Enterprise Direct Contact Strip */}
      <div className="top-enterprise-strip d-none d-md-block">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-4">
            <span className="d-flex align-items-center gap-2">
              <span className="live-status-pulse"></span>
              <strong className="text-white">Direct Enterprise Support:</strong> 
              <a href="tel:+919491301258" className="strip-link">+91 9491301258</a> • 
              <a href="tel:+918142616767" className="strip-link">+91 8142616767</a>
            </span>
            <span className="d-none d-lg-inline text-muted-strip">|</span>
            <span className="d-none d-lg-flex align-items-center gap-1">
              <a href="mailto:info@tsaritservices.com" className="strip-link">info@tsaritservices.com</a>
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <span className="badge-gst-strip">
              <BsPatchCheckFill className="me-1 text-info" /> GST & NIC Government Gateway
            </span>
            <Link to="/download-app" className="strip-link d-flex align-items-center gap-1 text-success fw-bold">
              <BsAndroid2 /> Android POS APK
            </Link>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Sticky Header */}
      <header className={`public-navbar-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="container nav-inner-container">
          {/* Brand Logo & Title */}
          <Link to="/" className="brand-logo-wrap" title="TSAR IT BILLING">
            <div className="logo-box-glow">
              <img 
                src={tsarItLogo} 
                alt="TSAR IT BILLING" 
                className="navbar-logo-img"
              />
            </div>
            <div className="brand-text-block">
              <span className="brand-name">TSAR IT BILLING</span>
            </div>
          </Link>

          {/* Desktop Navigation Menu with Full Links */}
          <nav className="desktop-nav-menu">
            {/* 1. Home Link */}
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => `nav-link-btn ${isActive ? "active-link" : ""}`}
            >
              Home
            </NavLink>

            {/* 2. Features Mega Dropdown */}
            <div 
              className="nav-item-dropdown"
              onMouseEnter={() => handleMouseEnter("features")}
              onMouseLeave={handleMouseLeave}
            >
              <NavLink 
                to="/features" 
                className={({ isActive }) => `nav-link-btn ${isActive ? "active-link" : ""}`}
              >
                Features <BsChevronDown className={`dropdown-caret ${activeDropdown === "features" ? "rotate" : ""}`} />
              </NavLink>

              {activeDropdown === "features" && (
                <div 
                  className="nav-dropdown-panel animate-fade-in"
                  onMouseEnter={() => handleMouseEnter("features")}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="dropdown-panel-header d-flex justify-content-between align-items-center mb-2 px-2">
                    <span className="small text-uppercase fw-bold text-muted">Core Enterprise Modules</span>
                    <Link to="/features" className="small text-primary text-decoration-none fw-bold">
                      Explore All 6 Features &rarr;
                    </Link>
                  </div>

                  <div className="dropdown-grid">
                    <Link to="/features" className="dropdown-feature-link">
                      <div className="feature-icon-box indigo"><BsReceiptCutoff /></div>
                      <div>
                        <div className="feature-title">GST Invoicing</div>
                        <div className="feature-sub">Audit-ready B2B/B2C bills, e-bills, quotations</div>
                      </div>
                    </Link>

                    <Link to="/features" className="dropdown-feature-link">
                      <div className="feature-icon-box emerald"><BsBoxSeam /></div>
                      <div>
                        <div className="feature-title">Smart Inventory</div>
                        <div className="feature-sub">Live stock levels, barcodes & batch expiry</div>
                      </div>
                    </Link>

                    <Link to="/features" className="dropdown-feature-link">
                      <div className="feature-icon-box amber"><BsShop /></div>
                      <div>
                        <div className="feature-title">POS Counter Billing</div>
                        <div className="feature-sub">Touch terminal, 80mm/58mm rolls & drawer</div>
                      </div>
                    </Link>

                    <Link to="/features" className="dropdown-feature-link">
                      <div className="feature-icon-box cyan"><BsBuildings /></div>
                      <div>
                        <div className="feature-title">Multi-Warehouse Hub</div>
                        <div className="feature-sub">Godown stock transit challans & vehicle logs</div>
                      </div>
                    </Link>

                    <Link to="/features" className="dropdown-feature-link">
                      <div className="feature-icon-box rose"><BsPeopleFill /></div>
                      <div>
                        <div className="feature-title">Staff & Payroll</div>
                        <div className="feature-sub">Attendance registers, advances & salary slips</div>
                      </div>
                    </Link>

                    <Link to="/features" className="dropdown-feature-link">
                      <div className="feature-icon-box purple"><BsFileEarmarkCheck /></div>
                      <div>
                        <div className="feature-title">E-Invoicing & E-Way</div>
                        <div className="feature-sub">Direct NIC portal sync with digital IRN & QR</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Solutions Dropdown */}
            <div 
              className="nav-item-dropdown"
              onMouseEnter={() => handleMouseEnter("solutions")}
              onMouseLeave={handleMouseLeave}
            >
              <NavLink 
                to="/solutions" 
                className={({ isActive }) => `nav-link-btn ${isActive ? "active-link" : ""}`}
              >
                Solutions <BsChevronDown className={`dropdown-caret ${activeDropdown === "solutions" ? "rotate" : ""}`} />
              </NavLink>

              {activeDropdown === "solutions" && (
                <div 
                  className="nav-dropdown-panel animate-fade-in"
                  style={{ minWidth: '440px' }}
                  onMouseEnter={() => handleMouseEnter("solutions")}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="dropdown-panel-header px-2 mb-2">
                    <span className="small text-uppercase fw-bold text-muted">11 Indian Industry Sectors</span>
                  </div>
                  <div className="dropdown-grid">
                    <Link to="/solutions" className="dropdown-simple-link d-flex align-items-center gap-2">
                      <BsShop className="text-primary" /> Retail & Supermarkets
                    </Link>
                    <Link to="/solutions" className="dropdown-simple-link d-flex align-items-center gap-2">
                      <BsTruck className="text-success" /> Wholesale & Distribution
                    </Link>
                    <Link to="/solutions" className="dropdown-simple-link d-flex align-items-center gap-2">
                      <BsGearWideConnected className="text-danger" /> Manufacturing & BOM
                    </Link>
                    <Link to="/solutions" className="dropdown-simple-link d-flex align-items-center gap-2">
                      <BsCapsule className="text-danger" /> Pharmacy & Healthcare
                    </Link>
                    <Link to="/solutions" className="dropdown-simple-link d-flex align-items-center gap-2">
                      <BsTagFill className="text-purple" /> Textile & Garments
                    </Link>
                    <Link to="/solutions" className="dropdown-simple-link d-flex align-items-center gap-2">
                      <BsLaptopFill className="text-info" /> Electronics & IMEI Tracking
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Pricing & Plans */}
            <NavLink 
              to="/pricing" 
              className={({ isActive }) => `nav-link-btn ${isActive ? "active-link" : ""}`}
            >
              Pricing
            </NavLink>

            {/* 5. Mobile App Download */}
            <NavLink 
              to="/download-app" 
              className={({ isActive }) => `nav-link-btn d-flex align-items-center gap-1 ${isActive ? "active-link" : ""}`}
            >
              <BsAndroid2 className="text-success" /> Mobile App
            </NavLink>

            {/* 6. Contact Us */}
            <NavLink 
              to="/contact" 
              className={({ isActive }) => `nav-link-btn ${isActive ? "active-link" : ""}`}
            >
              Contact Us
            </NavLink>
          </nav>

          {/* Right Action Controls */}
          <div className="navbar-actions-group">
            {isLoggedIn ? (
              <div className="position-relative">
                <button 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="btn btn-outline-primary d-inline-flex align-items-center gap-2 py-2 px-3 rounded-pill fw-semibold shadow-sm user-session-pill"
                >
                  {userProfileImage ? (
                    <img 
                      src={userProfileImage} 
                      alt="Profile" 
                      className="rounded-circle" 
                      style={{ width: "26px", height: "26px", objectFit: "cover" }} 
                    />
                  ) : (
                    <BsPersonCircle className="fs-5 text-primary" />
                  )}
                  <span className="d-none d-sm-inline">{ownerName.split(" ")[0]}</span>
                  <BsChevronDown style={{ fontSize: '0.75rem' }} />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="card border-0 shadow-lg rounded-4 p-2 position-absolute end-0 mt-2 animate-fade-in bg-white"
                    style={{ minWidth: '230px', zIndex: 1100 }}
                  >
                    <div className="p-3 border-bottom mb-1 bg-light rounded-3">
                      <div className="fw-bold text-dark">{ownerName}</div>
                      <div className="text-muted small">{storedUser.email || "Active Session"}</div>
                    </div>
                    <Link to="/dashboard" className="dropdown-simple-link d-flex align-items-center gap-2">
                      <BsSpeedometer2 /> Portal Dashboard
                    </Link>
                    <Link to="/business-settings" className="dropdown-simple-link d-flex align-items-center gap-2">
                      <BsBuildings /> Business Profile
                    </Link>
                    <div className="dropdown-divider my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="btn btn-sm btn-link text-danger text-start text-decoration-none d-flex align-items-center gap-2 p-2 w-100 fw-semibold"
                    >
                      <BsBoxArrowRight /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-link text-dark fw-bold text-decoration-none px-3">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary fw-bold px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2">
                  Start Free Trial <BsArrowRight />
                </Link>
              </div>
            )}

            {/* Mobile Drawer Trigger */}
            <button 
              className="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <BsX size={30} /> : <BsList size={30} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer animate-fade-in shadow-lg">
            <div className="mobile-drawer-links">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/features" onClick={() => setMobileMenuOpen(false)}>Features Overview</Link>
              <Link to="/solutions" onClick={() => setMobileMenuOpen(false)}>Industry Solutions</Link>
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing & Plans</Link>
              <Link to="/download-app" className="text-success fw-bold d-flex align-items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <BsAndroid2 /> Android Mobile App
              </Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact Support (+91 9491301258)</Link>
              
              <div className="mobile-drawer-divider"></div>

              {isLoggedIn ? (
                <div className="d-flex flex-column gap-2 mt-2">
                  <Link to="/dashboard" className="btn btn-primary w-100 py-2 fw-bold" onClick={() => setMobileMenuOpen(false)}>
                    Go to Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn btn-outline-danger w-100 py-2">
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2 mt-2">
                  <Link to="/login" className="btn btn-outline-primary w-100 py-2 fw-bold" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-primary w-100 py-2 fw-bold" onClick={() => setMobileMenuOpen(false)}>
                    Start 15-Day Free Trial
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
