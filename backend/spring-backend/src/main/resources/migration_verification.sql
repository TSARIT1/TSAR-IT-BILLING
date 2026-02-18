-- =====================================================
-- Due Date Column Verification and Migration Script
-- =====================================================
-- This script checks if the due_date column exists in 
-- purchase_return_items table and adds it if missing.
-- =====================================================

-- Step 1: Check if due_date column exists
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'purchase_return_items' 
  AND COLUMN_NAME = 'due_date';

-- =====================================================
-- If the above query returns NO RESULTS, the column 
-- doesn't exist. Execute the migration below:
-- =====================================================

-- Step 2: Add due_date column (ONLY if it doesn't exist)
ALTER TABLE purchase_return_items 
ADD COLUMN due_date DATE NULL 
COMMENT 'Due date for returning this item to supplier'
AFTER return_reason;

-- =====================================================
-- Step 3: Verify the column was added successfully
-- =====================================================
DESCRIBE purchase_return_items;

-- =====================================================
-- Step 4: Check existing data to see if any due dates exist
-- =====================================================
SELECT 
    id, 
    item_name, 
    quantity_returned, 
    due_date, 
    return_reason, 
    created_at
FROM purchase_return_items 
ORDER BY created_at DESC 
LIMIT 10;

-- =====================================================
-- Step 5: Count records with and without due dates
-- =====================================================
SELECT 
    COUNT(*) as total_items,
    SUM(CASE WHEN due_date IS NOT NULL THEN 1 ELSE 0 END) as items_with_due_date,
    SUM(CASE WHEN due_date IS NULL THEN 1 ELSE 0 END) as items_without_due_date
FROM purchase_return_items
WHERE is_deleted = FALSE;

-- =====================================================
-- Step 6: View all columns in purchase_return_items
-- =====================================================
SHOW COLUMNS FROM purchase_return_items;
