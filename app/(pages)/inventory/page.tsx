import { getInventoryStatus, getInventoryMovements } from "@/actions/inventory";
import { InventoryClient } from "./client";

export default async function InventoryPage() {
  const inventory = await getInventoryStatus();
  const movements = await getInventoryMovements();

  return (
    <InventoryClient
      initialInventory={inventory}
      initialMovements={movements}
    />
  );
}
