-- =====================================================
-- DIAGNOSTIC QUERY: Check Due Date Storage
-- =====================================================
-- Run this query AFTER creating a purchase return
-- to verify if due dates are being stored
-- =====================================================

-- 1. Check the most recent purchase return items
SELECT 
    pri.id,
    pri.item_name,
    pri.quantity_returned,
    pri.due_date,
    pri.return_reason,
    pri.created_at,
    pr.id as return_id,
    pr.return_date
FROM purchase_return_items pri
LEFT JOIN purchase_returns pr ON pri.return_id = pr.id
WHERE pri.is_deleted = 0
ORDER BY pri.created_at DESC
LIMIT 10;

-- 2. Count items with and without due dates
SELECT 
    COUNT(*) as total_items,
    SUM(CASE WHEN due_date IS NOT NULL THEN 1 ELSE 0 END) as items_with_due_date,
    SUM(CASE WHEN due_date IS NULL THEN 1 ELSE 0 END) as items_without_due_date,
    ROUND(SUM(CASE WHEN due_date IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as percentage_with_due_date
FROM purchase_return_items
WHERE is_deleted = 0;

-- 3. Show sample due dates (if any exist)
SELECT DISTINCT due_date
FROM purchase_return_items
WHERE due_date IS NOT NULL
ORDER BY due_date DESC
LIMIT 10;

-- 4. Check if column exists and its properties
SHOW COLUMNS FROM purchase_return_items LIKE 'due_date';
