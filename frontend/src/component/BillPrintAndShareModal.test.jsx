import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import BillPrintAndShareModal from './BillPrintAndShareModal';
import { downloadSalesSlip, downloadInvoiceSalesSlip, downloadPurchaseInvoicePdf } from '../services/api';
import { printEnterpriseInvoice } from '../utils/invoicePrintUtil';
import Swal from 'sweetalert2';

jest.mock('../services/api', () => ({
  downloadSalesSlip: jest.fn(),
  downloadInvoiceSalesSlip: jest.fn(),
  downloadPurchaseInvoicePdf: jest.fn(),
}));
jest.mock('../utils/invoicePrintUtil', () => ({ printEnterpriseInvoice: jest.fn() }));
jest.mock('sweetalert2', () => ({ fire: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem('businessId', 'BUS-42');
  URL.createObjectURL = jest.fn(() => 'blob:saved-pdf');
  URL.revokeObjectURL = jest.fn();
  jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  downloadSalesSlip.mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }));
  downloadInvoiceSalesSlip.mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }));
  downloadPurchaseInvoicePdf.mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }));
});

afterEach(() => jest.restoreAllMocks());

test('downloads a persisted sale through the authenticated API client', async () => {
  render(<BillPrintAndShareModal isOpen billData={{ saleId: 72, totalAmount: 118 }} />);
  fireEvent.click(screen.getByRole('button', { name: /Download PDF Slip/i }));
  await waitFor(() => expect(downloadSalesSlip).toHaveBeenCalledWith(72, 'BUS-42'));
  expect(URL.createObjectURL).toHaveBeenCalled();
  expect(downloadInvoiceSalesSlip).not.toHaveBeenCalled();
});

test('downloads an invoice slip through its authenticated invoice endpoint', async () => {
  render(<BillPrintAndShareModal isOpen billData={{ invoiceId: 'INV-72', totalAmount: 118 }} />);
  fireEvent.click(screen.getByRole('button', { name: /Download PDF Slip/i }));
  await waitFor(() => expect(downloadInvoiceSalesSlip).toHaveBeenCalledWith('INV-72', 'BUS-42'));
});

test('never downloads a different sale when the saved ID is missing', async () => {
  render(<BillPrintAndShareModal isOpen billData={{ totalAmount: 118 }} />);
  fireEvent.click(screen.getByRole('button', { name: /Download PDF Slip/i }));
  await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
  expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
  expect(downloadSalesSlip).not.toHaveBeenCalled();
});

test('opens the A4 print and save dialog for a sale without inventing an invoice ID', () => {
  const bill = { saleId: 72, totalAmount: 118 };
  render(<BillPrintAndShareModal isOpen billData={bill} items={[{ name: 'Item', quantity: 1, price: 118 }]} />);
  fireEvent.click(screen.getByRole('button', { name: /A4/i }));
  expect(printEnterpriseInvoice).toHaveBeenCalledWith(expect.objectContaining({ invoice: bill, printSize: 'A4' }));
  expect(downloadPurchaseInvoicePdf).not.toHaveBeenCalled();
});
