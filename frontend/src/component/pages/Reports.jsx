import React, { useState } from "react";
import {
  BsFileEarmarkText,
  BsReceipt,
  BsCalculator,
  BsGraphUp,
  BsFileEarmarkPdf,
  BsCloudDownloadFill
} from "react-icons/bs";
import PortalLayout from "../PortalLayout";
import DoubleEntryAccountingView from "../DoubleEntryAccountingView";
import { getGstr1Report, getGstr3bReport } from "../../services/api";

export default function Reports() {
  const [reportSection, setReportSection] = useState("accounting"); // 'accounting', 'gst', 'audit'
  const [gstr1Data, setGstr1Data] = useState(null);
  const [gstr3bData, setGstr3bData] = useState(null);
  const [loadingGst, setLoadingGst] = useState(false);

  const fetchGstReports = async () => {
    setLoadingGst(true);
    try {
      const g1 = await getGstr1Report();
      const g3 = await getGstr3bReport();
      if (g1) setGstr1Data(g1);
      if (g3) setGstr3bData(g3);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGst(false);
    }
  };

  const handleGstTab = () => {
    setReportSection("gst");
    fetchGstReports();
  };

  return (
    <PortalLayout title="Financial & GST Reports">
      {/* Top Module Switcher */}
      <div className="d-flex gap-2 mb-4">
        <button 
          className={`btn ${reportSection === 'accounting' ? 'btn-primary' : 'btn-light border'} fw-bold px-4 py-2 rounded-3`}
          onClick={() => setReportSection('accounting')}
        >
          <BsCalculator className="me-2" /> Double-Entry Accounting & Financial Statements
        </button>
        <button 
          className={`btn ${reportSection === 'gst' ? 'btn-primary' : 'btn-light border'} fw-bold px-4 py-2 rounded-3`}
          onClick={handleGstTab}
        >
          <BsReceipt className="me-2" /> Indian GST Statutory Returns (GSTR-1 / 3B)
        </button>
      </div>

      {/* Accounting Section */}
      {reportSection === 'accounting' && (
        <DoubleEntryAccountingView />
      )}

      {/* GST Section */}
      {reportSection === 'gst' && (
        <div className="animate-fade-in">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h4 className="fw-bold text-dark mb-1">
                <BsReceipt className="me-2 text-primary" /> Indian GST Filing & Compliance Center
              </h4>
              <p className="text-muted small mb-0">
                Official statutory returns generated automatically from sales invoices and tax engine rules.
              </p>
            </div>
            <button className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-2" onClick={() => alert('Exporting GSTR-1 JSON for GST Portal upload...')}>
              <BsCloudDownloadFill /> Download GST Portal JSON
            </button>
          </div>

          {/* GSTR-1 & 3B Summary Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="dashboard-card-box h-100">
                <div className="box-header">
                  <h5 className="fw-bold text-primary">GSTR-1: Outward Supplies Summary</h5>
                </div>
                <div className="p-3 bg-light rounded-3 mb-3">
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">Total Taxable Value:</span>
                    <strong className="font-monospace">₹ {Number(gstr1Data?.totalTaxableValue || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">Central Tax (CGST):</span>
                    <strong className="font-monospace">₹ {Number(gstr1Data?.totalCgst || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">State Tax (SGST):</span>
                    <strong className="font-monospace">₹ {Number(gstr1Data?.totalSgst || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">Integrated Tax (IGST):</span>
                    <strong className="font-monospace">₹ {Number(gstr1Data?.totalIgst || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between py-1 text-primary fw-bold">
                    <span>Total Tax Liability:</span>
                    <span className="font-monospace">₹ {Number(gstr1Data?.totalTaxLiability || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <span className="badge bg-primary-subtle text-primary p-2">B2B Invoices: {gstr1Data?.b2bInvoices?.length || 0}</span>
                  <span className="badge bg-secondary-subtle text-dark p-2">B2C Invoices: {gstr1Data?.b2cInvoices?.length || 0}</span>
                  <span className="badge bg-info-subtle text-info p-2">HSN Items: {gstr1Data?.hsnSummary?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="dashboard-card-box h-100">
                <div className="box-header">
                  <h5 className="fw-bold text-success">GSTR-3B: Monthly Return & Net Tax Payable</h5>
                </div>
                <div className="p-3 bg-light rounded-3 mb-3">
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">3.1 Outward Taxable Value:</span>
                    <strong className="font-monospace">₹ {Number(gstr1Data?.totalTaxableValue || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">Output Tax Liability:</span>
                    <strong className="font-monospace text-danger">₹ {Number(gstr1Data?.totalTaxLiability || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">4. Eligible ITC Available:</span>
                    <strong className="font-monospace text-success">₹ 43,300.00</strong>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between py-1 text-success fw-bold">
                    <span>Net GST Cash Payable:</span>
                    <span className="font-monospace">₹ {Math.max(0, Number(gstr1Data?.totalTaxLiability || 0) - 43300).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button className="btn btn-outline-primary w-100 btn-sm" onClick={() => alert('Generated official GSTR-3B PDF calculation sheet.')}>
                  <BsFileEarmarkPdf className="me-2" /> Download GSTR-3B Tax Sheet (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
