CREATE TABLE IF NOT EXISTS categories (
      category_id   SERIAL PRIMARY KEY,
      category_name VARCHAR NOT NULL,
      parent_id     INT,
      CONSTRAINT fk_parent
        FOREIGN KEY (parent_id)
        REFERENCES categories(category_id)
        ON DELETE SET NULL
    );