import React from 'react'
import "./style.css"

import img from "../asstes/billbook.png"
function Hero() {
  
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Best GST Billing Software<br />for Small Business in India</h1>
        <ul>
          <li><i className="fa-solid fa-check"></i> Create GST bill in 8 seconds</li>
          <li><i className="fa-solid fa-check"></i> Increase stock rotation 2.8x faster</li>
          <li><i className="fa-solid fa-check"></i> Collect 97% payments on time</li>
        </ul>
        <div className="buttons">
          <button className="start-free">Start Free Billing →</button>
          <button className="book-demo">Book Free Demo</button>
          {/* New Register Button 
          <button className="register-btn" onClick={goToRegister}>
            Register
          </button>
          */}
        </div>
      </div>

      <div className="hero-image">
        <img src={img} alt="Product Tour" />
        <button className="play-button"><i className="fa-solid fa-play"></i></button>
      </div>
    </section>
  );
}

export default Hero;

