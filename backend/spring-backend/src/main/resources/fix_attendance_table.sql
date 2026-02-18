-- Fix for attendance table: Remove notes column and ensure total_working_days is calculated

-- Remove notes column if it exists
ALTER TABLE attendance DROP COLUMN IF EXISTS notes;

-- Verify the change
SHOW COLUMNS FROM attendance;

-- Disable safe update mode temporarily
SET SQL_SAFE_UPDATES = 0;

-- Update existing records to calculate total_working_days based on present_days array
UPDATE attendance 
SET total_working_days = JSON_LENGTH(present_days)
WHERE present_days IS NOT NULL;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;
