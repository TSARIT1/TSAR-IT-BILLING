import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BsList, BsX } from "react-icons/bs";
import tsarItLogo from "../asstes/tsar_it_logo.jpg";

const links = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/solutions", label: "Solutions" },
  { to: "/pricing", label: "Pricing" },
  { to: "/mobile-app", label: "Mobile App" },
  { to: "/contact", label: "Contact" },
];

export default function NavbarV6() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const isActive = (to) => location.pathname === to;

  return (
    <header className="tsg-nav">
      <div className="tsg-nav-inner">
        <Link to="/" className="tsg-nav-brand" title="TSAR IT BILLING">
          <img src={tsarItLogo} alt="TSAR IT BILLING" />
          <span className="tsg-nav-brandname">
            TSAR IT
            <small>Billing Platform</small>
          </span>
        </Link>

        <nav>
          <ul className="tsg-nav-links">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.to === "/"} className={`tsg-nav-link ${isActive(l.to) ? "active" : ""}`}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="tsg-nav-cta">
          <Link to="/login" className="tsg-btn tsg-btn-ghost">Sign In</Link>
          <Link to="/register" className="tsg-btn tsg-btn-primary">Start Free Trial</Link>
        </div>

        <button className="tsg-nav-burger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <BsX /> : <BsList />}
        </button>
      </div>

      <div className={`tsg-nav-mobile ${open ? "open" : ""}`}>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === "/"} className={`tsg-nav-link ${isActive(l.to) ? "active" : ""}`}>
            {l.label}
          </NavLink>
        ))}
        <Link to="/login" className="tsg-btn tsg-btn-ghost">Sign In</Link>
        <Link to="/register" className="tsg-btn tsg-btn-primary">Start Free Trial</Link>
      </div>
    </header>
  );
}
