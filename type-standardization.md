# Type Standardization Summary

This document provides an overview of the type standardization performed in the codebase to ensure consistency between mock data and database schema.

## Database Types

All database-related types are now centralized in `lib/types.ts` and aligned with the database schema defined in `database.types.ts`.

### Basic Table Types
These types directly correspond to the database tables:

```typescript
// Database table types
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
```

### Composite Types with Relationships
These types include relationships between tables:

```typescript
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
};

// Plus many others...
```

### Sales and History Related Types
These types are used for sales analysis and history views:

```typescript
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
```

## Special Types for UI Components and Mock Data

Several specialized types were created to handle UI-specific data structures:

```typescript
// Helper types for purchases and dialogs
export interface ModelItem {
  id: number;
  name: string;
  quantity: number;
}

// Sales data interfaces for graphs and charts
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

export interface GroupedProductSales {
  id: string | number;
  sku: string;
  product_name: string;
  category_name: string;
  models?: ProductSalesModel[];  // For grouped representation
  model_name?: string;           // For flattened representation
  data?: SalesData[];            // For flattened representation
}
```

## Files Updated

The following files were updated to use the standardized types:

1. `/Users/bensonchiu/Documents/Documents/113-2/IIM/ship-it/app/(pages)/inventory/client.tsx`
2. `/Users/bensonchiu/Documents/Documents/113-2/IIM/ship-it/app/(pages)/history/client.tsx`  
3. `/Users/bensonchiu/Documents/Documents/113-2/IIM/ship-it/app/(pages)/upload/client.tsx`
4. `/Users/bensonchiu/Documents/Documents/113-2/IIM/ship-it/lib/product-utils.ts`
5. `/Users/bensonchiu/Documents/Documents/113-2/IIM/ship-it/components/history/overall-performance.tsx`
6. `/Users/bensonchiu/Documents/Documents/113-2/IIM/ship-it/components/history/product-performance.tsx`
7. `/Users/bensonchiu/Documents/Documents/113-2/IIM/ship-it/components/history/sales-rankings.tsx`
8. `/Users/bensonchiu/Documents/Documents/113-2/IIM/ship-it/actions/orders.ts`
9. `/Users/bensonchiu/Documents/Documents/113-2/IIM/ship-it/components/purchase-import-dialog.tsx`

## Benefits of Type Standardization

1. **Consistency**: All mock data now aligns with database schema
2. **Type Safety**: Better TypeScript type checking throughout the codebase
3. **Maintainability**: Clear type definitions make the code easier to maintain
4. **Developer Experience**: Improved autocomplete and documentation
5. **Refactoring**: Easier to update code when database schema changes
