import { Routes, Route } from "react-router-dom";

import LandingPage from "./component/pages/LandingPage";
import Dashboard from "./component/pages/Dashboard";
import CreateSalesInvoice from "./component/pages/CreateSalesInvoice";
import Parties from "./component/pages/Parties";
import ItemsInventory from "./component/pages/ItemsInventory";
import Godown from "./component/pages/Godown";
import SalesInvoices from "./component/pages/SalesInvoices";
import QuotationEstimate from "./component/pages/QuotationEstimate";
import CreateQuotation from "./component/pages/CreateQuotation";
import PaymentIn from "./component/pages/PaymentIn";
import CreatePaymentIn from "./component/CreatePaymentIn";
import SalesReturn from "./component/pages/SalesReturn";
import CreateSalesReturn from "./component/pages/CreateSalesReturn";
import CreditNote from "./component/pages/CreditNote";
import CreateCreditNote from "./component/pages/CreateCreditNote";
import DeliveryChallan from "./component/pages/DeliveryChallan";
import CreateDeliveryChallan from "./component/pages/CreateDeliveryChallan";
import ProformaInvoice from "./component/pages/ProformaInvoice";
import CreateProformaInvoice from "./component/pages/CreateProformaInvoice";
import PurchaseInvoices from "./component/pages/PurchaseInvoice";
import CreatePurchaseInvoice from "./component/pages/CreatePurchaseInvoice";
import PaymentOut from "./component/pages/PaymentOut";
import CreatePaymentOut from "./component/pages/CreatePaymentOut";
import PurchaseReturn from "./component/pages/PurchaseReturn";
import CreatePurchaseReturn from "./component/pages/CreatePurchaseReturn";
import CreateDebitNote from "./component/pages/CreateDebitNote";
import DebitNoteList from "./component/pages/DebitNoteList";
import PurchaseOrders from "./component/pages/PurchaseOrders";
import CreatePurchaseOrder from "./component/pages/CreatePurchaseOrder";
import Reports from "./component/pages/Reports";
import CashBank from "./component/pages/CashBank";
import EInvoicing from "./component/pages/EInvoicing";
import AutomatedBillsPage from "./component/pages/AutomatedBillsPage";
import Expenses from "./component/pages/Expense";
import CreateExpense from "./component/pages/CreateExpense";
import PosBilling from "./component/pages/PosBilling";
import StaffAttendance from "./component/pages/StaffAttendance";
import OnlineOrders from "./component/pages/OnlineOrders";
import SmsPromotion from "./component/pages/SmsPromotion";
import ApplyLoan from "./component/pages/ApplyLoan";
import Login from "./component/pages/Login";
import Registration from "./component/pages/Registration";
import ManageUsers from "./component/pages/ManageUsers";
import EditParty from "./component/pages/EditParty";
import BusinessSettings from "./component/pages/BusinessSettings";
import Settings from "./component/pages/Settings";
import CrmPipeline from "./component/pages/CrmPipeline";
import ManufacturingBom from "./component/pages/ManufacturingBom";
import ProcurementRfq from "./component/pages/ProcurementRfq";
import ComplianceSettings from "./component/pages/ComplianceSettings";
import SuperAdminPanel from "./component/pages/SuperAdminPanel";
import SupportTickets from "./component/pages/SupportTickets";
import MobileAppDownload from "./component/pages/MobileAppDownload";
import SubscriptionPlans from "./component/pages/SubscriptionPlans";
import ProtectedRoute from "./component/ProtectedRoute";
import FeaturesPage from "./component/pages/FeaturesPage";
import SolutionsPage from "./component/pages/SolutionsPage";
import PricingPage from "./component/pages/PricingPage";
import ContactPage from "./component/pages/ContactPage";
import ForgotPassword from "./component/pages/ForgotPassword";
import SuperAdminLogin from "./component/pages/SuperAdminLogin";

