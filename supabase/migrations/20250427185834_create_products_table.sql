CREATE TABLE IF NOT EXISTS products (
      product_id    SERIAL PRIMARY KEY,
      product_name  VARCHAR NOT NULL,
      category_id   INT NOT NULL,
      listed_date   DATE,
      status        VARCHAR NOT NULL,
      CONSTRAINT fk_product_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE RESTRICT
    );