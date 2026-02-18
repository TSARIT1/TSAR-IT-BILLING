-- Step 1: Add due_date column to purchase_return_items table
ALTER TABLE purchase_return_items 
ADD COLUMN due_date DATE NULL 
AFTER return_reason;

-- Step 2: (Optional) Copy existing due dates from purchase_returns to items
-- This migrates existing data if you have any
UPDATE purchase_return_items pri
INNER JOIN purchase_returns pr ON pri.return_id = pr.id
SET pri.due_date = pr.due_date
WHERE pr.due_date IS NOT NULL;

-- Step 3: Verify the change
DESCRIBE purchase_return_items;

-- Step 4: Check the data
SELECT id, item_name, quantity_returned, due_date 
FROM purchase_return_items 
LIMIT 10;
