import { Link } from "react-router-dom";
import "../index.css";
import "./style.css"
import image from "../asstes/billbook.png"
function Navbar() {
  return (
    <nav id="navbar">
      <div className="logo">
        <img src={image} alt="logo" style={{width:"200px", height:"40px"}} />
      </div>

      <div className="nav-links" id="nav-links">
        <a href="#">Features</a>
        <a href="#">Solutions</a>
        <a href="#">Knowledge Centre</a>
        <a href="#">Pricing</a>
      </div>

      <div className="nav-buttons">
        <Link to="/dashboard">
          <button className="demo-btn">Login</button>
        </Link>
        <button className="demo-btn">Book Free Demo</button>
        <button className="start-btn">Start Free Billing →</button>
      </div>

      <div className="hamburger" id="hamburger">
        <i className="fa-solid fa-bars"></i>
      </div>
    </nav>
  );
}

export default Navbar;
