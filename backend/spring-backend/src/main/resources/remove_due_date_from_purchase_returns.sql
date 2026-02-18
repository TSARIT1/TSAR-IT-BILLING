-- =====================================================
-- Remove due_date column from purchase_returns table
-- =====================================================
-- Due date should only be at item level (purchase_return_items)
-- not at the parent purchase return level
-- =====================================================

-- Drop the due_date column from purchase_returns
ALTER TABLE purchase_returns 
DROP COLUMN due_date;

-- Verify the column was dropped
DESCRIBE purchase_returns;

-- Or use this to see all columns
SHOW COLUMNS FROM purchase_returns;
