import { getInventoryDashboardData } from "@/actions/inventory";
import { InventoryClient } from "@/components/inventory/client";

export default async function InventoryPage() {
  const inventory = await getInventoryDashboardData();
  return <InventoryClient initialInventory={inventory} />;
}
