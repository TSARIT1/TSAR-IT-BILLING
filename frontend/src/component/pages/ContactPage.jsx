import React, { useState } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { 
  BsEnvelopeFill, 
  BsTelephoneFill, 
  BsGeoAltFill, 
  BsClockFill, 
  BsWhatsapp, 
  BsCheckCircleFill, 
  BsSendFill,
  BsHeadset,
  BsShieldCheck
} from 'react-icons/bs';
import Swal from 'sweetalert2';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    inquiryType: 'sales',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    Swal.fire({
      icon: 'success',
      title: 'Inquiry Received!',
      text: `Thank you ${formData.name}. A TSAR IT billing consultant will contact you within 30 minutes.`,
      confirmButtonColor: '#4f46e5'
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      businessName: '',
      inquiryType: 'sales',
      message: ''
    });
  };

  return (
    <div className="contact-page-wrapper">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-dark text-white py-5" style={{ paddingTop: '110px' }}>
        <div className="container text-center py-4">
          <span className="badge bg-primary px-3 py-2 text-uppercase fw-bold mb-3">
            WE ARE HERE TO HELP
          </span>
          <h1 className="display-5 fw-bold text-white mb-3">
            Get in Touch with Our <span className="text-primary">Product Experts</span>
          </h1>
          <p className="lead text-light text-opacity-75 mx-auto mb-2" style={{ maxWidth: '650px', fontSize: '1.1rem' }}>
            Have questions about GST compliance, hardware POS integration, custom pricing, or data migration from other software? Let us assist you.
          </p>
        </div>
      </section>

      {/* Contact Content Grid */}
      <section className="py-5" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container py-3">
          <div className="row g-5">
            {/* Left Column: Contact Information & Channels */}
            <div className="col-lg-5">
              <div className="mb-4">
                <h3 className="fw-bold text-dark mb-2">Direct Channels</h3>
                <p className="text-muted">Reach our specialized teams across phone, WhatsApp, or email.</p>
              </div>

              <div className="d-flex flex-column gap-3 mb-4">
                <div className="card p-3 border rounded-4 shadow-sm bg-white d-flex flex-row align-items-center gap-3">
                  <div className="p-3 rounded-3 bg-primary bg-opacity-10 text-primary fs-4">
                    <BsTelephoneFill />
                  </div>
                  <div>
                    <div className="text-muted small fw-semibold">Customer Helpline</div>
                    <div className="fw-bold text-dark fs-6">+91 9491301258 / +91 8142616767</div>
                    <div className="text-success small fw-medium">Direct Support • Mon - Sat, 9am - 8pm</div>
                  </div>
                </div>

                <div className="card p-3 border rounded-4 shadow-sm bg-white d-flex flex-row align-items-center gap-3">
                  <div className="p-3 rounded-3 bg-success bg-opacity-10 text-success fs-4">
                    <BsWhatsapp />
                  </div>
                  <div>
                    <div className="text-muted small fw-semibold">Instant WhatsApp Chat</div>
                    <div className="fw-bold text-dark fs-6">+91 9491301258</div>
                    <a 
                      href="https://wa.me/919491301258" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary small text-decoration-none fw-bold"
                    >
                      Open WhatsApp Conversation &rarr;
                    </a>
                  </div>
                </div>

                <div className="card p-3 border rounded-4 shadow-sm bg-white d-flex flex-row align-items-center gap-3">
                  <div className="p-3 rounded-3 bg-info bg-opacity-10 text-info fs-4">
                    <BsEnvelopeFill />
                  </div>
                  <div>
                    <div className="text-muted small fw-semibold">Official Business & Support Email</div>
                    <div className="fw-bold text-dark fs-6">info@tsaritservices.com</div>
                    <div className="text-muted small">Direct communication with TSAR IT PRIVATE LIMITED</div>
                  </div>
                </div>

                <div className="card p-3 border rounded-4 shadow-sm bg-white d-flex flex-row align-items-center gap-3">
                  <div className="p-3 rounded-3 bg-warning bg-opacity-10 text-warning fs-4">
                    <BsGeoAltFill />
                  </div>
                  <div>
                    <div className="text-muted small fw-semibold">Headquarters</div>
                    <div className="fw-bold text-dark fs-6">TSAR IT Solutions Tower</div>
                    <div className="text-muted small">Tech Park, Bengaluru, Karnataka 560100</div>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="p-3 bg-primary bg-opacity-10 rounded-3 text-primary d-flex align-items-center gap-2 small fw-semibold">
                <BsShieldCheck className="fs-5 flex-shrink-0" />
                Your contact details are strictly confidential and will never be shared with third-party advertisers.
              </div>
            </div>

            {/* Right Column: Interactive Contact / Demo Form */}
            <div className="col-lg-7">
              <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white">
                <h3 className="fw-bold text-dark mb-1">Send an Inquiry or Book a Demo</h3>
                <p className="text-muted small mb-4">
                  Fill out the form below and an account specialist will provide a customized walkthrough for your business.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Your Name *</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        className="form-control py-2" 
                        placeholder="e.g. Rahul Sharma" 
                        required 
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Mobile Number *</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        className="form-control py-2" 
                        placeholder="10-digit mobile number" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Business / Shop Email *</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        className="form-control py-2" 
                        placeholder="name@company.com" 
                        required 
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Business / Company Name</label>
                      <input 
                        type="text" 
                        name="businessName" 
                        value={formData.businessName} 
                        onChange={handleChange} 
                        className="form-control py-2" 
                        placeholder="e.g. Apex Traders" 
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">How Can We Help You?</label>
                    <select 
                      name="inquiryType" 
                      value={formData.inquiryType} 
                      onChange={handleChange} 
                      className="form-select py-2"
                    >
                      <option value="sales">I want a Live Demo & Pricing Consultation</option>
                      <option value="migration">I need assistance migrating data from Tally / Marg / Vyapar</option>
                      <option value="hardware">I need POS Thermal Printer / Barcode scanner setup support</option>
                      <option value="technical">I have a technical question or feature request</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-secondary">Additional Notes / Questions</label>
                    <textarea 
                      name="message" 
                      value={formData.message} 
                      onChange={handleChange} 
                      rows="4" 
                      className="form-control" 
                      placeholder="Tell us about your business type (retail, wholesale, etc.) and requirements..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
                  >
                    <BsSendFill /> Submit Inquiry & Request Callback
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
