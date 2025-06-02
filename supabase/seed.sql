-- Drop all data
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM purchase_items;
DELETE FROM purchase_batches;
DELETE FROM stock_records;
DELETE FROM product_models;
DELETE FROM products;
DELETE FROM buyers;
DELETE FROM suppliers;

-- Reset sequences
ALTER SEQUENCE IF EXISTS buyers_buyer_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS products_product_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS product_models_model_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS stock_records_model_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS suppliers_supplier_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS purchase_batches_batch_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS purchase_items_item_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS order_items_item_id_seq RESTART WITH 1;

-- Insert sample suppliers
INSERT INTO suppliers (supplier_id, supplier_name, contact_info, created_at) VALUES
(1, 'Apple Supplier Co.', 'contact@applesupplier.com', NOW()),
(2, 'Samsung Electronics', 'sales@samsungelectronics.com', NOW()),
(3, 'Google Devices Inc.', 'info@googledevices.com', NOW());

-- Insert sample buyers
INSERT INTO buyers (buyer_id, buyer_account) VALUES
(1, 'buyer1@example.com'),
(2, 'buyer2@example.com'),
(3, 'buyer3@example.com');

-- Insert sample products
INSERT INTO products (product_id, product_name, listed_date, status) VALUES
(1, 'MacBook Pro', '2024-01-01', 'active'),
(2, 'iPhone 15', '2024-01-01', 'active'),
(3, 'Galaxy Buds', '2024-01-01', 'active'),
(4, 'Galaxy Watch', '2024-02-01', 'active'),
(5, 'Pixel Tablet', '2024-02-15', 'active');

-- Insert sample product models
INSERT INTO product_models (model_id, product_id, model_name, original_price, promo_price, created_at) VALUES
(1, 1, 'MacBook Pro 14" M3', 1999.99, 1899.99, '2024-01-01'),
(2, 1, 'MacBook Pro 16" M3', 2499.99, 2399.99, '2024-01-01'),
(3, 2, 'iPhone 15 Pro', 999.99, 949.99, '2024-01-01'),
(4, 2, 'iPhone 15 Pro Max', 1199.99, 1149.99, '2024-01-01'),
(5, 3, 'Galaxy Buds Pro 2', 249.99, 229.99, '2024-01-01'),
(6, 4, 'Galaxy Watch 6', 399.99, 379.99, '2024-02-01'),
(7, 4, 'Galaxy Watch SE', 279.99, 259.99, '2024-02-01'),
(8, 5, 'Pixel Tablet Pro', 1099.99, 1049.99, '2024-02-15'),
(9, 5, 'Pixel Tablet', 799.99, 749.99, '2024-02-15');

-- Insert sample stock records
INSERT INTO stock_records (model_id, stock_quantity, last_updated) VALUES
(1, 50, NOW()),
(2, 30, NOW()),
(3, 1, NOW()),
(4, 75, NOW()),
(5, 200, NOW()),
(6, 60, NOW()),
(7, 90, NOW()),
(8, 40, NOW()),
(9, 70, NOW());

-- Insert sample purchase batches
INSERT INTO purchase_batches (supplier_id, created_at, expect_date, status) VALUES
(1, NOW(), NOW() + INTERVAL '7 days', 'confirmed'),
(2, NOW(), NOW() + INTERVAL '5 days', 'confirmed'),
(3, NOW(), NOW() + INTERVAL '3 days', 'draft');

-- Insert sample purchase items
INSERT INTO purchase_items (batch_id, model_id, quantity, unit_cost, note) VALUES
(1, 1, 20, 1800.00, 'Initial stock order'),
(1, 2, 15, 2200.00, 'High demand model'),
(1, 3, 50, 800.00, 'Regular stock replenishment'),
(1, 4, 40, 1000.00, 'New model launch'),
(2, 5, 100, 200.00, 'Regular stock replenishment'),
(2, 6, 30, 350.00, 'New model launch'),
(2, 7, 45, 250.00, 'Regular stock replenishment'),
(3, 8, 20, 1000.00, 'Initial stock order'),
(3, 9, 35, 700.00, 'Regular stock replenishment');

