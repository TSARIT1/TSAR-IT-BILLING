-- =====================================================
-- CORRECT: Drop is_purchased_return column from invoices table
-- =====================================================
-- This removes the is_purchased_return column
-- We keep:
-- - is_purchased (for marking invoice as purchased)
-- - is_partially_returned (some items returned)
-- - is_fully_returned (all items returned)
-- =====================================================

-- Drop the is_purchased_return column
ALTER TABLE invoices 
DROP COLUMN is_purchased_return;

-- Verify the column was dropped
DESCRIBE invoices;

-- Or use this to see all columns
SHOW COLUMNS FROM invoices;
