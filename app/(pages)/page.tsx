import { getInventoryDashboardData } from "@/actions/inventory";
import { InventoryClient } from "./_components/inventory/client";

export default async function InventoryPage() {
  const inventory = await getInventoryDashboardData();
  return <InventoryClient initialInventory={inventory} />;
}
