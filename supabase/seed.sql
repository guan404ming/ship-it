-- Insert sample suppliers
INSERT INTO suppliers (supplier_name, contact_info, created_at) VALUES
('Tech Supplier Co.', 'contact@techsupplier.com', NOW()),
('Global Electronics', 'sales@globalelectronics.com', NOW()),
('Smart Gadgets Inc.', 'info@smartgadgets.com', NOW());

-- Insert sample buyers
INSERT INTO buyers (buyer_account) VALUES
('buyer1@example.com'),
('buyer2@example.com'),
('buyer3@example.com');

-- Insert sample categories
INSERT INTO categories (category_name, parent_id) VALUES
('Electronics', NULL),
('Computers', 1),
('Smartphones', 1),
('Accessories', 1);

-- Insert sample products
INSERT INTO products (product_name, category_id, listed_date, status) VALUES
('MacBook Pro', 2, NOW(), 'active'),
('iPhone 15', 3, NOW(), 'active'),
('Wireless Earbuds', 4, NOW(), 'active');

-- Insert sample product models
INSERT INTO product_models (product_id, model_name, sku, original_price, promo_price, created_at) VALUES
(1, 'MacBook Pro 14" M3', 'MBP14-M3-2024', 1999.99, 1899.99, NOW()),
(1, 'MacBook Pro 16" M3', 'MBP16-M3-2024', 2499.99, 2399.99, NOW()),
(2, 'iPhone 15 Pro', 'IP15-PRO-256', 999.99, 949.99, NOW()),
(2, 'iPhone 15 Pro Max', 'IP15-PRO-MAX-512', 1199.99, 1149.99, NOW()),
(3, 'AirPods Pro 2', 'AP-PRO2', 249.99, 229.99, NOW());

-- Insert sample stock records
INSERT INTO stock_records (model_id, stock_quantity, last_updated) VALUES
(1, 50, NOW()),
(2, 30, NOW()),
(3, 100, NOW()),
(4, 75, NOW()),
(5, 200, NOW());

-- Insert sample purchase batches
INSERT INTO purchase_batches (supplier_id, created_at, status) VALUES
(1, NOW(), 'completed'),
(2, NOW(), 'completed'),
(3, NOW(), 'pending');

-- Insert sample purchase items
INSERT INTO purchase_items (batch_id, model_id, quantity, unit_cost) VALUES
(1, 1, 20, 1800.00),
(1, 2, 15, 2200.00),
(2, 3, 50, 800.00),
(2, 4, 40, 1000.00),
(3, 5, 100, 200.00);

-- Insert sample orders
INSERT INTO orders (order_id, buyer_id, product_total_price, shipping_fee, total_paid, order_status, created_at) VALUES
('ORD001', 1, 1999.99, 15.00, 2014.99, 'delivered', NOW()),
('ORD002', 2, 2499.99, 15.00, 2514.99, 'shipped', NOW()),
('ORD003', 3, 999.99, 15.00, 1014.99, 'pending', NOW());

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, model_id, quantity, sold_price, total_price) VALUES
('ORD001', 1, 1, 1, 1999.99, 1999.99),
('ORD002', 1, 2, 1, 2499.99, 2499.99),
('ORD003', 2, 3, 1, 999.99, 999.99);

-- Insert sample inventory movements
INSERT INTO inventory_movements (model_id, order_id, movement_type, quantity, created_at, note) VALUES
(1, 'ORD001', 'out', 1, NOW(), 'Order fulfillment'),
(2, 'ORD002', 'out', 1, NOW(), 'Order fulfillment'),
(3, 'ORD003', 'out', 1, NOW(), 'Order fulfillment');