-- Insert historical orders (last 180 days)
INSERT INTO orders (order_id, buyer_id, product_total_price, shipping_fee, total_paid, order_status, created_at, payment_time, shipped_at, completed_at) VALUES
-- January Orders (30 days ago)
('ORD001', 1, 1999.99, 15.00, 2014.99, 'delivered', 
 NOW() - INTERVAL '30 days', 
 NOW() - INTERVAL '29 days 23 hours', 
 NOW() - INTERVAL '28 days', 
 NOW() - INTERVAL '25 days'),
('ORD002', 2, 2499.99, 15.00, 2514.99, 'delivered', 
 NOW() - INTERVAL '29 days', 
 NOW() - INTERVAL '28 days 23 hours', 
 NOW() - INTERVAL '27 days', 
 NOW() - INTERVAL '24 days'),
('ORD003', 3, 999.99, 15.00, 1014.99, 'delivered', 
 NOW() - INTERVAL '28 days', 
 NOW() - INTERVAL '27 days 23 hours', 
 NOW() - INTERVAL '26 days', 
 NOW() - INTERVAL '23 days'),

-- February Orders (60 days ago)
('ORD004', 1, 229.99, 15.00, 244.99, 'delivered', 
 NOW() - INTERVAL '60 days', 
 NOW() - INTERVAL '59 days 23 hours', 
 NOW() - INTERVAL '58 days', 
 NOW() - INTERVAL '55 days'),
('ORD005', 2, 1899.99, 15.00, 1914.99, 'delivered', 
 NOW() - INTERVAL '59 days', 
 NOW() - INTERVAL '58 days 23 hours', 
 NOW() - INTERVAL '57 days', 
 NOW() - INTERVAL '54 days'),
('ORD006', 3, 1199.99, 15.00, 1214.99, 'delivered', 
 NOW() - INTERVAL '58 days', 
 NOW() - INTERVAL '57 days 23 hours', 
 NOW() - INTERVAL '56 days', 
 NOW() - INTERVAL '53 days'),

-- March Orders (90 days ago)
('ORD007', 1, 399.99, 15.00, 414.99, 'delivered', 
 NOW() - INTERVAL '90 days', 
 NOW() - INTERVAL '89 days 23 hours', 
 NOW() - INTERVAL '88 days', 
 NOW() - INTERVAL '85 days'),
('ORD008', 2, 279.99, 15.00, 294.99, 'delivered', 
 NOW() - INTERVAL '89 days', 
 NOW() - INTERVAL '88 days 23 hours', 
 NOW() - INTERVAL '87 days', 
 NOW() - INTERVAL '84 days'),
('ORD009', 3, 1099.99, 15.00, 1114.99, 'delivered', 
 NOW() - INTERVAL '88 days', 
 NOW() - INTERVAL '87 days 23 hours', 
 NOW() - INTERVAL '86 days', 
 NOW() - INTERVAL '83 days'),

-- April Orders (120 days ago)
('ORD010', 1, 799.99, 15.00, 814.99, 'delivered', 
 NOW() - INTERVAL '120 days', 
 NOW() - INTERVAL '119 days 23 hours', 
 NOW() - INTERVAL '118 days', 
 NOW() - INTERVAL '115 days'),
('ORD011', 2, 1999.99, 15.00, 2014.99, 'delivered', 
 NOW() - INTERVAL '119 days', 
 NOW() - INTERVAL '118 days 23 hours', 
 NOW() - INTERVAL '117 days', 
 NOW() - INTERVAL '114 days'),
('ORD012', 3, 2499.99, 15.00, 2514.99, 'delivered', 
 NOW() - INTERVAL '118 days', 
 NOW() - INTERVAL '117 days 23 hours', 
 NOW() - INTERVAL '116 days', 
 NOW() - INTERVAL '113 days'),

-- May Orders (150 days ago)
('ORD013', 1, 999.99, 15.00, 1014.99, 'delivered', 
 NOW() - INTERVAL '150 days', 
 NOW() - INTERVAL '149 days 23 hours', 
 NOW() - INTERVAL '148 days', 
 NOW() - INTERVAL '145 days'),
('ORD014', 2, 229.99, 15.00, 244.99, 'delivered', 
 NOW() - INTERVAL '149 days', 
 NOW() - INTERVAL '148 days 23 hours', 
 NOW() - INTERVAL '147 days', 
 NOW() - INTERVAL '144 days'),
