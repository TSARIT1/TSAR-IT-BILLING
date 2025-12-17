import React from 'react';
import "./style.css";
import { useNavigate } from 'react-router-dom';
import img from "../asstes/billbook.png";

function Hero() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleBookDemo = () => {
    // Add demo booking logic
    alert('Demo booking feature coming soon!');
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>BillingBook: Powering SMEs with Smart Solutions</h1>
          <p className="hero-subtitle">
            Empower your business with BillingBook! Streamline operations, generate insightful reports,
            and manage your products effortlessly. Start optimizing today!
          </p>
          <ul>
            <li><i className="bi bi-check-circle-fill"></i> Create GST bill in 8 seconds</li>
            <li><i className="bi bi-check-circle-fill"></i> Increase stock rotation 2.8x faster</li>
            <li><i className="bi bi-check-circle-fill"></i> Collect 97% payments on time</li>
          </ul>
          <div className="buttons">
            <button className="start-free" onClick={handleGetStarted}>
              <i className="bi bi-rocket-takeoff-fill me-2"></i>Sign Up
            </button>
            <button className="book-demo" onClick={handleBookDemo}>
              <i className="bi bi-calendar-check me-2"></i>Get Demo
            </button>
          </div>
        </div>

        <div className="hero-image">
          <img src={img} alt="BillingBook Product Tour" />
          <button className="play-button">
            <i className="fa-solid fa-play"></i>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Powerful Billing Features</h2>
          <p>BillingBook provides comprehensive billing solutions for SMEs, streamlining invoicing and payment processes efficiently and effectively.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon orange">
              <i className="bi bi-lightning-charge-fill"></i>
            </div>
            <h3>Easy Setup</h3>
            <p>Quickly set up your account and start managing your business in minutes. Simplify onboarding!</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue">
              <i className="bi bi-cloud-check-fill"></i>
            </div>
            <h3>Cloud Access</h3>
            <p>Access your data from anywhere, anytime with our secure cloud platform. Stay connected!</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange">
              <i className="bi bi-people-fill"></i>
            </div>
            <h3>User Roles</h3>
            <p>Assign roles and permissions to team members for enhanced security. Control access now!</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue">
              <i className="bi bi-bell-fill"></i>
            </div>
            <h3>Automated Reminders</h3>
            <p>Send automated payment reminders to customers and reduce late payments. Get paid faster!</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange">
              <i className="bi bi-shield-fill-check"></i>
            </div>
            <h3>Data Security</h3>
            <p>Your data is safe with us. We employ robust security measures. Protect your business!</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue">
              <i className="bi bi-file-earmark-text-fill"></i>
            </div>
            <h3>Customizable Templates</h3>
            <p>Create professional invoices and reports with customizable templates. Enhance your brand image!</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-content">
          <h2>About BillingBook: Our Story</h2>
          <p className="about-description">
            BillingBook empowers SMEs with user-friendly solutions for streamlined billing, reporting, and product management.
          </p>

          <div className="mission-vision">
            <div className="mission-card">
              <div className="mv-icon">
                <i className="bi bi-bullseye"></i>
              </div>
              <h3>Our Mission</h3>
              <p>Empowering SMEs with innovative, user-friendly solutions.</p>
            </div>

            <div className="vision-card">
              <div className="mv-icon">
                <i className="bi bi-eye-fill"></i>
              </div>
              <h3>Our Vision</h3>
              <p>To be the leading billing solution for SMEs.</p>
            </div>
          </div>

          <button className="cta-button" onClick={handleGetStarted}>
            <i className="bi bi-arrow-right-circle-fill me-2"></i>Get Started
          </button>
        </div>

        <div className="about-image">
          <div className="image-placeholder">
            <i className="bi bi-building"></i>
            <p>We Founders</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="section-header">
          <h2>Discover more about us</h2>
          <p>
            At billingbook, we focus on empowering small businesses with robust billing solutions. From managing
            product inventories to generating detailed revenue reports, our dedicated team is here to support your
            growth and success in the marketplace.
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">
              <i className="bi bi-receipt-cutoff"></i>
            </div>
            <h3>Invoice Generation</h3>
            <p>
              Our platform allows you to create customized invoices effortlessly, ensuring you bill your clients
              accurately and professionally, while maintaining a clear record of your transactions.
            </p>
            <a href="#" className="service-link">
              Contact <i className="bi bi-arrow-right"></i>
            </a>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <h3>Comprehensive Reporting</h3>
            <p>
              We provide insightful reporting features that help you analyze your sales, track revenue, and make
              informed decisions to drive your business forward, all in one place.
            </p>
            <a href="#" className="service-link">
              Contact <i className="bi bi-arrow-right"></i>
            </a>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <i className="bi bi-box-seam"></i>
            </div>
            <h3>Product Management</h3>
            <p>
              At billingbook, you can easily add and manage your products, including inventory details and categories,
              ensuring you have a clear overview of your offerings and sales performance.
            </p>
            <a href="#" className="service-link">
              Contact <i className="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;
