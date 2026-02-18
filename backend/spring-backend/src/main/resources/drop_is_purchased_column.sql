-- =====================================================
-- Drop is_purchased column from invoices table
-- =====================================================
-- This removes the is_purchased column which is no longer needed
-- since we now track return status with:
-- - is_purchased_return
-- - is_partially_returned
-- - is_fully_returned
-- =====================================================

-- Drop the column
ALTER TABLE invoices 
DROP COLUMN is_purchased;

-- Verify the column was dropped
DESCRIBE invoices;

-- Or use this to see all columns
SHOW COLUMNS FROM invoices;
