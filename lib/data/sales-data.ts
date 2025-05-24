import { SalesData, RankingProduct, GroupedProductSales } from '../types';

export const salesData: SalesData[] = [
  { date: "2024-11-01", amount: 6240, quantity: 124 },
  { date: "2024-11-07", amount: 6580, quantity: 131 },
  { date: "2024-11-14", amount: 6750, quantity: 135 },
  { date: "2024-11-21", amount: 7020, quantity: 141 },
  { date: "2024-11-28", amount: 7430, quantity: 148 },
  { date: "2024-12-05", amount: 8120, quantity: 162 },
  { date: "2024-12-12", amount: 8740, quantity: 174 },
  { date: "2024-12-19", amount: 9580, quantity: 192 },
  { date: "2024-12-26", amount: 10240, quantity: 204 },
  { date: "2025-01-02", amount: 8520, quantity: 170 },
  { date: "2025-01-09", amount: 8160, quantity: 163 },
  { date: "2025-01-16", amount: 7820, quantity: 156 },
  { date: "2025-01-23", amount: 8050, quantity: 161 },
  { date: "2025-01-30", amount: 8380, quantity: 167 },
  { date: "2025-02-06", amount: 8960, quantity: 179 },
  { date: "2025-02-13", amount: 9240, quantity: 184 },
  { date: "2025-02-20", amount: 9540, quantity: 190 },
  { date: "2025-02-27", amount: 9870, quantity: 197 },
  { date: "2025-03-06", amount: 10240, quantity: 204 },
  { date: "2025-03-13", amount: 10530, quantity: 210 },
  { date: "2025-03-20", amount: 10860, quantity: 217 },
  { date: "2025-03-27", amount: 11180, quantity: 223 },
  { date: "2025-04-03", amount: 11450, quantity: 229 },
  { date: "2025-04-10", amount: 11680, quantity: 233 },
  { date: "2025-04-17", amount: 11940, quantity: 238 },
  { date: "2025-04-24", amount: 12240, quantity: 244 },
  { date: "2025-05-01", amount: 12480, quantity: 249 },
];

