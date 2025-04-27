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

