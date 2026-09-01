import React, { useState, useEffect } from "react";
import {
  BsBank,
  BsCashStack,
  BsPlusCircleFill,
  BsArrowLeftRight,
  BsCheckCircleFill,
  BsShieldCheck,
  BsArrowRepeat,
  BsWallet2,
  BsCreditCard2FrontFill
} from "react-icons/bs";
import PortalLayout from "../PortalLayout";
import {
  getBankAccounts,
  createBankAccount,
  getBankTransactions,
  recordBankTransaction,
  reconcileBankTransaction
} from "../../services/api";
import Swal from "sweetalert2";

export default function CashBank() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const accList = await getBankAccounts();
      if (Array.isArray(accList) && accList.length > 0) {
        setAccounts(accList);
        const currentSelected = selectedAccountId || accList[0].id;
        setSelectedAccountId(currentSelected);
        const txList = await getBankTransactions(currentSelected);
        if (Array.isArray(txList)) setTransactions(txList);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectAccount = async (accId) => {
    setSelectedAccountId(accId);
    setLoading(true);
    try {
      const txList = await getBankTransactions(accId);
      if (Array.isArray(txList)) setTransactions(txList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Add Bank / Current Account",
      html: `
        <input id="swal-bankName" class="swal2-input" placeholder="Bank Name (e.g. ICICI Bank)">
        <input id="swal-accNo" class="swal2-input" placeholder="Account Number">
        <input id="swal-ifsc" class="swal2-input" placeholder="IFSC Code (e.g. ICIC0001234)">
        <input id="swal-upi" class="swal2-input" placeholder="UPI ID (e.g. company@icici)">
        <input id="swal-openingBal" type="number" class="swal2-input" placeholder="Opening Balance (₹)">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Create Account",
      preConfirm: () => {
        return {
          bankName: document.getElementById('swal-bankName').value,
          accountNumber: document.getElementById('swal-accNo').value,
          ifscCode: document.getElementById('swal-ifsc').value,
          upiId: document.getElementById('swal-upi').value,
          openingBalance: document.getElementById('swal-openingBal').value || 0,
          accountType: "CURRENT"
        };
      }
    });

    if (formValues && formValues.bankName && formValues.accountNumber) {
      try {
        await createBankAccount(formValues);
        Swal.fire("Account Created", "Bank account added successfully.", "success");
        loadData();
      } catch (e) {
        Swal.fire("Error", "Could not create account.", "error");
      }
    }
  };

  const handleRecordTransaction = async (type) => {
    if (!selectedAccountId) {
      Swal.fire("Select Account", "Please select an active bank account.", "warning");
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: `Record ${type === 'DEPOSIT' ? 'Deposit / Receipt' : 'Withdrawal / Expense'}`,
      html: `
        <input id="swal-tx-amount" type="number" class="swal2-input" placeholder="Amount (₹)">
        <input id="swal-tx-ref" class="swal2-input" placeholder="Reference / UTR / Cheque No">
        <input id="swal-tx-desc" class="swal2-input" placeholder="Description / Purpose">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Record Entry",
      preConfirm: () => {
        return {
          bankAccountId: selectedAccountId,
          type: type,
          amount: document.getElementById('swal-tx-amount').value,
          referenceNumber: document.getElementById('swal-tx-ref').value,
          description: document.getElementById('swal-tx-desc').value
        };
      }
    });

    if (formValues && formValues.amount) {
      try {
        await recordBankTransaction(formValues);
        Swal.fire("Transaction Recorded", "Account balance updated successfully.", "success");
        loadData();
      } catch (e) {
        Swal.fire("Error", "Could not record transaction.", "error");
      }
    }
  };

  const handleReconcile = async (txId) => {
    try {
      await reconcileBankTransaction(txId);
      Swal.fire("Reconciled", "Bank statement entry successfully reconciled.", "success");
      loadData();
    } catch (e) {
      Swal.fire("Error", "Could not reconcile transaction.", "error");
    }
  };

  const totalBalance = accounts.reduce((acc, a) => acc + Number(a.currentBalance || 0), 0);
  const currentAcc = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  return (
    <PortalLayout title="Cash, Bank Accounts & Reconciliation">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 animate-fade-in">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            <BsBank className="me-2 text-primary" /> Multi-Bank Accounts & Statement Reconciliation
          </h4>
          <p className="text-muted small mb-0">
            Real-time multi-account cash book, UPI handles, and audit-ready bank statement reconciliation.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-primary" onClick={loadData}>
            <BsArrowRepeat className={loading ? "fa-spin" : ""} /> Refresh
          </button>
          <button className="btn-saas-primary" onClick={handleAddAccount}>
            <BsPlusCircleFill /> Add Bank Account
          </button>
        </div>
      </div>

      <div className="row g-4 animate-fade-in">
        {/* Left Accounts Sidebar */}
        <div className="col-lg-4">
          {/* Total Liquid Funds Card */}
          <div className="dashboard-card-box mb-3 bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-white-50 fw-semibold text-uppercase">Total Available Liquid Funds</span>
              <BsCashStack size={24} className="text-white-50" />
            </div>
            <h2 className="fw-bold mb-1">₹ {Number(totalBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            <div className="small text-white-50">Across {accounts.length} linked corporate accounts</div>
          </div>

          {/* Account Cards List */}
          <div className="d-flex flex-column gap-2">
            {accounts.map((acc) => {
              const isSelected = acc.id === selectedAccountId;
              return (
                <div
                  key={acc.id}
                  onClick={() => handleSelectAccount(acc.id)}
                  className={`dashboard-card-box p-3 cursor-pointer border transition-all ${
                    isSelected ? 'border-primary shadow-sm bg-primary-subtle' : 'bg-white'
                  }`}
                  style={{ cursor: 'pointer', borderRadius: '12px' }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="fw-bold mb-0 text-dark">
                      <BsCreditCard2FrontFill className="me-2 text-primary" /> {acc.bankName}
                    </h6>
                    {acc.isPrimary && <span className="badge bg-primary">Primary</span>}
                  </div>
                  <div className="small text-muted mb-2 font-monospace">A/C: •••• {acc.accountNumber?.slice(-4) || 'XXXX'}</div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">{acc.accountType || 'CURRENT'}</span>
                    <span className="fw-bold text-dark fs-6">
                      ₹ {Number(acc.currentBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Transactions & Reconciliation Area */}
        <div className="col-lg-8">
          {currentAcc ? (
            <div className="dashboard-card-box">
              {/* Account Quick Stats */}
              <div className="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom flex-wrap gap-2">
                <div>
                  <h5 className="fw-bold mb-1 text-dark">{currentAcc.bankName}</h5>
                  <div className="small text-muted">
                    <span><strong>A/C No:</strong> {currentAcc.accountNumber}</span> &bull; <span><strong>IFSC:</strong> {currentAcc.ifscCode}</span> &bull; <span><strong>UPI:</strong> {currentAcc.upiId || 'N/A'}</span>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-success" onClick={() => handleRecordTransaction('DEPOSIT')}>
                    <BsPlusCircleFill className="me-1" /> Deposit / Receipt
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleRecordTransaction('WITHDRAWAL')}>
                    <BsPlusCircleFill className="me-1" /> Payment / Expense
                  </button>
                </div>
              </div>

              {/* Transactions Ledger */}
              <h6 className="fw-bold mb-3 text-dark">Account Ledger & Bank Reconciliation</h6>
              <div className="table-responsive">
                <table className="table table-hover align-middle saas-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Reference / UTR</th>
                      <th>Description</th>
                      <th className="text-end">Amount (₹)</th>
                      <th className="text-center">Reconciliation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="small text-muted">{tx.transactionDate}</td>
                          <td>
                            <span className={`badge ${tx.type === 'DEPOSIT' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="font-monospace small">{tx.referenceNumber || 'N/A'}</td>
                          <td className="small">{tx.description || 'General Account Entry'}</td>
                          <td className={`text-end fw-bold ${tx.type === 'DEPOSIT' ? 'text-success' : 'text-danger'}`}>
                            {tx.type === 'DEPOSIT' ? '+' : '-'} ₹ {Number(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-center">
                            {tx.isReconciled ? (
                              <span className="badge bg-success-subtle text-success d-inline-flex align-items-center gap-1">
                                <BsCheckCircleFill /> Reconciled
                              </span>
                            ) : (
                              <button className="btn btn-xs btn-outline-primary py-1 px-2 small" onClick={() => handleReconcile(tx.id)}>
                                Reconcile
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No transactions recorded yet. Click <strong>Deposit</strong> or <strong>Payment</strong> above to add ledger entries.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="dashboard-card-box text-center py-5 text-muted">
              <BsBank size={48} className="mb-3 text-secondary" />
              <p>No accounts available. Click <strong>Add Bank Account</strong> to get started.</p>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