export const productRankingData: RankingProduct[] = [
  {
    // Product fields
    product_id: 1,
    product_name: "拼圖",
    listed_date: "2024-01-01",
    status: "active",
    // ProductModel fields
    model_id: 1,
    model_name: "長頸鹿款",
    original_price: 40,
    promo_price: null,
    created_at: "2024-01-01T00:00:00Z",
    // RankingProduct specific fields
    sales: 1840,
    quantity: 46,
    growth: 7.0,
  },
  {
    // Product fields
    product_id: 1,
    product_name: "拼圖",
    listed_date: "2024-01-01",
    status: "active",
    // ProductModel fields
    model_id: 2,
    model_name: "海豚款",
    original_price: 40,
    promo_price: null,
    created_at: "2024-01-01T00:00:00Z",
    // RankingProduct specific fields
    sales: 1400,
    quantity: 35,
    growth: 6.1,
  },
  {
    // Product fields
    product_id: 2,
    product_name: "兒童外套",
    listed_date: "2024-01-01",
    status: "active",
    // ProductModel fields
    model_id: 3,
    model_name: "粉色",
    original_price: 60,
    promo_price: null,
    created_at: "2024-01-01T00:00:00Z",
    // RankingProduct specific fields
    sales: 2940,
    quantity: 49,
    growth: 14.0,
  },
  {
    // Product fields
    product_id: 2,
    product_name: "兒童外套",
    listed_date: "2024-01-01",
    status: "active",
    // ProductModel fields
    model_id: 4,
    model_name: "黑色",
    original_price: 60,
    promo_price: null,
    created_at: "2024-01-01T00:00:00Z",
    // RankingProduct specific fields
    sales: 1740,
    quantity: 29,
    growth: 16.0,
  },
  {
    // Product fields
    product_id: 3,
    product_name: "積木",
    listed_date: "2024-01-01",
    status: "active",
    // ProductModel fields
    model_id: 5,
    model_name: "恐龍系列",
    original_price: 50,
    promo_price: null,
    created_at: "2024-01-01T00:00:00Z",
    // RankingProduct specific fields
    sales: 2100,
    quantity: 42,
    growth: 8.2,
  },
  {
    // Product fields
    product_id: 3,
    product_name: "積木",
    listed_date: "2024-01-01",
    status: "active",
    // ProductModel fields
    model_id: 6,
    model_name: "城市系列",
    original_price: 50,
    promo_price: null,
    created_at: "2024-01-01T00:00:00Z",
    // RankingProduct specific fields
    sales: 1950,
    quantity: 39,
    growth: 8.3,
  },
  {
    // Product fields
    product_id: 4,
    product_name: "兒童書包",
    listed_date: "2024-01-01",
    status: "active",
    // ProductModel fields
    model_id: 7,
    model_name: "藍色",
    original_price: 50,
    promo_price: null,
    created_at: "2024-01-01T00:00:00Z",
    // RankingProduct specific fields
    sales: 1250,
    quantity: 25,
    growth: 0.8,
  },
  {
    // Product fields
    product_id: 4,
    product_name: "兒童書包",
    listed_date: "2024-01-01",
    status: "active",
    // ProductModel fields
    model_id: 8,
    model_name: "粉紅色",
    original_price: 50,
    promo_price: null,
    created_at: "2024-01-01T00:00:00Z",
    // RankingProduct specific fields
    sales: 1480,
    quantity: 29,
    growth: 2.1,
  },
  {
    // Product fields
    product_id: 5,
    product_name: "兒童水壺",
    listed_date: "2024-01-01",
    status: "active",
    // ProductModel fields
    model_id: 9,
    model_name: "350ml",
    original_price: 50,
    promo_price: null,
    created_at: "2024-01-01T00:00:00Z",
    // RankingProduct specific fields
    sales: 950,
    quantity: 19,
    growth: -3.5,
  },
  {
    // Product fields
    product_id: 5,
    product_name: "兒童水壺",
    listed_date: "2024-01-01",
    status: "active",
    // ProductModel fields
    model_id: 10,
    model_name: "500ml",
    original_price: 50,
    promo_price: null,
    created_at: "2024-01-01T00:00:00Z",
    // RankingProduct specific fields
    sales: 1050,
    quantity: 21,
    growth: -1.0,
  },
  {
    // Product fields
    product_id: 6,
    product_name: "兒童帽子",
    listed_date: "2024-01-01",
    status: "active",
    // ProductModel fields
    model_id: 11,
    model_name: "藍色",
    original_price: 20,
    promo_price: null,
    created_at: "2024-01-01T00:00:00Z",
    // RankingProduct specific fields
    sales: 780,
    quantity: 39,
    growth: -5.1,
  },
  {
    // Product fields
    product_id: 7,
    product_name: "兒童雨靴",
    listed_date: "2024-01-01",
    status: "active",
    // ProductModel fields
    model_id: 12,
    model_name: "恐龍圖案",
    original_price: 60,
    promo_price: null,
    created_at: "2024-01-01T00:00:00Z",
    // RankingProduct specific fields
    sales: 1320,
    quantity: 22,
    growth: 3.9,
  },
];

