ALTER TABLE "purchase_items" 
ADD FOREIGN KEY ("model_id") REFERENCES "product_models" ("model_id")