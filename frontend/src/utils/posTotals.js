// POS prices are tax-inclusive. Use each product's configured rate.
// MyBillBook parity: intra-state => CGST+SGST split, inter-state (place of supply
// differs from business state) => full IGST. Prices stay GST-inclusive either way.
export function posTotals(items, options = {}) {
  const isInterState = Boolean(options?.isInterState);
  let gross = 0;
  let net = 0;
  for (const item of items) {
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    const rate = Number(item.taxRate ?? 0);
    if (![price, quantity, rate].every(Number.isFinite) || price < 0 || quantity <= 0 || rate < 0) {
      throw new Error('Invalid price, quantity or tax rate');
    }
    const line = price * quantity;
    gross += line;
    net += line / (1 + rate / 100);
  }
  const round = value => Math.round((value + Number.EPSILON) * 100) / 100;
  const subtotal = round(gross);
  const taxableValue = round(net);
  const totalTax = round(subtotal - taxableValue);
  if (isInterState) {
    return { subtotal, taxableValue, totalTax, cgst: 0, sgst: 0, igst: totalTax, grandTotal: Math.round(subtotal), isInterState: true };
  }
  const cgst = round(totalTax / 2);
  return { subtotal, taxableValue, totalTax, cgst, sgst: round(totalTax - cgst), igst: 0, grandTotal: Math.round(subtotal), isInterState: false };
}
