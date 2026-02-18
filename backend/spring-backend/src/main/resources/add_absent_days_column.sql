-- Add absent_days column to attendance table

-- Add absent_days JSON column (stores array of day numbers like present_days)
ALTER TABLE attendance 
ADD COLUMN absent_days JSON NOT NULL DEFAULT '[]' AFTER present_days;

-- Verify the change
DESCRIBE attendance;

-- Example data after change:
-- present_days: [1, 2, 3, 5, 6, 7]
-- absent_days: [4, 8, 9, 10]
-- Not marked: All other days in the month
