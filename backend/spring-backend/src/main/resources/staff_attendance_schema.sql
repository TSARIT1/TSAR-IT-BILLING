-- ================================================
-- STAFF MANAGEMENT AND MONTHLY ATTENDANCE SYSTEM
-- ================================================

-- ================================================
-- TABLE: staff_members
-- ================================================
CREATE TABLE staff_members (
    id VARCHAR(20) PRIMARY KEY,
    business_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    role VARCHAR(100) NOT NULL,
    salary_payout_type VARCHAR(20) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    salary_cycle VARCHAR(100),
    opening_balance DECIMAL(10, 2) DEFAULT 0.00,
    balance_type VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_business_status (business_id, status),
    UNIQUE KEY unique_mobile_per_business (business_id, mobile_number)
);

-- ================================================
-- TABLE: attendance (SIMPLIFIED MONTHLY APPROACH)
-- ================================================
CREATE TABLE attendance (
    id VARCHAR(20) PRIMARY KEY,
    staff_id VARCHAR(20) NOT NULL,
    business_id VARCHAR(50) NOT NULL,

    month TINYINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year SMALLINT NOT NULL,

    present_days JSON NOT NULL DEFAULT '[]',
    total_working_days INT NOT NULL DEFAULT 0,

    marked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (staff_id) REFERENCES staff_members(id) ON DELETE CASCADE,
    
    INDEX idx_business_month (business_id, year, month),
    INDEX idx_staff_year (staff_id, year),

    UNIQUE KEY unique_staff_month (staff_id, month, year)
);

-- ================================================
-- HOW IT WORKS
-- ================================================
-- 
-- One record per staff per month
-- present_days stores array of day numbers [1, 2, 3, 5, 6, ...]
-- 
-- Mark present: Add day to array
-- Unmark: Remove day from array
-- 
-- Example:
-- {
--   "month": 2,
--   "year": 2024,
--   "present_days": [1, 2, 3, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15]
-- }
-- ================================================

-- Sample data
INSERT INTO staff_members (id, business_id, name, mobile_number, role, salary_payout_type, salary, salary_cycle, status)
VALUES 
    ('STAFFA1B2C3D4', 'BUS12345678', 'John Doe', '9876543210', 'Manager', 'MONTHLY', 50000.00, '1 to 1 Every month', 'ACTIVE'),
    ('STAFFE5F6G7H8', 'BUS12345678', 'Jane Smith', '9123456789', 'Cashier', 'MONTHLY', 30000.00, '1 to 1 Every month', 'ACTIVE');

INSERT INTO attendance (id, staff_id, business_id, month, year, present_days, total_working_days)
VALUES 
    ('ATTM3N4O5P6Q7', 'STAFFA1B2C3D4', 'BUS12345678', 2, 2024, 
     JSON_ARRAY(1, 2, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 19, 20), 28);
