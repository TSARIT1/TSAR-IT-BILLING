import React from "react";
import { BsAndroid2, BsDownload, BsCloudCheckFill, BsPrinterFill, BsQrCodeScan, BsShop, BsCollectionPlayFill } from "react-icons/bs";

const APK = "/downloads/TSAR-IT-Billing-v4.14.14.apk";

export default function AppShowcaseV6() {
  const feats = [
    { icon: <BsCloudCheckFill />, t: "Offline-first billing", d: "Create bills with zero internet — auto-syncs when you're back online." },
    { icon: <BsPrinterFill />, t: "Bluetooth thermal print", d: "Works with any 58mm/80mm ESC/POS printer, straight from the app." },
    { icon: <BsQrCodeScan />, t: "Camera barcode scanning", d: "Scan items and IMEI serials — the cart fills itself." },
    { icon: <BsShop />, t: "Every sector, one app", d: "Agro, garments, electronics, transport, supermarkets & more." },
  ];

  return (
    <section className="tsg-appshow" id="mobile-app">
      <div className="tsg-appshow-inner">
        {/* Left copy */}
        <div>
          <span className="tsg-kicker">Mobile app · v4.14.14</span>
          <h2>
            Your billing counter, <em>in your pocket</em>
          </h2>
          <p className="app-lead">
            The TSAR IT Android app carries the full platform — not a stripped-down
            viewer. Issue GST invoices at the counter, print instantly, and watch
            stock and dues stay in sync with your web dashboard.
          </p>

          <div className="tsg-app-feats">
            {feats.map((f) => (
              <div className="tsg-app-feat" key={f.t}>
                <span className="af-icon">{f.icon}</span>
                <span>
                  <h5>{f.t}</h5>
                  <p>{f.d}</p>
                </span>
              </div>
            ))}
          </div>

          <div className="d-flex flex-wrap align-items-center gap-3">
            <a href={APK} download className="tsg-btn tsg-btn-primary">
              <BsDownload /> Download APK — free
            </a>
            <span className="ver-pills">
              <span className="vpill gold"><BsAndroid2 /> Android 8.0+</span>
              <span className="vpill">4.7 MB</span>
              <span className="vpill">Official HTTPS updates</span>
            </span>
          </div>
        </div>

        {/* Right phone */}
        <div className="tsg-phone-wrap">
          <div className="tsg-phone">
            <div className="tsg-phone-screen">
              <div className="tsg-pscreen-top">
                <div className="greet">Good evening</div>
                <div className="bname">Sahu Electronics</div>
              </div>

              <div className="tsg-pscreen-dues">
                <div className="due-cell">
                  <div className="dl collect">To Collect</div>
                  <div className="dv">₹18,450</div>
                </div>
                <div className="due-cell">
                  <div className="dl pay">This Month</div>
                  <div className="dv">₹1.2L sales</div>
                </div>
              </div>

              <div className="tsg-pscreen-quick">
                <div className="q sale"><span className="qi"><BsCollectionPlayFill /></span>New Sale</div>
                <div className="q"><span className="qi">₹</span>Payment In</div>
                <div className="q"><span className="qi">≡</span>Invoices</div>
                <div className="q"><span className="qi">◉</span>Parties</div>
                <div className="q"><span className="qi">▤</span>Items</div>
                <div className="q"><span className="qi">◔</span>Reports</div>
              </div>

              <div className="tsg-pscreen-list">
                <div className="pli">
                  <span><span className="pl-name d-block">INV #1042</span><span className="pl-sub">Shri Krishna Ent.</span></span>
                  <span className="pl-amt">₹12,400</span>
                </div>
                <div className="pli">
                  <span><span className="pl-name d-block">INV #1041</span><span className="pl-sub">Walk-in customer</span></span>
                  <span className="pl-amt">₹2,180</span>
                </div>
                <div className="pli">
                  <span><span className="pl-name d-block">INV #1040</span><span className="pl-sub">Meena Traders</span></span>
                  <span className="pl-amt">₹8,950</span>
                </div>
              </div>

              <div className="tsg-pscreen-bottom">
                <span className="nb active"><span className="nbi">⌂</span>Home</span>
                <span className="nb"><span className="nbi">🛒</span>POS</span>
                <span className="nb"><span className="nbi">▦</span>Bills</span>
                <span className="nb"><span className="nbi">👥</span>Parties</span>
                <span className="nb"><span className="nbi">☰</span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
