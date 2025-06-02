import { Database } from "@/database.types";

// Basic table types
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductModel =
  Database["public"]["Tables"]["product_models"]["Row"];
export type StockRecord = Database["public"]["Tables"]["stock_records"]["Row"];
export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
export type Buyer = Database["public"]["Tables"]["buyers"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type PurchaseBatch =
  Database["public"]["Tables"]["purchase_batches"]["Row"];
export type PurchaseItem =
  Database["public"]["Tables"]["purchase_items"]["Row"];

// Enums
export type OrderStatus = Database["public"]["Enums"]["order_status"];

// Composite types with relationships
export type ProductModelWithProduct = ProductModel & {
  products: Product;
};

// 用於我的庫存
export type StockRecordWithModel = StockRecord &
  ProductModel &
  Product & {
    supplier_name?: string;
    remaining_days?: number;
    is_ordered?: boolean;
  };

export type InventoryDashboardRow = {
  model_id: number;
  model_name: string;
  product_name: string;
  stock_quantity: number;
  last_updated: string;
  supplier_name: string;
  supplier_id: number;
  remaining_days: number;
  has_recent_purchase: boolean;
};

export type PurchaseDashboardRow = {
  item_id: number;
  quantity: number;
  batch_id: number;
  created_at: string;
  expect_date: string;
  status: string;
  supplier_name: string;
  model_name: string;
  product_name: string;
  note?: string;
  unit_cost: number;
};

// 用於匯入歷史
export interface ImportHistory {
  id: string;
  date: string;
  fileName: string;
  recordCount: number;
  status: string;
  note?: string;
}

// 用於歷史數據 -> 整體銷售表現
export interface SalesData {
  date: string;
  amount: number;
  quantity: number;
}

// 用於歷史數據 -> 銷售表現
export type RankingProduct = {
  product_id: number;
  product_name: string;
  listed_date: string;
  status: string;
  model_id: number;
  model_name: string;
  original_price: number;
  promo_price: number | null;
  created_at: string;
  sales: number;
  quantity: number;
  growth?: number;
};

// 用於歷史數據 -> 各項商品表現
export type ProductSalesModel = ProductModel & {
  data: SalesData[];
};

export type GroupedProductSales = {
  product_id: number;
  product_name: string;
  listed_date: string;
  status: string;
  models: ProductSalesModel[];
};
