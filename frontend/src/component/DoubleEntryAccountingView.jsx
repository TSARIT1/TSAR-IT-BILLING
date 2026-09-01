import React, { useState, useEffect } from 'react';
import { 
  BsBank, 
  BsCalculator, 
  BsGraphUp, 
  BsFileEarmarkSpreadsheet, 
  BsCheckCircleFill, 
  BsExclamationTriangleFill,
  BsArrowRepeat
} from 'react-icons/bs';
import { 
  getTrialBalance, 
  getProfitAndLoss, 
  getBalanceSheet, 
  getChartOfAccounts, 
  getDayBook 
} from '../services/api';

export default function DoubleEntryAccountingView() {
  const [activeTab, setActiveTab] = useState('trial-balance');
  const [trialBalance, setTrialBalance] = useState({ accounts: [], totalDebit: 0, totalCredit: 0, isBalanced: true });
  const [pnl, setPnl] = useState({ incomeAccounts: [], expenseAccounts: [], totalIncome: 0, totalExpense: 0, netProfit: 0 });
  const [balanceSheet, setBalanceSheet] = useState({ assetAccounts: [], liabilityAccounts: [], equityAccounts: [], totalAssets: 0, totalLiabilities: 0, totalEquity: 0 });
  const [coa, setCoa] = useState([]);
  const [dayBook, setDayBook] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tbRes, pnlRes, bsRes, coaRes, dbRes] = await Promise.all([
        getTrialBalance(),
        getProfitAndLoss(),
        getBalanceSheet(),
        getChartOfAccounts(),
        getDayBook()
      ]);
      if (tbRes) setTrialBalance(tbRes);
      if (pnlRes) setPnl(pnlRes);
      if (bsRes) setBalanceSheet(bsRes);
      if (Array.isArray(coaRes)) setCoa(coaRes);
      if (Array.isArray(dbRes)) setDayBook(dbRes);
    } catch (e) {
      console.error("Error loading accounting data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="accounting-view-container">
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            <BsCalculator className="me-2 text-primary" /> Double-Entry General Ledger & Statements
          </h4>
          <p className="text-muted small mb-0">
            Real-time audit-ready financial statements generated directly from double-entry journal postings.
          </p>
        </div>
        <button className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2" onClick={loadData}>
          <BsArrowRepeat className={loading ? 'fa-spin' : ''} /> Refresh Ledgers
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap border-bottom pb-2">
        {[
          { id: 'trial-balance', label: 'Trial Balance', icon: <BsCalculator /> },
          { id: 'profit-loss', label: 'Profit & Loss (P&L)', icon: <BsGraphUp /> },
          { id: 'balance-sheet', label: 'Balance Sheet', icon: <BsBank /> },
          { id: 'day-book', label: 'Day Book (Journals)', icon: <BsFileEarmarkSpreadsheet /> },
          { id: 'coa', label: 'Chart of Accounts', icon: <BsBank /> }
        ].map(tab => (
          <button
            key={tab.id}
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-light border'} px-3 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 1. TRIAL BALANCE TAB */}
      {activeTab === 'trial-balance' && (
        <div className="saas-table-container animate-fade-in">
          <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
            <div>
              <strong>Trial Balance as of Today</strong>
              <div className="small text-muted">Summary of debit and credit balances for all accounts</div>
            </div>
            {trialBalance.isBalanced ? (
              <span className="badge bg-success-subtle text-success border border-success px-3 py-2">
                <BsCheckCircleFill className="me-1" /> Ledger Balanced (Debits = Credits)
              </span>
            ) : (
              <span className="badge bg-warning-subtle text-warning border border-warning px-3 py-2">
                <BsExclamationTriangleFill className="me-1" /> Difference Detected
              </span>
            )}
          </div>

          <table className="saas-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Account Name</th>
                <th>Group / Category</th>
                <th>Type</th>
                <th className="text-end">Debit (₹)</th>
                <th className="text-end">Credit (₹)</th>
              </tr>
            </thead>
            <tbody>
              {trialBalance.accounts && trialBalance.accounts.length > 0 ? (
                trialBalance.accounts.map((acc, idx) => (
                  <tr key={idx}>
                    <td><span className="badge bg-secondary-subtle text-dark font-monospace">{acc.code}</span></td>
                    <td className="fw-semibold">{acc.name}</td>
                    <td><span className="small text-muted">{acc.group}</span></td>
                    <td><span className="badge-status info">{acc.type}</span></td>
                    <td className="text-end font-monospace">{acc.debit > 0 ? `₹ ${Number(acc.debit).toLocaleString('en-IN')}` : '-'}</td>
                    <td className="text-end font-monospace">{acc.credit > 0 ? `₹ ${Number(acc.credit).toLocaleString('en-IN')}` : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No ledger entries posted yet. Creating sales invoices and purchase bills will automatically generate accounts.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="table-active fw-bold">
                <td colSpan="4" className="text-end">TOTAL:</td>
                <td className="text-end font-monospace text-primary">₹ {Number(trialBalance.totalDebit || 0).toLocaleString('en-IN')}</td>
                <td className="text-end font-monospace text-primary">₹ {Number(trialBalance.totalCredit || 0).toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* 2. PROFIT & LOSS TAB */}
      {activeTab === 'profit-loss' && (
        <div className="row g-4 animate-fade-in">
          {/* Revenue / Income Side */}
          <div className="col-md-6">
            <div className="dashboard-card-box h-100">
              <div className="box-header">
                <h5 className="fw-bold text-success">Income & Revenue</h5>
              </div>
              <div className="saas-table-container">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th className="text-end">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pnl.incomeAccounts && pnl.incomeAccounts.length > 0 ? (
                      pnl.incomeAccounts.map((acc, i) => (
                        <tr key={i}>
                          <td>{acc.accountName}</td>
                          <td className="text-end font-monospace">₹ {Number(acc.currentBalance || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="2" className="text-muted text-center py-3">No income entries yet</td></tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="table-success fw-bold">
                      <td>Total Income (A)</td>
                      <td className="text-end font-monospace">₹ {Number(pnl.totalIncome || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Expenses Side */}
          <div className="col-md-6">
            <div className="dashboard-card-box h-100">
              <div className="box-header">
                <h5 className="fw-bold text-danger">Expenses & Costs</h5>
              </div>
              <div className="saas-table-container">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th className="text-end">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pnl.expenseAccounts && pnl.expenseAccounts.length > 0 ? (
                      pnl.expenseAccounts.map((acc, i) => (
                        <tr key={i}>
                          <td>{acc.accountName}</td>
                          <td className="text-end font-monospace">₹ {Number(acc.currentBalance || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="2" className="text-muted text-center py-3">No expense entries yet</td></tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="table-danger fw-bold">
                      <td>Total Expenses (B)</td>
                      <td className="text-end font-monospace">₹ {Number(pnl.totalExpense || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Net Profit Summary */}
          <div className="col-12">
            <div className="alert alert-primary d-flex justify-content-between align-items-center p-3 rounded-3 mb-0">
              <div>
                <h5 className="fw-bold mb-1">NET PROFIT / (LOSS) (A - B):</h5>
                <span className="small text-muted">Operating profit before statutory income taxes</span>
              </div>
              <h3 className="fw-bold text-primary mb-0 font-monospace">
                ₹ {Number(pnl.netProfit || 0).toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* 3. BALANCE SHEET TAB */}
      {activeTab === 'balance-sheet' && (
        <div className="row g-4 animate-fade-in">
          {/* Assets */}
          <div className="col-md-6">
            <div className="dashboard-card-box h-100">
              <div className="box-header">
                <h5 className="fw-bold text-primary">Assets</h5>
              </div>
              <table className="saas-table">
                <thead>
                  <tr><th>Account</th><th className="text-end">Balance (₹)</th></tr>
                </thead>
                <tbody>
                  {balanceSheet.assetAccounts && balanceSheet.assetAccounts.map((a, i) => (
                    <tr key={i}>
                      <td>{a.accountName}</td>
                      <td className="text-end font-monospace">₹ {Number(a.currentBalance || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-primary fw-bold">
                    <td>TOTAL ASSETS</td>
                    <td className="text-end font-monospace">₹ {Number(balanceSheet.totalAssets || 0).toLocaleString('en-IN')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Liabilities & Equity */}
          <div className="col-md-6">
            <div className="dashboard-card-box h-100">
              <div className="box-header">
                <h5 className="fw-bold text-dark">Liabilities & Capital</h5>
              </div>
              <table className="saas-table">
                <thead>
                  <tr><th>Account</th><th className="text-end">Balance (₹)</th></tr>
                </thead>
                <tbody>
                  {balanceSheet.liabilityAccounts && balanceSheet.liabilityAccounts.map((a, i) => (
                    <tr key={i}>
                      <td>{a.accountName}</td>
                      <td className="text-end font-monospace">₹ {Number(a.currentBalance || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  {balanceSheet.equityAccounts && balanceSheet.equityAccounts.map((a, i) => (
                    <tr key={i}>
                      <td>{a.accountName}</td>
                      <td className="text-end font-monospace">₹ {Number(a.currentBalance || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-dark fw-bold">
                    <td>TOTAL LIABILITIES & EQUITY</td>
                    <td className="text-end font-monospace">₹ {Number((balanceSheet.totalLiabilities || 0) + (balanceSheet.totalEquity || 0)).toLocaleString('en-IN')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. DAY BOOK TAB */}
      {activeTab === 'day-book' && (
        <div className="saas-table-container animate-fade-in">
          <div className="p-3 bg-light border-bottom">
            <strong>Chronological Day Book</strong>
            <div className="small text-muted">Complete audit trail of posted double-entry journal transactions</div>
          </div>
          <table className="saas-table">
            <thead>
              <tr>
                <th>Entry #</th>
                <th>Date</th>
                <th>Reference</th>
                <th>Type</th>
                <th>Narration</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {dayBook.length > 0 ? (
                dayBook.map((entry) => (
                  <tr key={entry.id}>
                    <td><span className="fw-bold text-primary font-monospace">{entry.entryNumber}</span></td>
                    <td>{entry.entryDate}</td>
                    <td>{entry.referenceNumber || '-'}</td>
                    <td><span className="badge-status info">{entry.referenceType}</span></td>
                    <td className="small">{entry.narration}</td>
                    <td className="text-end fw-bold font-monospace">₹ {Number(entry.totalAmount || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No day book entries recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. CHART OF ACCOUNTS */}
      {activeTab === 'coa' && (
        <div className="saas-table-container animate-fade-in">
          <div className="p-3 bg-light border-bottom">
            <strong>Standard Chart of Accounts (COA)</strong>
            <div className="small text-muted">Master classification of all ledger accounts</div>
          </div>
          <table className="saas-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Account Name</th>
                <th>Type</th>
                <th>Group</th>
                <th>System Account</th>
                <th className="text-end">Balance</th>
              </tr>
            </thead>
            <tbody>
              {coa.map((acc) => (
                <tr key={acc.id}>
                  <td><span className="badge bg-light text-dark font-monospace border">{acc.accountCode}</span></td>
                  <td className="fw-bold">{acc.accountName}</td>
                  <td><span className="badge-status info">{acc.accountType}</span></td>
                  <td><span className="small text-muted">{acc.accountGroup}</span></td>
                  <td>{acc.isSystemAccount ? <span className="badge bg-success-subtle text-success">SYSTEM</span> : <span className="badge bg-light text-muted">CUSTOM</span>}</td>
                  <td className="text-end font-monospace fw-semibold">₹ {Number(acc.currentBalance || 0).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
