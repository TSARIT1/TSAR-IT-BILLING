-- Add new columns to invoices table for tracking return status

-- Add is_partially_returned column
ALTER TABLE invoices 
ADD COLUMN is_partially_returned TINYINT(1) DEFAULT 0 NOT NULL;

-- Add is_fully_returned column
ALTER TABLE invoices 
ADD COLUMN is_fully_returned TINYINT(1) DEFAULT 0 NOT NULL;

-- Optional: Reset existing flags to prepare for new logic
UPDATE invoices SET is_purchased_return = 0, is_partially_returned = 0, is_fully_returned = 0;

-- Verify the changes
SELECT invoice_id, total_items, is_purchased_return, is_partially_returned, is_fully_returned 
FROM invoices 
LIMIT 10;
