import { getInventoryStatus, getInventoryMovements } from "@/actions/inventory";
import { InventoryClient } from "./client";

export default async function InventoryPage() {
  const [inventory, movements] = await Promise.all([
    getInventoryStatus(),
    getInventoryMovements(),
  ]);

  return (
    <InventoryClient
      initialInventory={inventory}
      initialMovements={movements}
    />
  );
}
