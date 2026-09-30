import { isValidHsn, hsnError, suggestGstForHsn } from './hsnUtils';

test('accepts blank and 4/6/8 digit HSN', () => {
  expect(isValidHsn('')).toBe(true);
  expect(isValidHsn('1006')).toBe(true);
  expect(isValidHsn('310505')).toBe(true);
  expect(isValidHsn('85171200')).toBe(true);
});

test('rejects invalid HSN', () => {
  expect(isValidHsn('12')).toBe(false);
  expect(isValidHsn('ABC1')).toBe(false);
  expect(hsnError('12')).toMatch(/4, 6 or 8/);
});

test('suggests GST slab for known chapters', () => {
  expect(suggestGstForHsn('8517')?.rate).toBe(18);
  expect(suggestGstForHsn('9999')).toBe(null);
});
