import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SalesInvoices from './SalesInvoices';
import { getSales } from '../../services/api';

jest.mock('../PortalLayout', () => ({ children }) => <div>{children}</div>);
jest.mock('../BillPrintAndShareModal', () => () => null);
jest.mock('../../utils/invoicePrintUtil', () => ({
  printEnterpriseInvoice: jest.fn(), exportInvoiceToWord: jest.fn(), exportInvoicesToExcel: jest.fn(),
}));
jest.mock('../../services/api', () => ({
  getSales: jest.fn(), markSaleAsPaid: jest.fn(), getSaleItems: jest.fn(), downloadSalesSlip: jest.fn(),
}));

test('searches numeric sale IDs returned by the server without crashing', async () => {
  getSales.mockResolvedValue([{ saleId: 72, customerName: 'Customer One', amount: 118, totalItems: 1 }]);
  render(<MemoryRouter><SalesInvoices /></MemoryRouter>);
  await screen.findByText('Customer One');
  fireEvent.change(screen.getByPlaceholderText('Search by party or invoice number...'), { target: { value: '72' } });
  expect(screen.getByText('Customer One')).toBeInTheDocument();
});