export const productSalesData: GroupedProductSales[] = [
  {
    // Product fields
    product_id: 1,
    product_name: "拼圖",
    listed_date: "2024-01-01",
    status: "active",
    models: [
      {
        // ProductModel fields
        model_id: 1,
        model_name: "長頸鹿款",
        original_price: 40,
        promo_price: null,
        created_at: "2024-01-01T00:00:00Z",
        product_id: 1,
        data: [
          { date: "2024-11-01", amount: 1240, quantity: 31 },
          { date: "2024-12-01", amount: 1580, quantity: 38 },
          { date: "2025-01-01", amount: 1320, quantity: 33 },
          { date: "2025-02-01", amount: 1460, quantity: 36 },
          { date: "2025-03-01", amount: 1640, quantity: 41 },
          { date: "2025-04-01", amount: 1720, quantity: 43 },
          { date: "2025-05-01", amount: 1840, quantity: 46 },
        ],
      },
      {
        // ProductModel fields
        model_id: 2,
        model_name: "海豚款",
        original_price: 40,
        promo_price: null,
        created_at: "2024-01-01T00:00:00Z",
        product_id: 1,
        data: [
          { date: "2024-11-01", amount: 1000, quantity: 25 },
          { date: "2024-12-01", amount: 1200, quantity: 30 },
          { date: "2025-01-01", amount: 900, quantity: 22 },
          { date: "2025-02-01", amount: 1080, quantity: 27 },
          { date: "2025-03-01", amount: 1240, quantity: 31 },
          { date: "2025-04-01", amount: 1320, quantity: 33 },
          { date: "2025-05-01", amount: 1400, quantity: 35 },
        ],
      },
    ],
  },
  {
    // Product fields
    product_id: 2,
    product_name: "兒童外套",
    listed_date: "2024-01-01",
    status: "active",
    models: [
      {
        // ProductModel fields
        model_id: 3,
        model_name: "粉色",
        original_price: 60,
        promo_price: null,
        created_at: "2024-01-01T00:00:00Z",
        product_id: 2,
        data: [
          { date: "2024-11-01", amount: 1200, quantity: 20 },
          { date: "2024-12-01", amount: 1440, quantity: 24 },
          { date: "2025-01-01", amount: 1680, quantity: 28 },
          { date: "2025-02-01", amount: 1980, quantity: 33 },
          { date: "2025-03-01", amount: 2220, quantity: 37 },
          { date: "2025-04-01", amount: 2580, quantity: 43 },
          { date: "2025-05-01", amount: 2940, quantity: 49 },
        ],
      },
      {
        // ProductModel fields
        model_id: 4,
        model_name: "黑色",
        original_price: 60,
        promo_price: null,
        created_at: "2024-01-01T00:00:00Z",
        product_id: 2,
        data: [
          { date: "2024-11-01", amount: 600, quantity: 10 },
          { date: "2024-12-01", amount: 720, quantity: 12 },
          { date: "2025-01-01", amount: 900, quantity: 15 },
          { date: "2025-02-01", amount: 1080, quantity: 18 },
          { date: "2025-03-01", amount: 1320, quantity: 22 },
          { date: "2025-04-01", amount: 1500, quantity: 25 },
          { date: "2025-05-01", amount: 1740, quantity: 29 },
        ],
      },
    ],
  },
  {
    // Product fields
    product_id: 3,
    product_name: "積木",
    listed_date: "2024-01-01",
    status: "active",
    models: [
      {
        // ProductModel fields
        model_id: 5,
        model_name: "恐龍系列",
        original_price: 50,
        promo_price: null,
        created_at: "2024-01-01T00:00:00Z",
        product_id: 3,
        data: [
          { date: "2024-11-01", amount: 1060, quantity: 21 },
          { date: "2024-12-01", amount: 1250, quantity: 25 },
          { date: "2025-01-01", amount: 1380, quantity: 28 },
          { date: "2025-02-01", amount: 1600, quantity: 32 },
          { date: "2025-03-01", amount: 1750, quantity: 35 },
          { date: "2025-04-01", amount: 1940, quantity: 39 },
          { date: "2025-05-01", amount: 2100, quantity: 42 },
        ],
      },
      {
        // ProductModel fields
        model_id: 6,
        model_name: "城市系列",
        original_price: 50,
        promo_price: null,
        created_at: "2024-01-01T00:00:00Z",
        product_id: 3,
        data: [
          { date: "2024-11-01", amount: 980, quantity: 20 },
          { date: "2024-12-01", amount: 1150, quantity: 23 },
          { date: "2025-01-01", amount: 1280, quantity: 26 },
          { date: "2025-02-01", amount: 1480, quantity: 30 },
          { date: "2025-03-01", amount: 1650, quantity: 33 },
          { date: "2025-04-01", amount: 1800, quantity: 36 },
          { date: "2025-05-01", amount: 1950, quantity: 39 },
        ],
      },
    ],
  },
  {
    // Product fields
    product_id: 4,
    product_name: "兒童書包",
    listed_date: "2024-01-01",
    status: "active",
    models: [
      {
        // ProductModel fields
        model_id: 7,
        model_name: "藍色",
        original_price: 50,
        promo_price: null,
        created_at: "2024-01-01T00:00:00Z",
        product_id: 4,
        data: [
          { date: "2024-11-01", amount: 1350, quantity: 27 },
          { date: "2024-12-01", amount: 1320, quantity: 26 },
          { date: "2025-01-01", amount: 1300, quantity: 26 },
          { date: "2025-02-01", amount: 1280, quantity: 25 },
          { date: "2025-03-01", amount: 1260, quantity: 25 },
          { date: "2025-04-01", amount: 1240, quantity: 25 },
          { date: "2025-05-01", amount: 1250, quantity: 25 },
        ],
      },
      {
        // ProductModel fields
        model_id: 8,
        model_name: "粉紅色",
        original_price: 50,
        promo_price: null,
        created_at: "2024-01-01T00:00:00Z",
        product_id: 4,
        data: [
          { date: "2024-11-01", amount: 1280, quantity: 25 },
          { date: "2024-12-01", amount: 1320, quantity: 26 },
          { date: "2025-01-01", amount: 1350, quantity: 27 },
          { date: "2025-02-01", amount: 1400, quantity: 28 },
          { date: "2025-03-01", amount: 1430, quantity: 28 },
          { date: "2025-04-01", amount: 1450, quantity: 29 },
          { date: "2025-05-01", amount: 1480, quantity: 29 },
        ],
      },
    ],
  },
  {
    // Product fields
    product_id: 5,
    product_name: "兒童水壺",
    listed_date: "2024-01-01",
    status: "active",
    models: [
      {
        // ProductModel fields
        model_id: 9,
        model_name: "350ml",
        original_price: 50,
        promo_price: null,
        created_at: "2024-01-01T00:00:00Z",
        product_id: 5,
        data: [
          { date: "2024-11-01", amount: 950, quantity: 19 },
          { date: "2024-12-01", amount: 1000, quantity: 20 },
          { date: "2025-01-01", amount: 980, quantity: 19 },
          { date: "2025-02-01", amount: 1020, quantity: 20 },
          { date: "2025-03-01", amount: 990, quantity: 19 },
          { date: "2025-04-01", amount: 960, quantity: 19 },
          { date: "2025-05-01", amount: 950, quantity: 19 },
        ],
      },
      {
        // ProductModel fields
        model_id: 10,
        model_name: "500ml",
        original_price: 50,
        promo_price: null,
        created_at: "2024-01-01T00:00:00Z",
        product_id: 5,
        data: [
          { date: "2024-11-01", amount: 1050, quantity: 21 },
          { date: "2024-12-01", amount: 1100, quantity: 22 },
          { date: "2025-01-01", amount: 1080, quantity: 21 },
          { date: "2025-02-01", amount: 1120, quantity: 22 },
          { date: "2025-03-01", amount: 1090, quantity: 21 },
          { date: "2025-04-01", amount: 1060, quantity: 21 },
          { date: "2025-05-01", amount: 1050, quantity: 21 },
        ],
      },
    ],
  },
  {
    // Product fields
    product_id: 6,
    product_name: "兒童帽子",
    listed_date: "2024-01-01",
    status: "active",
    models: [
      {
        // ProductModel fields
        model_id: 11,
        model_name: "藍色",
        original_price: 20,
        promo_price: null,
        created_at: "2024-01-01T00:00:00Z",
        product_id: 6,
        data: [
          { date: "2024-11-01", amount: 780, quantity: 39 },
          { date: "2024-12-01", amount: 800, quantity: 40 },
          { date: "2025-01-01", amount: 760, quantity: 38 },
          { date: "2025-02-01", amount: 790, quantity: 39 },
          { date: "2025-03-01", amount: 770, quantity: 38 },
          { date: "2025-04-01", amount: 750, quantity: 37 },
          { date: "2025-05-01", amount: 780, quantity: 39 },
        ],
      },
    ],
  },
  {
    // Product fields
    product_id: 7,
    product_name: "兒童雨靴",
    listed_date: "2024-01-01",
    status: "active",
    models: [
      {
        // ProductModel fields
        model_id: 12,
        model_name: "恐龍圖案",
        original_price: 60,
        promo_price: null,
        created_at: "2024-01-01T00:00:00Z",
        product_id: 7,
        data: [
          { date: "2024-11-01", amount: 1320, quantity: 22 },
          { date: "2024-12-01", amount: 1380, quantity: 23 },
          { date: "2025-01-01", amount: 1350, quantity: 22 },
          { date: "2025-02-01", amount: 1400, quantity: 23 },
          { date: "2025-03-01", amount: 1370, quantity: 22 },
          { date: "2025-04-01", amount: 1340, quantity: 22 },
          { date: "2025-05-01", amount: 1320, quantity: 22 },
        ],
      },
    ],
  },
];
