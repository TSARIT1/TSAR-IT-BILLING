-- Fix for business_id column length issue
-- The business_id is longer than 20 characters, need to increase column size

-- Update staff_members table
ALTER TABLE staff_members 
MODIFY COLUMN business_id VARCHAR(50) NOT NULL;

-- Update attendance table
ALTER TABLE attendance 
MODIFY COLUMN business_id VARCHAR(50) NOT NULL;

-- Verify changes
SHOW COLUMNS FROM staff_members LIKE 'business_id';
SHOW COLUMNS FROM attendance LIKE 'business_id';
