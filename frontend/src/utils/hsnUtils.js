// HSN/SAC helpers — MyBillBook parity: 4/6/8-digit numeric codes, GST-slab hint.
export const HSN_PATTERN = /^[0-9]{4}([0-9]{2})?([0-9]{2})?$/;

export function normalizeHsn(value) {
  const v = String(value ?? "").trim();
  return v === "" ? "" : v;
}

export function isValidHsn(value) {
  const v = normalizeHsn(value);
  if (v === "") return true; // optional until turnover threshold; print shows "-"
  return HSN_PATTERN.test(v);
}

// Common HSN chapter -> typical GST slab hint (not authoritative, just a nudge).
const HSN_SLAP_HINTS = [
  { prefix: "1001", rate: 0, label: "Wheat/rice unbranded" },
  { prefix: "1006", rate: 5, label: "Rice branded/packed" },
  { prefix: "5208", rate: 5, label: "Cotton fabrics" },
  { prefix: "6109", rate: 5, label: "T-shirts/apparel ≤₹1000" },
  { prefix: "6204", rate: 12, label: "Apparel >₹1000" },
  { prefix: "3004", rate: 12, label: "Medicaments" },
  { prefix: "3105", rate: 5, label: "Fertilizers NPK" },
  { prefix: "8517", rate: 18, label: "Mobile phones" },
  { prefix: "8708", rate: 28, label: "Motor parts" },
  { prefix: "9983", rate: 18, label: "Services (SAC)" },
];

export function suggestGstForHsn(hsn) {
  const v = normalizeHsn(hsn);
  if (!v) return null;
  const hit = HSN_SLAP_HINTS.find((h) => v.startsWith(h.prefix));
  return hit || null;
}

export function hsnError(value) {
  const v = normalizeHsn(value);
  if (v === "") return "";
  if (!/^[0-9]+$/.test(v)) return "HSN must be digits only";
  if (![4, 6, 8].includes(v.length)) return "HSN must be 4, 6 or 8 digits";
  return "";
}
