import { Routes, Route } from "react-router-dom";

import Hero from "./component/Hero"
import Trusted from "./component/Trusted"
import Dashboard from "./component/pages/Dashboard"
import Navbar from "./component/Navbar"
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
function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <Hero />
            <Trusted />
          </>
        }
      />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-invoice" element={<CreateSalesInvoice />} />
      <Route path="/parties" element={<Parties />} />
      <Route path="/inventory" element={<ItemsInventory />} />
      <Route path="/godown" element={<Godown/>} />
      <Route path="/sales-invoices" element={<SalesInvoices />} />
      <Route path="/quotation" element={<QuotationEstimate />} />
      <Route path="/create-quotation" element={<CreateQuotation />} />
      <Route path="/payment-in" element={<PaymentIn />} />
      <Route path="/create-payment-in" element={<CreatePaymentIn/>} />
      <Route path="/sales-return" element={<SalesReturn/>} />
      <Route path="/create-sales-return" element={<CreateSalesReturn/>} />
      <Route path="/credit-note" element={<CreditNote/>} />
      <Route path="/create-credit-note" element={<CreateCreditNote/>} />
      <Route path="/delivery-challan" element={<DeliveryChallan/>} />
      <Route path="/create-delivery-challan" element={<CreateDeliveryChallan/>} />
      <Route path="/proforma-invoice" element={<ProformaInvoice/>} />
      <Route path="/create-proforma-invoice" element={<CreateProformaInvoice/>} />
      <Route path="/purchase-invoices" element={<PurchaseInvoices/>} />
      <Route path="/create-purchase-invoice" element={<CreatePurchaseInvoice/>} />
      <Route path="/payment-out" element={<PaymentOut/>} />
      <Route path="/create-payment-out" element={<CreatePaymentOut/>} />
      <Route path="/purchase-return" element={<PurchaseReturn/>} />
      <Route path="create-purchase-return" element={<CreatePurchaseReturn/>} />
      <Route path="debit-note" element={<DebitNoteList/>} />
      <Route path="debit-note/create" element={<CreateDebitNote/>} />
      <Route path="purchase-orders" element={<PurchaseOrders/>} />
      <Route path="purchase-orders/create" element={<CreatePurchaseOrder/>} />
      <Route path="reports" element={<Reports/>} />
      <Route path="cash/bank" element={<CashBank/>} />
      <Route path="e-invoicing" element={<EInvoicing/>} />
      <Route path="automated-bills" element={<AutomatedBillsPage/>} />
      <Route path="expenses" element={<Expenses/>} />
      <Route path="createexpense" element={<CreateExpense/>} />
      <Route path="pos-billing" element={<PosBilling/>} />
      <Route path="staff-attendance" element={<StaffAttendance/>} />
      <Route path="online-orders" element={<OnlineOrders/>} />
      <Route path="sms-marketing" element={<SmsPromotion/>} />
      <Route path="apply-loan" element={<ApplyLoan/>} />
       <Route path="login" element={<Login />} />
      <Route path="register" element={<Registration />} />
       <Route path="login" element={<Login />} />
      <Route path="register" element={<Registration />} />
      <Route path="manage-users" element={<ManageUsers />} />
      <Route path="edit-party" element={<EditParty />} />
      <Route path="business-settings" element={<BusinessSettings />}
      />
      
    </Routes>
  );
}

export default App;
