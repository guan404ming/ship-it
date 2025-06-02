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
INSERT INTO suppliers (supplier_name, contact_info, created_at) VALUES
('Apple Supplier Co.', 'contact@applesupplier.com', NOW()),
('Samsung Electronics', 'sales@samsungelectronics.com', NOW()),
('Google Devices Inc.', 'info@googledevices.com', NOW());

-- Insert sample buyers
INSERT INTO buyers (buyer_account) VALUES
('buyer1@example.com'),
('buyer2@example.com'),
('buyer3@example.com');

-- Insert sample products
INSERT INTO products (product_name, listed_date, status) VALUES
('MacBook Pro', '2024-01-01', 'active'),
('iPhone 15', '2024-01-01', 'active'),
('Galaxy Buds', '2024-01-01', 'active'),
('Galaxy Watch', '2024-02-01', 'active'),
('Pixel Tablet', '2024-02-15', 'active');

-- Insert sample product models
INSERT INTO product_models (product_id, model_name, original_price, promo_price, created_at) VALUES
(1, 'MacBook Pro 14" M3', 1999.99, 1899.99, '2024-01-01'),
(1, 'MacBook Pro 16" M3', 2499.99, 2399.99, '2024-01-01'),
(2, 'iPhone 15 Pro', 999.99, 949.99, '2024-01-01'),
(2, 'iPhone 15 Pro Max', 1199.99, 1149.99, '2024-01-01'),
(3, 'Galaxy Buds Pro 2', 249.99, 229.99, '2024-01-01'),
(4, 'Galaxy Watch 6', 399.99, 379.99, '2024-02-01'),
(4, 'Galaxy Watch SE', 279.99, 259.99, '2024-02-01'),
(5, 'Pixel Tablet Pro', 1099.99, 1049.99, '2024-02-15'),
(5, 'Pixel Tablet', 799.99, 749.99, '2024-02-15');

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

-- Insert historical orders (last 30 days, 3 orders per day)
DO $$
DECLARE
  d integer;
  o integer;
  order_id text;
  buyer_id integer;
  product_id integer;
  model_id integer;
  q integer;
  price numeric;
  total numeric;
BEGIN
  FOR d IN 1..30 LOOP
    FOR o IN 1..3 LOOP
      order_id := 'ORD' || to_char(d, 'FM00') || to_char(o, 'FM0');
      buyer_id := ((o + d) % 3) + 1;
      INSERT INTO orders (order_id, buyer_id, product_total_price, shipping_fee, total_paid, order_status, created_at, payment_time, shipped_at, completed_at)
      VALUES (
        order_id,
        buyer_id,
        1000 + d * 10 + o * 5,
        15.00,
        1015 + d * 10 + o * 5,
        'delivered',
        NOW() - (d || ' days')::interval,
        NOW() - (d || ' days 23 hours')::interval,
        NOW() - (d || ' days 22 hours')::interval,
        NOW() - (d || ' days 21 hours')::interval
      );
      -- 每張訂單隨機 2~4 個商品型號
      FOR q IN 1..((o % 3) + 2) LOOP
        product_id := ((q + o + d) % 5) + 1;
        model_id := ((q + o + d) % 9) + 1;
        price := 100 + (model_id * 10) + (d * 2);
        INSERT INTO order_items (order_id, product_id, model_id, quantity, returned_quantity, sold_price, total_price)
        VALUES (
          order_id,
          product_id,
          model_id,
          ((q + d + o) % 5) + 1,
          0,
          price,
          price * (((q + d + o) % 5) + 1)
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

