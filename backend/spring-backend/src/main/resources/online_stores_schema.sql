-- SQL Migration: Create online_stores and online_store_products tables
-- Run this script in your billing_db database

CREATE TABLE IF NOT EXISTS online_stores (
    id          VARCHAR(20)     NOT NULL PRIMARY KEY,
    store_name  VARCHAR(255)    NOT NULL,
    categories  VARCHAR(1000),
    status      VARCHAR(20)     DEFAULT 'ACTIVE',
    created_at  DATETIME
);

CREATE TABLE IF NOT EXISTS online_store_products (
    id              VARCHAR(20)     NOT NULL PRIMARY KEY,
    online_store_id VARCHAR(20)     NOT NULL,
    product_id      BIGINT,
    product_name    VARCHAR(255),
    product_code    VARCHAR(100),
    total_stock     INT             DEFAULT 0,
    CONSTRAINT fk_store_product_store
        FOREIGN KEY (online_store_id) REFERENCES online_stores(id)
        ON DELETE CASCADE
);