// 404 Not Found page (inline component — no separate file needed)
function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ fontSize: '5rem', fontWeight: 800, color: '#4f46e5' }}>404</div>
      <h2 style={{ fontSize: '1.5rem', color: '#1e293b', margin: '1rem 0 0.5rem' }}>Page Not Found</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>The page you're looking for doesn't exist or has been moved.</p>
      <a href="/dashboard" style={{
        background: '#4f46e5',
        color: '#fff',
        padding: '0.75rem 2rem',
        borderRadius: '10px',
        textDecoration: 'none',
        fontWeight: 600
      }}>Go to Dashboard</a>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Public Marketing & Landing Site */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/solutions" element={<SolutionsPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/login" element={<Login />} />
      <Route path="/super-admin-login" element={<SuperAdminLogin />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/download-app" element={<MobileAppDownload />} />
      <Route path="/mobile-app" element={<MobileAppDownload />} />

      {/* Strict Protected Enterprise Portal Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/subscription" element={<ProtectedRoute><SubscriptionPlans /></ProtectedRoute>} />
      <Route path="/super-admin" element={<ProtectedRoute requiredRole="SUPER_ADMIN"><SuperAdminPanel /></ProtectedRoute>} />
      <Route path="/support-tickets" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
      <Route path="/create-invoice" element={<ProtectedRoute><CreateSalesInvoice /></ProtectedRoute>} />
      <Route path="/parties" element={<ProtectedRoute><Parties /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><ItemsInventory /></ProtectedRoute>} />
      <Route path="/godown" element={<ProtectedRoute><Godown /></ProtectedRoute>} />
      <Route path="/sales-invoices" element={<ProtectedRoute><SalesInvoices /></ProtectedRoute>} />
      <Route path="/quotation" element={<ProtectedRoute><QuotationEstimate /></ProtectedRoute>} />
      <Route path="/create-quotation" element={<ProtectedRoute><CreateQuotation /></ProtectedRoute>} />
      <Route path="/payment-in" element={<ProtectedRoute><PaymentIn /></ProtectedRoute>} />
      <Route path="/create-payment-in" element={<ProtectedRoute><CreatePaymentIn /></ProtectedRoute>} />
      <Route path="/sales-return" element={<ProtectedRoute><SalesReturn /></ProtectedRoute>} />
      <Route path="/create-sales-return" element={<ProtectedRoute><CreateSalesReturn /></ProtectedRoute>} />
      <Route path="/credit-note" element={<ProtectedRoute><CreditNote /></ProtectedRoute>} />
      <Route path="/create-credit-note" element={<ProtectedRoute><CreateCreditNote /></ProtectedRoute>} />
      <Route path="/delivery-challan" element={<ProtectedRoute><DeliveryChallan /></ProtectedRoute>} />
      <Route path="/create-delivery-challan" element={<ProtectedRoute><CreateDeliveryChallan /></ProtectedRoute>} />
      <Route path="/proforma-invoice" element={<ProtectedRoute><ProformaInvoice /></ProtectedRoute>} />
      <Route path="/create-proforma-invoice" element={<ProtectedRoute><CreateProformaInvoice /></ProtectedRoute>} />
      <Route path="/purchase-invoices" element={<ProtectedRoute><PurchaseInvoices /></ProtectedRoute>} />
      <Route path="/create-purchase-invoice" element={<ProtectedRoute><CreatePurchaseInvoice /></ProtectedRoute>} />
      <Route path="/payment-out" element={<ProtectedRoute><PaymentOut /></ProtectedRoute>} />
      <Route path="/create-payment-out" element={<ProtectedRoute><CreatePaymentOut /></ProtectedRoute>} />
      <Route path="/purchase-return" element={<ProtectedRoute><PurchaseReturn /></ProtectedRoute>} />
      <Route path="/create-purchase-return" element={<ProtectedRoute><CreatePurchaseReturn /></ProtectedRoute>} />
      <Route path="/debit-note" element={<ProtectedRoute><DebitNoteList /></ProtectedRoute>} />
      <Route path="/debit-note/create" element={<ProtectedRoute><CreateDebitNote /></ProtectedRoute>} />
      <Route path="/purchase-orders" element={<ProtectedRoute><PurchaseOrders /></ProtectedRoute>} />
      <Route path="/purchase-orders/create" element={<ProtectedRoute><CreatePurchaseOrder /></ProtectedRoute>} />
      <Route path="/crm" element={<ProtectedRoute><CrmPipeline /></ProtectedRoute>} />
      <Route path="/manufacturing" element={<ProtectedRoute><ManufacturingBom /></ProtectedRoute>} />
      <Route path="/procurement" element={<ProtectedRoute><ProcurementRfq /></ProtectedRoute>} />
      <Route path="/compliance" element={<ProtectedRoute><ComplianceSettings /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/cash/bank" element={<ProtectedRoute><CashBank /></ProtectedRoute>} />
      <Route path="/e-invoicing" element={<ProtectedRoute><EInvoicing /></ProtectedRoute>} />
      <Route path="/automated-bills" element={<ProtectedRoute><AutomatedBillsPage /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/createexpense" element={<ProtectedRoute><CreateExpense /></ProtectedRoute>} />
      <Route path="/pos-billing" element={<ProtectedRoute><PosBilling /></ProtectedRoute>} />
      <Route path="/staff-attendance" element={<ProtectedRoute><StaffAttendance /></ProtectedRoute>} />
      <Route path="/online-orders" element={<ProtectedRoute><OnlineOrders /></ProtectedRoute>} />
      <Route path="/sms-marketing" element={<ProtectedRoute><SmsPromotion /></ProtectedRoute>} />
      <Route path="/apply-loan" element={<ProtectedRoute><ApplyLoan /></ProtectedRoute>} />
      <Route path="/manage-users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
      <Route path="/edit-party" element={<ProtectedRoute><EditParty /></ProtectedRoute>} />
      <Route path="/edit-party/:id" element={<ProtectedRoute><EditParty /></ProtectedRoute>} />
      <Route path="/business-settings" element={<ProtectedRoute><BusinessSettings /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
