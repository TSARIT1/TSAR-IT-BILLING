import React, { useState } from "react";
import PortalLayout from "../PortalLayout";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { 
  BsAndroid2, 
  BsDownload, 
  BsGooglePlay, 
  BsQrCode, 
  BsCloudCheckFill, 
  BsPrinterFill, 
  BsQrCodeScan, 
  BsPhoneFill, 
  BsCheckCircleFill, 
  BsArrowRight,
  BsWifi,
  BsShieldCheck
} from "react-icons/bs";

export default function MobileAppDownload() {
  const [downloadCount, setDownloadCount] = useState(1480);
  const [copied, setCopied] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");

  const downloadUrl = `${window.location.origin}/downloads/TSAR-IT-Billing-v4.0.0.apk`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const content = (
    <div className="container-fluid p-4">
      {/* Header Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
            <BsAndroid2 className="text-success" /> TSAR IT Enterprise Android App Hub
          </h4>
          <p className="text-muted small mb-0">Download APK, scan QR code for mobile pairing, and manage offline auto-sync</p>
        </div>
        <div className="d-flex gap-2">
          <a 
            href="/downloads/TSAR-IT-Billing-v4.0.0.apk" 
            download="TSAR-IT-Billing-v4.0.0.apk"
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm fw-semibold"
            onClick={() => setDownloadCount(downloadCount + 1)}
          >
            <BsDownload /> Download Direct APK (v4.0.0)
          </a>
        </div>
      </div>

      {/* Hero Download Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-dark text-white p-4">
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-success bg-opacity-25 border border-success border-opacity-50 text-success mb-3">
              <BsCheckCircleFill />
              <span className="small fw-bold">Official Production Release • Version 4.0.0</span>
            </div>
            <h3 className="fw-bold text-white mb-2">
              Mobile POS, GST Billing & Field Sales on Any Android Device
            </h3>
            <p className="text-light text-opacity-75 mb-4">
              Designed for shop counters, delivery vans, warehouses, and field agents across India. Works 100% offline and auto-syncs with this web portal.
            </p>

            <div className="d-flex flex-wrap gap-3">
              <a 
                href="/downloads/TSAR-IT-Billing-v4.0.0.apk" 
                download="TSAR-IT-Billing-v4.0.0.apk"
                className="btn btn-primary btn-lg px-4 py-3 fw-bold d-flex align-items-center gap-2 shadow"
                onClick={() => setDownloadCount(downloadCount + 1)}
              >
                <BsDownload className="fs-5" /> Download APK File (32.4 MB)
              </a>
              <button 
                className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold d-flex align-items-center gap-2"
                onClick={handleCopyLink}
              >
                {copied ? "Link Copied to Clipboard!" : "Copy APK Download Link"}
              </button>
            </div>
          </div>

          {/* QR Code Column */}
          <div className="col-lg-4 text-center">
            <div className="bg-white p-3 rounded-3 d-inline-block shadow mx-auto">
              {/* SVG Visual QR Code */}
              <svg width="160" height="160" viewBox="0 0 180 180">
                <rect width="180" height="180" fill="white" />
                <rect x="15" y="15" width="45" height="45" fill="#0F172A" />
                <rect x="25" y="25" width="25" height="25" fill="white" />
                <rect x="30" y="30" width="15" height="15" fill="#4F46E5" />
                <rect x="120" y="15" width="45" height="45" fill="#0F172A" />
                <rect x="130" y="25" width="25" height="25" fill="white" />
                <rect x="135" y="30" width="15" height="15" fill="#4F46E5" />
                <rect x="15" y="120" width="45" height="45" fill="#0F172A" />
                <rect x="25" y="130" width="25" height="25" fill="white" />
                <rect x="30" y="135" width="15" height="15" fill="#4F46E5" />
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
            <div className="small text-white fw-bold mt-2">Scan with Phone Camera to Install</div>
          </div>
        </div>
      </div>

      {/* Installation & Setup Guide Steps */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge rounded-circle bg-primary text-white p-2 px-3 fw-bold">1</span>
              <h6 className="fw-bold text-dark mb-0">Install APK on Phone</h6>
            </div>
            <p className="text-muted small mb-0">
              Download the `.apk` file or scan the QR code. If prompted on Android, tap <em>"Allow from this source"</em> to install.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge rounded-circle bg-primary text-white p-2 px-3 fw-bold">2</span>
              <h6 className="fw-bold text-dark mb-0">Connect Server IP</h6>
            </div>
            <p className="text-muted small mb-0">
              In the Mobile App, open <strong>Sync Center</strong> and enter your local computer / server Wi-Fi IP address (e.g. <code>192.168.1.100</code>).
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge rounded-circle bg-primary text-white p-2 px-3 fw-bold">3</span>
              <h6 className="fw-bold text-dark mb-0">Pair Thermal Printer</h6>
            </div>
            <p className="text-muted small mb-0">
              Turn on your Bluetooth 58mm/80mm ESC/POS printer. The mobile app automatically prints receipts upon bill checkout.
            </p>
          </div>
        </div>
      </div>

      {/* Hardware & Compatibility Matrix */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-light border-bottom p-3">
          <h6 className="fw-bold mb-0 text-dark">Mobile Hardware & Operating System Compatibility</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Feature</th>
                  <th>Specification</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="fw-bold">Target Android Version</td>
                  <td>Android 8.0 (Oreo) up to Android 14+ (API 24 - 34)</td>
                  <td><span className="badge bg-success-subtle text-success">Supported</span></td>
                </tr>
                <tr>
                  <td className="fw-bold">Bluetooth Thermal Printers</td>
                  <td>58mm and 80mm ESC/POS wireless receipt printers</td>
                  <td><span className="badge bg-success-subtle text-success">Supported</span></td>
                </tr>
                <tr>
                  <td className="fw-bold">Camera Barcode / QR Scanning</td>
                  <td>Rear camera autofocus 1D (EAN-13, UPC) and 2D (QR)</td>
                  <td><span className="badge bg-success-subtle text-success">Supported</span></td>
                </tr>
                <tr>
                  <td className="fw-bold">Offline SQLite Cache</td>
                  <td>Local offline storage for 50,000+ items and invoices</td>
                  <td><span className="badge bg-success-subtle text-success">Supported</span></td>
                </tr>
                <tr>
                  <td className="fw-bold">Background Auto-Sync</td>
                  <td>Android WorkManager periodic & reconnect delta push/pull</td>
                  <td><span className="badge bg-success-subtle text-success">Supported</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );

  if (isLoggedIn) {
    return (
      <PortalLayout title="Android Mobile App Hub">
        {content}
      </PortalLayout>
    );
  }

  return (
    <div className="landing-page-wrapper">
      <Navbar />
      <main className="py-4" style={{ minHeight: "85vh", backgroundColor: "#f8fafc" }}>
        <div className="container py-3">
          {content}
        </div>
      </main>
      <Footer />
    </div>
  );
}
