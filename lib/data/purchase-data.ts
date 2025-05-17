
type PurchaseOrderItem = {
  id: string;
  batch_id: string; // Changed from orderNumber to align with database
  supplier_name: string; // Changed from vendorCode to align with database
  category_name: string; // Changed from productCategory to align with database
  product_name: string; // Changed from productName to align with database
  model_name: string; // Changed from spec to align with database
  quantity: number;
  unit_cost: number; // Changed from totalPrice to align with database
  created_at: string; // Changed from orderDate to align with database
  expected_arrival: string; // Changed from expectedArrivalDate to align with database (custom field)
  note?: string;
};

export const purchaseOrderData: PurchaseOrderItem[] = [
  {
    id: "1",
    batch_id: "PO2023001",
    supplier_name: "fju3299",
    category_name: "兒童玩具",
    product_name: "拼圖",
    model_name: "長頸鹿款",
    quantity: 200,
    unit_cost: 10000,
    created_at: "2025-05-15",
    expected_arrival: "2025-05-30",
  },
  {
    id: "2",
    batch_id: "PO2023001",
    supplier_name: "fju3299",
    category_name: "兒童玩具",
    product_name: "拼圖",
    model_name: "海豚款",
    quantity: 200,
    unit_cost: 10000,
    created_at: "2025-05-15",
    expected_arrival: "2025-05-30",
  },
  {
    id: "3",
    batch_id: "PO2023001",
    supplier_name: "fju3299",
    category_name: "兒童玩具",
    product_name: "拼圖",
    model_name: "海豚款",
    quantity: 200,
    unit_cost: 10000,
    created_at: "2025-05-15",
    expected_arrival: "2025-05-30",
  },
  {
    id: "4",
    batch_id: "PO2023001",
    supplier_name: "jde2088",
    category_name: "服飾",
    product_name: "兒童外套",
    model_name: "黑色",
    quantity: 110,
    unit_cost: 5000,
    created_at: "2025-04-29",
    expected_arrival: "2025-05-10",
  },
  {
    id: "5",
    batch_id: "PO2023001",
    supplier_name: "jde2088",
    category_name: "服飾",
    product_name: "兒童外套",
    model_name: "粉色",
    quantity: 100,
    unit_cost: 6000,
    created_at: "2025-04-29",
    expected_arrival: "2025-05-10",
  },
  {
    id: "6",
    batch_id: "PO2023001",
    supplier_name: "kk7655",
    category_name: "裝飾品",
    product_name: "聖誕裝飾",
    model_name: "星星",
    quantity: 50,
    unit_cost: 2000,
    created_at: "2025-04-11",
    expected_arrival: "2025-05-10",
  },
];
