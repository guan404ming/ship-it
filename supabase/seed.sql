-- seed for categories
INSERT INTO categories (category_name) VALUES ('Category 1');
INSERT INTO categories (category_name) VALUES ('Category 2');
INSERT INTO categories (category_name) VALUES ('Category 3');
INSERT INTO categories (category_name) VALUES ('Category 4');
INSERT INTO categories (category_name) VALUES ('Category 5');

-- seed for products
INSERT INTO products (product_name, category_id, listed_date, status) VALUES 
  ('Premium Laptop', 1, '2025-01-15', 'active'),
  ('Wireless Headphones', 1, '2025-01-20', 'active'),
  ('Smart Watch', 1, '2025-02-05', 'active'),
  ('Gaming Console', 2, '2025-02-10', 'active'),
  ('Bluetooth Speaker', 2, '2025-02-15', 'active'),
  ('Digital Camera', 2, '2025-03-01', 'inactive'),
  ('Fitness Tracker', 3, '2025-03-10', 'active'),
  ('Tablet Device', 3, '2025-03-15', 'active'),
  ('Wireless Earbuds', 4, '2025-04-01', 'active'),
  ('Smart Home Hub', 4, '2025-04-10', 'pending'),
  ('External Hard Drive', 5, '2025-04-15', 'active'),
  ('Portable Charger', 5, '2025-04-20', 'inactive');

-- seed for product models
INSERT INTO product_models (product_id, model_name, sku, original_price, promo_price, created_at) VALUES
  (1, 'Premium Laptop Pro', 'LP-PRO-001', 1299.99, 1199.99, '2025-01-15 10:00:00'),
  (1, 'Premium Laptop Air', 'LP-AIR-001', 999.99, 899.99, '2025-01-15 10:30:00'),
  (1, 'Premium Laptop Basic', 'LP-BSC-001', 799.99, NULL, '2025-01-15 11:00:00'),
  (2, 'Headphones Pro', 'HP-PRO-001', 299.99, 249.99, '2025-01-20 09:00:00'),
  (2, 'Headphones Sport', 'HP-SPT-001', 199.99, 179.99, '2025-01-20 09:30:00'),
  (3, 'Smart Watch Elite', 'SW-ELT-001', 399.99, 349.99, '2025-02-05 14:00:00'),
  (3, 'Smart Watch Sport', 'SW-SPT-001', 299.99, 279.99, '2025-02-05 14:30:00'),
  (4, 'Gaming Console Standard', 'GC-STD-001', 499.99, NULL, '2025-02-10 11:00:00'),
  (4, 'Gaming Console Digital', 'GC-DIG-001', 399.99, 379.99, '2025-02-10 11:30:00'),
  (5, 'Bluetooth Speaker Large', 'BS-LRG-001', 199.99, 179.99, '2025-02-15 13:00:00'),
  (5, 'Bluetooth Speaker Mini', 'BS-MIN-001', 99.99, 89.99, '2025-02-15 13:30:00'),
  (6, 'Digital Camera Pro', 'DC-PRO-001', 899.99, 799.99, '2025-03-01 10:00:00'),
  (7, 'Fitness Tracker Premium', 'FT-PRM-001', 149.99, 129.99, '2025-03-10 15:00:00'),
  (8, 'Tablet Pro', 'TB-PRO-001', 699.99, 649.99, '2025-03-15 12:00:00'),
  (8, 'Tablet Standard', 'TB-STD-001', 499.99, 449.99, '2025-03-15 12:30:00'),
  (9, 'Wireless Earbuds Pro', 'WE-PRO-001', 199.99, 179.99, '2025-04-01 09:00:00'),
  (10, 'Smart Home Hub Standard', 'SH-STD-001', 249.99, NULL, '2025-04-10 14:00:00'),
  (11, 'External HDD 1TB', 'EH-1TB-001', 89.99, 79.99, '2025-04-15 11:00:00'),
  (11, 'External SSD 1TB', 'ES-1TB-001', 149.99, 129.99, '2025-04-15 11:30:00'),
  (12, 'Portable Charger 10000mAh', 'PC-10K-001', 49.99, 39.99, '2025-04-20 10:00:00');

