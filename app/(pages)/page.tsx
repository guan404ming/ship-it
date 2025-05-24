// TODO: 前端需要從後端獲取庫存資料
import { mockInventoryData } from "@/lib/data/inventory-data";
import { InventoryClient } from "./client";

export default async function InventoryPage() {
  // const inventory = await getInventoryStatus(); 前端先用假資料處理，後端根據假資料做調整後再接入
  return <InventoryClient initialInventory={mockInventoryData} />;

}
