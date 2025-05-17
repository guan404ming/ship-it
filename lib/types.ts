import { Database } from "@/database.types";

// Basic table types
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductModel = Database["public"]["Tables"]["product_models"]["Row"];
export type StockRecord = Database["public"]["Tables"]["stock_records"]["Row"];
export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
export type Buyer = Database["public"]["Tables"]["buyers"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type InventoryMovement = Database["public"]["Tables"]["inventory_movements"]["Row"];
export type PurchaseBatch = Database["public"]["Tables"]["purchase_batches"]["Row"];
export type PurchaseItem = Database["public"]["Tables"]["purchase_items"]["Row"];

// Enums
export type OrderStatus = Database["public"]["Enums"]["order_status"];

// Composite types with relationships
export type ProductWithCategory = Product & {
  categories?: Category;
};

export type ProductModelWithProduct = ProductModel & {
  products: Product & {
    categories?: Category;
  };
};

export type StockRecordWithModel = StockRecord & {
  product_models: ProductModelWithProduct;
  supplier_name?: string;
  remaining_days?: number;
  is_ordered?: boolean;
};

export type OrderWithBuyer = Order & {
  buyers?: Buyer;
};

export type OrderItemWithDetails = OrderItem & {
  orders?: OrderWithBuyer;
  products?: Product;
  product_models?: ProductModel;
};

export type InventoryMovementWithModel = InventoryMovement & {
  product_models: ProductModelWithProduct;
};

export type PurchaseBatchWithSupplier = PurchaseBatch & {
  suppliers?: Supplier;
};

export type PurchaseItemWithDetails = PurchaseItem & {
  purchase_batches?: PurchaseBatchWithSupplier;
  product_models?: ProductModelWithProduct;
};

// Sales data interfaces for the history section
export interface SalesData {
  date: string;
  amount: number;
  quantity: number;
}

export interface ProductSalesModel {
  id: string | number;
  model_name: string;
  data: SalesData[];
}

// This interface can be used in two ways:
// 1. For grouped data with models array
// 2. For flattened data with direct model_name and data properties
export interface GroupedProductSales {
  id: string | number;
  sku: string;
  product_name: string;
  category_name: string;
  models?: ProductSalesModel[];  // For grouped representation
  model_name?: string;           // For flattened representation
  data?: SalesData[];            // For flattened representation
}

export interface RankingProduct {
  id: string | number;
  sku: string;
  product_name: string;
  category_name: string;
  model_name: string;
  sales: number;
  quantity: number;
  growth?: number;
  returns?: number;
  date?: string;
}

// Import History type for the upload section
export interface ImportHistory {
  id: string;
  date: string;
  fileName: string;
  recordCount: number;
  status: string;
  note?: string;
}

// Purchase import dialog types
export interface ModelItem {
  id: number;
  name: string;
  quantity: number;
}

export interface PurchaseImportItem {
  id: number;
  isVisible: boolean;
  product_name: string; 
  quantity: number;
  model_id?: number;
  product_id?: number;
  models: ModelItem[]; 
  note?: string;
}
