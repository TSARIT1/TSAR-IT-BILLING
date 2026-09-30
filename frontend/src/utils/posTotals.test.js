import { posTotals } from './posTotals';

test('calculates a mixed-rate inclusive bill including exempt items', () => {
  expect(posTotals([
    { price: 118, quantity: 1, taxRate: 18 },
    { price: 105, quantity: 2, taxRate: 5 },
    { price: 50, quantity: 1, taxRate: 0 },
  ])).toEqual({ subtotal: 378, taxableValue: 350, totalTax: 28, cgst: 14, sgst: 14, igst: 0, grandTotal: 378, isInterState: false });
});

test('applies full IGST for inter-state sales', () => {
  expect(posTotals([{ price: 118, quantity: 1, taxRate: 18 }], { isInterState: true }))
    .toEqual({ subtotal: 118, taxableValue: 100, totalTax: 18, cgst: 0, sgst: 0, igst: 18, grandTotal: 118, isInterState: true });
});

test('rejects invalid billing amounts', () => {
  for (const price of [-1, NaN, Infinity]) {
    expect(() => posTotals([{ price, quantity: 1, taxRate: 0 }])).toThrow();
  }
});
