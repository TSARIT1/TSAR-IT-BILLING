import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BsSearch, 
  BsReceipt, 
  BsBoxSeam, 
  BsPeopleFill, 
  BsBuildings, 
  BsBank, 
  BsArrowRight,
  BsX
} from 'react-icons/bs';
import { getInvoices, getAllCustomers, getAllProducts } from '../services/api';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const loadAll = async () => {
        try {
          const inv = await getInvoices();
          if (Array.isArray(inv)) setInvoices(inv);
        } catch (e) {}
        try {
          const prod = await getAllProducts();
          if (Array.isArray(prod)) setProducts(prod);
        } catch (e) {}
        try {
          const cust = await getAllCustomers();
          if (Array.isArray(cust)) setCustomers(cust);
        } catch (e) {}
      };
      loadAll();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const term = searchTerm.toLowerCase().trim();

  const filteredInvoices = invoices.filter(i => 
    !term || (i.invoiceId && i.invoiceId.toLowerCase().includes(term)) ||
    (i.customerName && i.customerName.toLowerCase().includes(term))
  ).slice(0, 4);

  const filteredProducts = products.filter(p =>
    !term || (p.itemName && p.itemName.toLowerCase().includes(term)) ||
    (p.hsnCode && p.hsnCode.toLowerCase().includes(term))
  ).slice(0, 4);

  const filteredCustomers = customers.filter(c =>
    !term || (c.name && c.name.toLowerCase().includes(term)) ||
    (c.mobileNumber && c.mobileNumber.includes(term)) ||
    (c.gstin && c.gstin.toLowerCase().includes(term))
  ).slice(0, 4);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="global-omnibar-backdrop animate-fade-in" onClick={onClose}>
      <div className="global-omnibar-modal shadow-lg" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Header */}
        <div className="omnibar-search-header">
          <BsSearch className="omnibar-search-icon" />
          <input
            type="text"
            className="omnibar-search-input"
            placeholder="Type to search invoices, products, customers, accounts... (Esc to close)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <button className="omnibar-close-btn" onClick={onClose}>
            <BsX size={24} />
          </button>
        </div>

        {/* Search Results List */}
        <div className="omnibar-results-container">
          {/* Invoices Group */}
          {filteredInvoices.length > 0 && (
            <div className="omnibar-group">
              <div className="omnibar-group-title">
                <BsReceipt className="me-1 text-primary" /> Sales Invoices
              </div>
              {filteredInvoices.map((inv, idx) => (
                <div 
                  key={idx} 
                  className="omnibar-result-item"
                  onClick={() => handleSelect('/sales-invoices')}
                >
                  <div>
                    <strong>{inv.invoiceId || 'INV-Bill'}</strong> - {inv.customerName || 'Valued Client'}
                    <div className="small text-muted">{inv.invoiceDate || 'Recent'} • ₹ {Number(inv.totalAmount || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <BsArrowRight className="item-arrow" />
                </div>
              ))}
            </div>
          )}

          {/* Products Group */}
          {filteredProducts.length > 0 && (
            <div className="omnibar-group">
              <div className="omnibar-group-title">
                <BsBoxSeam className="me-1 text-success" /> Products & Inventory
              </div>
              {filteredProducts.map((prod, idx) => (
                <div 
                  key={idx} 
                  className="omnibar-result-item"
                  onClick={() => handleSelect('/inventory')}
                >
                  <div>
                    <strong>{prod.itemName || 'Product'}</strong> (HSN: {prod.hsnCode || 'N/A'})
                    <div className="small text-muted">Stock: {prod.openingStock || 0} units • Rate: ₹ {Number(prod.salesPrice || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <BsArrowRight className="item-arrow" />
                </div>
              ))}
            </div>
          )}

          {/* Customers Group */}
          {filteredCustomers.length > 0 && (
            <div className="omnibar-group">
              <div className="omnibar-group-title">
                <BsPeopleFill className="me-1 text-warning" /> Customers & Debtors
              </div>
              {filteredCustomers.map((cust, idx) => (
                <div 
                  key={idx} 
                  className="omnibar-result-item"
                  onClick={() => handleSelect('/parties')}
                >
                  <div>
                    <strong>{cust.name || 'Customer'}</strong> {cust.gstin ? `(GSTIN: ${cust.gstin})` : ''}
                    <div className="small text-muted">Phone: {cust.mobileNumber || 'N/A'}</div>
                  </div>
                  <BsArrowRight className="item-arrow" />
                </div>
              ))}
            </div>
          )}

          {/* Quick Navigation Links */}
          <div className="omnibar-group">
            <div className="omnibar-group-title">
              <BsBuildings className="me-1 text-info" /> Fast Navigation
            </div>
            <div className="d-flex gap-2 flex-wrap p-2">
              <button className="btn btn-sm btn-light border" onClick={() => handleSelect('/create-invoice')}>+ Create Bill</button>
              <button className="btn btn-sm btn-light border" onClick={() => handleSelect('/godown')}>Godown Warehouse</button>
              <button className="btn btn-sm btn-light border" onClick={() => handleSelect('/pos-billing')}>POS Counter</button>
              <button className="btn btn-sm btn-light border" onClick={() => handleSelect('/cash/bank')}>Cash & Bank</button>
              <button className="btn btn-sm btn-light border" onClick={() => handleSelect('/reports')}>Financial Reports</button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="omnibar-footer">
          <span>Press <kbd>Esc</kbd> to exit • Click any result to jump directly</span>
        </div>
      </div>
    </div>
  );
}
