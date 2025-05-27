-- Insert sample suppliers
INSERT INTO suppliers (supplier_id, supplier_name, contact_info, created_at) VALUES
(1, 'Tech Supplier Co.', 'contact@techsupplier.com', NOW()),
(2, 'Global Electronics', 'sales@globalelectronics.com', NOW()),
(3, 'Smart Gadgets Inc.', 'info@smartgadgets.com', NOW());

-- Insert sample buyers
INSERT INTO buyers (buyer_id, buyer_account) VALUES
(1, 'buyer1@example.com'),
(2, 'buyer2@example.com'),
(3, 'buyer3@example.com');

-- Insert sample products
INSERT INTO products (product_id, product_name, listed_date, status) VALUES
(1, 'MacBook Pro', NOW(), 'active'),
(2, 'iPhone 15', NOW(), 'active'),
(3, 'Wireless Earbuds', NOW(), 'active');

-- Insert sample product models
INSERT INTO product_models (model_id, product_id, model_name, original_price, promo_price, created_at) VALUES
(1, 1, 'MacBook Pro 14" M3', 1999.99, 1899.99, NOW()),
(2, 1, 'MacBook Pro 16" M3', 2499.99, 2399.99, NOW()),
(3, 2, 'iPhone 15 Pro', 999.99, 949.99, NOW()),
(4, 2, 'iPhone 15 Pro Max', 1199.99, 1149.99, NOW()),
(5, 3, 'AirPods Pro 2', 249.99, 229.99, NOW());

-- Insert sample stock records
INSERT INTO stock_records (model_id, stock_quantity, last_updated) VALUES
(1, 50, NOW()),
(2, 30, NOW()),
(3, 100, NOW()),
(4, 75, NOW()),
(5, 200, NOW());

-- Insert sample purchase batches
INSERT INTO purchase_batches (batch_id, supplier_id, created_at, expect_date, status) VALUES
(1, 1, NOW(), NOW() + INTERVAL '7 days', 'confirmed'),
(2, 2, NOW(), NOW() + INTERVAL '5 days', 'confirmed'),
(3, 3, NOW(), NOW() + INTERVAL '3 days', 'draft');

-- Insert sample purchase items
INSERT INTO purchase_items (item_id, batch_id, model_id, quantity, unit_cost, note) VALUES
(1, 1, 1, 20, 1800.00, 'Initial stock order'),
(2, 1, 2, 15, 2200.00, 'High demand model'),
(3, 2, 3, 50, 800.00, 'Regular stock replenishment'),
(4, 2, 4, 40, 1000.00, 'New model launch'),
(5, 3, 5, 100, 200.00, 'Pending confirmation');

-- Insert sample orders with different statuses
INSERT INTO orders (order_id, buyer_id, product_total_price, shipping_fee, total_paid, order_status, created_at, payment_time, shipped_at, completed_at) VALUES
-- Delivered order
('ORD001', 1, 1999.99, 15.00, 2014.99, 'delivered', 
 NOW() - INTERVAL '7 days', 
 NOW() - INTERVAL '6 days 23 hours', 
 NOW() - INTERVAL '5 days', 
 NOW() - INTERVAL '2 days'),
-- Shipped order
('ORD002', 2, 2499.99, 15.00, 2514.99, 'shipped', 
 NOW() - INTERVAL '3 days', 
 NOW() - INTERVAL '2 days 22 hours', 
 NOW() - INTERVAL '2 days', 
 NULL),
-- Confirmed order (paid but not shipped)
('ORD003', 3, 999.99, 15.00, 1014.99, 'confirmed', 
 NOW() - INTERVAL '1 day', 
 NOW() - INTERVAL '23 hours', 
 NULL, 
 NULL),
-- Confirmed in trial period
('ORD004', 1, 229.99, 15.00, 244.99, 'confirmed_in_trial', 
 NOW() - INTERVAL '2 days', 
 NOW() - INTERVAL '1 day 23 hours', 
 NULL, 
 NULL),
-- Pending order (not paid)
('ORD005', 2, 1899.99, 15.00, 1914.99, 'pending', 
 NOW() - INTERVAL '12 hours', 
 NULL, 
 NULL, 
 NULL),
-- Canceled order
('ORD006', 3, 1199.99, 15.00, 0.00, 'canceled', 
 NOW() - INTERVAL '1 day', 
 NULL, 
 NULL, 
 NULL);

-- Insert sample order items
INSERT INTO order_items (item_id, order_id, product_id, model_id, quantity, returned_quantity, sold_price, total_price) VALUES
-- Normal delivery
(1, 'ORD001', 1, 1, 1, 0, 1999.99, 1999.99),
-- Partial return
(2, 'ORD002', 1, 2, 2, 1, 2499.99, 4999.98),
-- Normal order
(3, 'ORD003', 2, 3, 1, 0, 999.99, 999.99),
-- Trial period order
(4, 'ORD004', 3, 5, 1, 0, 229.99, 229.99),
-- Pending order
(5, 'ORD005', 1, 1, 1, 0, 1899.99, 1899.99),
-- Canceled order
(6, 'ORD006', 2, 4, 1, 0, 1199.99, 1199.99);

