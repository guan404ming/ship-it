import { getInventoryStatus } from "@/actions/inventory";
import { InventoryClient } from "./client";

export default async function InventoryPage() {
  const inventory = await getInventoryStatus();

  return <InventoryClient initialInventory={inventory} />;
}