('ORD015', 3, 1899.99, 15.00, 1914.99, 'delivered', 
 NOW() - INTERVAL '148 days', 
 NOW() - INTERVAL '147 days 23 hours', 
 NOW() - INTERVAL '146 days', 
 NOW() - INTERVAL '143 days'),

-- June Orders (180 days ago)
('ORD016', 1, 1199.99, 15.00, 1214.99, 'delivered', 
 NOW() - INTERVAL '180 days', 
 NOW() - INTERVAL '179 days 23 hours', 
 NOW() - INTERVAL '178 days', 
 NOW() - INTERVAL '175 days'),
('ORD017', 2, 399.99, 15.00, 414.99, 'delivered', 
 NOW() - INTERVAL '179 days', 
 NOW() - INTERVAL '178 days 23 hours', 
 NOW() - INTERVAL '177 days', 
 NOW() - INTERVAL '174 days'),
('ORD018', 3, 279.99, 15.00, 294.99, 'delivered', 
 NOW() - INTERVAL '178 days', 
 NOW() - INTERVAL '177 days 23 hours', 
 NOW() - INTERVAL '176 days', 
 NOW() - INTERVAL '173 days');

-- Insert order items with diverse growth patterns
INSERT INTO order_items (item_id, order_id, product_id, model_id, quantity, returned_quantity, sold_price, total_price) VALUES
-- January Orders (30 days ago) - Current Period
(1, 'ORD001', 1, 1, 5, 0, 1999.99, 9999.95),  -- MacBook Pro 14" (Exponential Growth)
(2, 'ORD002', 1, 2, 2, 0, 2499.99, 4999.98),  -- MacBook Pro 16" (Seasonal)
(3, 'ORD003', 2, 3, 8, 0, 999.99, 7999.92),   -- iPhone 15 Pro (Sudden Spike)

-- February Orders (60 days ago) - Previous Period
(4, 'ORD004', 3, 5, 3, 0, 229.99, 689.97),    -- Galaxy Buds Pro 2 (Steady Decline)
(5, 'ORD005', 1, 1, 3, 0, 1899.99, 5699.97),  -- MacBook Pro 14" (Previous)
(6, 'ORD006', 2, 4, 4, 0, 1199.99, 4799.96),  -- iPhone 15 Pro Max (Cyclical)

-- March Orders (90 days ago) - Current Period
(7, 'ORD007', 4, 6, 6, 0, 399.99, 2399.94),   -- Galaxy Watch 6 (Exponential)
(8, 'ORD008', 4, 7, 1, 0, 279.99, 279.99),    -- Galaxy Watch SE (Steady Decline)
(9, 'ORD009', 5, 8, 10, 0, 1099.99, 10999.90), -- Pixel Tablet Pro (Sudden Spike)

-- April Orders (120 days ago) - Previous Period
(10, 'ORD010', 5, 9, 3, 0, 799.99, 2399.97),  -- Pixel Tablet (Cyclical)
(11, 'ORD011', 1, 1, 2, 0, 1999.99, 3999.98), -- MacBook Pro 14" (Previous)
(12, 'ORD012', 1, 2, 5, 0, 2499.99, 12499.95), -- MacBook Pro 16" (Seasonal)

-- May Orders (150 days ago) - Current Period
(13, 'ORD013', 2, 3, 4, 0, 999.99, 3999.96),  -- iPhone 15 Pro (Steady)
(14, 'ORD014', 3, 5, 2, 0, 229.99, 459.98),   -- Galaxy Buds Pro 2 (Previous)
(15, 'ORD015', 1, 1, 7, 0, 1899.99, 13299.93), -- MacBook Pro 14" (Exponential)

-- June Orders (180 days ago) - Previous Period
(16, 'ORD016', 2, 4, 2, 0, 1199.99, 2399.98), -- iPhone 15 Pro Max (Previous)
(17, 'ORD017', 4, 6, 3, 0, 399.99, 1199.97),  -- Galaxy Watch 6 (Previous)
(18, 'ORD018', 4, 7, 2, 0, 279.99, 559.98);   -- Galaxy Watch SE (Previous)

