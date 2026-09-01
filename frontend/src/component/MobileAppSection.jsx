import React from "react";
import { 
  BsAndroid2, 
  BsDownload, 
  BsGooglePlay, 
  BsQrCode, 
  BsCloudCheckFill, 
  BsPrinterFill, 
  BsQrCodeScan, 
  BsShieldCheck, 
  BsLightningChargeFill 
} from "react-icons/bs";

export default function MobileAppSection() {
  return (
    <section className="mobile-app-showcase-section py-5" style={{ background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)", color: "#fff" }}>
      <div className="container py-4">
        <div className="row align-items-center g-5">
          {/* Left Column: Details & Download CTA */}
          <div className="col-lg-7">
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-primary bg-opacity-25 border border-primary border-opacity-50 text-primary-light mb-3">
              <BsAndroid2 className="text-success fs-5" />
              <span className="small fw-bold text-white">TSAR IT MOBILE APP — VERSION 4.0</span>
            </div>

            <h2 className="display-6 fw-bold mb-3 text-white">
              Take Your Billing & POS Anywhere with the <span className="text-primary">Android Mobile App</span>
            </h2>

            <p className="lead text-light text-opacity-75 mb-4 fs-6">
              Full enterprise parity in your pocket. Issue GST invoices, run high-speed touch POS billing, scan barcodes with your camera, and print receipts via Bluetooth thermal printers — with seamless <strong>offline auto-synchronization</strong>.
            </p>

            {/* Feature Highlights Grid */}
            <div className="row g-3 mb-4">
              <div className="col-sm-6">
                <div className="d-flex align-items-start gap-2">
                  <div className="p-2 rounded-3 bg-primary bg-opacity-25 text-primary fs-5">
                    <BsCloudCheckFill className="text-info" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-white mb-1">Offline-First Auto Sync</h6>
                    <p className="small text-light text-opacity-75 mb-0">Create bills with zero internet. Auto-syncs when online.</p>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="d-flex align-items-start gap-2">
                  <div className="p-2 rounded-3 bg-primary bg-opacity-25 text-primary fs-5">
                    <BsPrinterFill className="text-warning" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-white mb-1">Bluetooth Thermal Print</h6>
                    <p className="small text-light text-opacity-75 mb-0">Connects to any 58mm/80mm ESC/POS wireless printer.</p>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="d-flex align-items-start gap-2">
                  <div className="p-2 rounded-3 bg-primary bg-opacity-25 text-primary fs-5">
                    <BsQrCodeScan className="text-success" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-white mb-1">Camera Barcode Scanner</h6>
                    <p className="small text-light text-opacity-75 mb-0">Scan product barcodes and serial numbers instantly.</p>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="d-flex align-items-start gap-2">
                  <div className="p-2 rounded-3 bg-primary bg-opacity-25 text-primary fs-5">
                    <BsShieldCheck className="text-primary" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-white mb-1">All Indian Sectors</h6>
                    <p className="small text-light text-opacity-75 mb-0">Agro, Garments, Electronics, Transport & Supermarket.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap align-items-center gap-3">
              <a 
                href="/downloads/TSAR-IT-Billing-v4.0.0.apk" 
                download="TSAR-IT-Billing-v4.0.0.apk"
                className="btn btn-primary btn-lg px-4 py-3 fw-bold d-flex align-items-center gap-2 shadow rounded-3"
              >
                <BsDownload className="fs-5" /> Download Direct APK (v4.0)
              </a>

              <a 
                href="/downloads/TSAR-IT-Billing-v4.0.0.apk" 
                download="TSAR-IT-Billing-v4.0.0.apk"
                className="btn btn-outline-light btn-lg px-4 py-3 fw-bold d-flex align-items-center gap-2 rounded-3"
              >
                <BsGooglePlay className="text-success fs-5" /> Google Play Store
              </a>
            </div>

            <div className="text-muted small mt-3">
              Supported on Android 8.0 to Android 14+ (ARM64 / x86_64) • Free Automatic Updates
            </div>
          </div>

          {/* Right Column: QR Code & Mobile Mockup Preview */}
          <div className="col-lg-5 text-center">
            <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 p-4 shadow-lg mx-auto" style={{ maxWidth: "380px" }}>
              <div className="mb-3">
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1">
                  SCAN TO INSTALL ON MOBILE
                </span>
              </div>

              {/* QR Code Card */}
              <div className="bg-white p-3 rounded-3 d-inline-block mx-auto mb-3 shadow">
                {/* SVG Visual QR Code */}
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <rect width="180" height="180" fill="white" />
                  {/* Outer Frame */}
                  <rect x="15" y="15" width="45" height="45" fill="#0F172A" />
                  <rect x="25" y="25" width="25" height="25" fill="white" />
                  <rect x="30" y="30" width="15" height="15" fill="#4F46E5" />

                  <rect x="120" y="15" width="45" height="45" fill="#0F172A" />
                  <rect x="130" y="25" width="25" height="25" fill="white" />
                  <rect x="135" y="30" width="15" height="15" fill="#4F46E5" />

                  <rect x="15" y="120" width="45" height="45" fill="#0F172A" />
                  <rect x="25" y="130" width="25" height="25" fill="white" />
                  <rect x="30" y="135" width="15" height="15" fill="#4F46E5" />

                  {/* Data Blocks */}
                  <rect x="70" y="25" width="15" height="15" fill="#0F172A" />
                  <rect x="95" y="25" width="15" height="15" fill="#0F172A" />
                  <rect x="70" y="50" width="40" height="10" fill="#4F46E5" />
                  <rect x="70" y="70" width="20" height="20" fill="#0F172A" />
                  <rect x="100" y="70" width="20" height="20" fill="#0F172A" />
                  <rect x="130" y="70" width="35" height="20" fill="#0F172A" />

                  <rect x="25" y="70" width="35" height="10" fill="#4F46E5" />
                  <rect x="25" y="90" width="20" height="20" fill="#0F172A" />
                  <rect x="55" y="90" width="30" height="20" fill="#0F172A" />

                  <rect x="70" y="120" width="20" height="20" fill="#0F172A" />
                  <rect x="100" y="120" width="20" height="20" fill="#4F46E5" />
                  <rect x="130" y="120" width="35" height="20" fill="#0F172A" />

                  <rect x="70" y="150" width="40" height="15" fill="#0F172A" />
                  <rect x="120" y="150" width="45" height="15" fill="#4F46E5" />
                </svg>
              </div>

              <h6 className="text-white fw-bold mb-1">Point Phone Camera to Scan</h6>
              <p className="text-light text-opacity-75 small mb-3">
                Instantly downloads the secure <strong>TSAR-IT-Billing-v4.0.0.apk</strong> to your mobile device.
              </p>

              <div className="d-flex justify-content-center gap-2">
                <span className="badge bg-primary px-3 py-2">Version: 4.0.0</span>
                <span className="badge bg-secondary px-3 py-2">Size: 32.4 MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
