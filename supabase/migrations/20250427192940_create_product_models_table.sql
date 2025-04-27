CREATE TABLE IF NOT EXISTS product_models (
  model_id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  model_name VARCHAR NOT NULL,
  sku VARCHAR UNIQUE NOT NULL,
  original_price DECIMAL(10, 2) NOT NULL,
  promo_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_model
    FOREIGN KEY (product_id)
    REFERENCES products(product_id)
    ON DELETE CASCADE
);
