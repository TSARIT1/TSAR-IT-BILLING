-- SQL Migration: Create online_orders and online_order_items tables
-- Run this script in your billing_db database

CREATE TABLE IF NOT EXISTS online_orders (
    id              VARCHAR(20)     NOT NULL PRIMARY KEY,
    order_number    VARCHAR(50)     UNIQUE,
    customer_name   VARCHAR(255),
    customer_phone  VARCHAR(20),
    order_date      DATETIME,
    status          VARCHAR(30)     DEFAULT 'PENDING',
    total_amount    DOUBLE,
    terms_and_conditions TEXT,
    notes           VARCHAR(1000),
    payment_mode    VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS online_order_items (
    id              VARCHAR(20)     NOT NULL PRIMARY KEY,
    online_order_id VARCHAR(20)     NOT NULL,
    product_id      BIGINT,
    product_name    VARCHAR(255),
    product_code    VARCHAR(100),
    quantity        INT,
    selling_price   DOUBLE,
    expiry_date     DATE,
    tax_rate        DOUBLE          DEFAULT 0.0,
    discount        DOUBLE          DEFAULT 0.0,
    total_price     DOUBLE,
    CONSTRAINT fk_online_order_item_order
        FOREIGN KEY (online_order_id) REFERENCES online_orders(id)
        ON DELETE CASCADE
);
