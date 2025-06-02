import { ReactNode } from "react";
import { InventoryDashboardRow } from "@/lib/types";

export interface PurchaseItem {
  id: number;
  product_name: string;
  models: ModelItem[];
  note?: string;
}

export interface ModelItem {
  id: number;
  name: string;
  quantity: number;
}

export interface PurchaseImportDialogProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  selectedItems?: InventoryDashboardRow[];
}

export interface ModelRowProps {
  model: ModelItem;
  onNameChange: (name: string) => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export interface ProductCardProps {
  item: PurchaseItem;
  onProductNameChange: (value: string) => void;
  onAddModel: () => void;
  onUpdateModelName: (modelId: number, name: string) => void;
  onUpdateModelQuantity: (modelId: number, quantity: number) => void;
  onRemoveModel: (modelId: number) => void;
  onNoteChange: (value: string) => void;
  onDelete: () => void;
}
