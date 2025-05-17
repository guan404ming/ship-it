import { StockRecordWithModel } from "@/lib/types";

export const mockInventoryData: StockRecordWithModel[] = [
  {
    model_id: 1,
    stock_quantity: 25,
    last_updated: "2025-05-15T09:30:00Z",
    supplier_name: "廣大貿易有限公司",
    remaining_days: 15,
    is_ordered: false,
    product_models: {
      model_id: 1,
      model_name: "粉色",
      product_id: 1,
      sku: "jde2088-pink",
      original_price: 300,
      promo_price: 250,
      created_at: "2024-12-01T00:00:00Z",
      products: {
        product_id: 1,
        product_name: "兒童外套",
        category_id: 2,
        status: "active",
        listed_date: "2024-12-01T00:00:00Z",
        categories: {
          category_id: 2,
          category_name: "服飾",
          parent_id: null
        }
      }
    }
  },
  {
    model_id: 2,
    stock_quantity: 5,
    last_updated: "2025-05-16T14:20:00Z",
    supplier_name: "廣大貿易有限公司",
    remaining_days: 3,
    is_ordered: true,
    product_models: {
      model_id: 2,
      model_name: "藍色",
      product_id: 1,
      sku: "jde2088-blue",
      original_price: 300,
      promo_price: 250,
      created_at: "2024-12-01T00:00:00Z",
      products: {
        product_id: 1,
        product_name: "兒童外套",
        category_id: 2,
        status: "active",
        listed_date: "2024-12-01T00:00:00Z",
        categories: {
          category_id: 2,
          category_name: "服飾",
          parent_id: null
        }
      }
    }
  },
  {
    model_id: 3,
    stock_quantity: 42,
    last_updated: "2025-05-16T11:15:00Z",
    supplier_name: "玩具世界有限公司",
    remaining_days: 20,
    is_ordered: false,
    product_models: {
      model_id: 3,
      model_name: "海豚款",
      product_id: 2,
      sku: "fju3299-dolphin",
      original_price: 450,
      promo_price: 400,
      created_at: "2024-11-15T00:00:00Z",
      products: {
        product_id: 2,
        product_name: "拼圖",
        category_id: 1,
        status: "active",
        listed_date: "2024-11-15T00:00:00Z",
        categories: {
          category_id: 1,
          category_name: "兒童玩具",
          parent_id: null
        }
      }
    }
  },
  {
    model_id: 4,
    stock_quantity: 12,
    last_updated: "2025-05-14T16:45:00Z",
    supplier_name: "玩具世界有限公司",
    remaining_days: 7,
    is_ordered: false,
    product_models: {
      model_id: 4,
      model_name: "長頸鹿款",
      product_id: 2,
      sku: "fju3299-giraffe",
      original_price: 450,
      promo_price: 400,
      created_at: "2024-11-15T00:00:00Z",
      products: {
        product_id: 2,
        product_name: "拼圖",
        category_id: 1,
        status: "active",
        listed_date: "2024-11-15T00:00:00Z",
        categories: {
          category_id: 1,
          category_name: "兒童玩具",
          parent_id: null
        }
      }
    }
  },
  {
    model_id: 5,
    stock_quantity: 8,
    last_updated: "2025-05-15T10:00:00Z",
    supplier_name: "玩具世界有限公司",
    remaining_days: 4,
    is_ordered: true,
    product_models: {
      model_id: 5,
      model_name: "恐龍系列",
      product_id: 3,
      sku: "hkl5511-dino",
      original_price: 550,
      promo_price: 500,
      created_at: "2024-10-20T00:00:00Z",
      products: {
        product_id: 3,
        product_name: "積木",
        category_id: 1,
        status: "active",
        listed_date: "2024-10-20T00:00:00Z",
        categories: {
          category_id: 1,
          category_name: "兒童玩具",
          parent_id: null
        }
      }
    }
  },
  {
    model_id: 6,
    stock_quantity: 30,
    last_updated: "2025-05-16T09:10:00Z",
    supplier_name: "玩具世界有限公司",
    remaining_days: 18,
    is_ordered: false,
    product_models: {
      model_id: 6,
      model_name: "城市系列",
      product_id: 3,
      sku: "hkl5511-city",
      original_price: 550,
      promo_price: 500,
      created_at: "2024-10-20T00:00:00Z",
      products: {
        product_id: 3,
        product_name: "積木",
        category_id: 1,
        status: "active",
        listed_date: "2024-10-20T00:00:00Z",
        categories: {
          category_id: 1,
          category_name: "兒童玩具",
          parent_id: null
        }
      }
    }
  },
  {
    model_id: 7,
    stock_quantity: 15,
    last_updated: "2025-05-15T14:30:00Z",
    supplier_name: "友盛配件有限公司",
    remaining_days: 9,
    is_ordered: false,
    product_models: {
      model_id: 7,
      model_name: "藍色",
      product_id: 4,
      sku: "pqr7722-blue",
      original_price: 380,
      promo_price: 350,
      created_at: "2025-01-15T00:00:00Z",
      products: {
        product_id: 4,
        product_name: "兒童書包",
        category_id: 3,
        status: "active",
        listed_date: "2025-01-15T00:00:00Z",
        categories: {
          category_id: 3,
          category_name: "配件",
          parent_id: null
        }
      }
    }
  },
  {
    model_id: 8,
    stock_quantity: 20,
    last_updated: "2025-05-15T14:40:00Z",
    supplier_name: "友盛配件有限公司",
    remaining_days: 12,
    is_ordered: false,
    product_models: {
      model_id: 8,
      model_name: "粉紅色",
      product_id: 4,
      sku: "pqr7722-pink",
      original_price: 380,
      promo_price: 350,
      created_at: "2025-01-15T00:00:00Z",
      products: {
        product_id: 4,
        product_name: "兒童書包",
        category_id: 3,
        status: "active",
        listed_date: "2025-01-15T00:00:00Z",
        categories: {
          category_id: 3,
          category_name: "配件",
          parent_id: null
        }
      }
    }
  },
  {
    model_id: 9,
    stock_quantity: 6,
    last_updated: "2025-05-16T15:20:00Z",
    supplier_name: "友盛配件有限公司",
    remaining_days: 5,
    is_ordered: true,
    product_models: {
      model_id: 9,
      model_name: "藍色",
      product_id: 5,
      sku: "abc1234-blue",
      original_price: 220,
      promo_price: 200,
      created_at: "2025-02-10T00:00:00Z",
      products: {
        product_id: 5,
        product_name: "兒童帽子",
        category_id: 3,
        status: "active",
        listed_date: "2025-02-10T00:00:00Z",
        categories: {
          category_id: 3,
          category_name: "配件",
          parent_id: null
        }
      }
    }
  },
  {
    model_id: 10,
    stock_quantity: 35,
    last_updated: "2025-05-15T13:50:00Z",
    supplier_name: "童樂鞋業有限公司",
    remaining_days: 16,
    is_ordered: false,
    product_models: {
      model_id: 10,
      model_name: "恐龍圖案",
      product_id: 6,
      sku: "def5678-dino",
      original_price: 280,
      promo_price: 250,
      created_at: "2025-03-05T00:00:00Z",
      products: {
        product_id: 6,
        product_name: "兒童雨靴",
        category_id: 4,
        status: "active",
        listed_date: "2025-03-05T00:00:00Z",
        categories: {
          category_id: 4,
          category_name: "鞋類",
          parent_id: null
        }
      }
    }
  }
];
