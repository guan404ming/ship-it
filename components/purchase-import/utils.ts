import { PurchaseItem, ModelItem } from "./types";

export const updateItemField = <T extends keyof PurchaseItem>(
  items: PurchaseItem[],
  itemId: number,
  field: T,
  value: PurchaseItem[T]
) => items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i));

export const updateModelField = <T extends keyof ModelItem>(
  items: PurchaseItem[],
  itemId: number,
  modelId: number,
  field: T,
  value: ModelItem[T]
) =>
  items.map((i) =>
    i.id === itemId
      ? {
          ...i,
          models: i.models.map((m) =>
            m.id === modelId ? { ...m, [field]: value } : m
          ),
        }
      : i
  );

export const addModel = (items: PurchaseItem[], itemId: number) =>
  items.map((i) =>
    i.id === itemId
      ? {
          ...i,
          models: [
            ...i.models,
            {
              id: i.models.length + 1,
              name: "",
              quantity: 1,
            },
          ],
        }
      : i
  );

export const removeModel = (
  items: PurchaseItem[],
  itemId: number,
  modelId: number
) =>
  items.map((i) =>
    i.id === itemId
      ? {
          ...i,
          models: i.models.filter((m) => m.id !== modelId),
        }
      : i
  );

export const calculateExpectedDeliveryDate = (
  orderDate: string,
  days: number
) => {
  const date = new Date(orderDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

export const createInitialItem = (): PurchaseItem => ({
  id: 1,
  product_name: "",
  models: [{ id: 1, name: "", quantity: 1 }],
});

interface SelectedItem {
  supplier_name: string;
  model_id: number;
  product_name: string;
  model_name: string;
}

export const initializeItemsFromSelection = (
  selectedItems: SelectedItem[]
): PurchaseItem[] => {
  if (selectedItems.length === 0) return [createInitialItem()];

  const groupedItems = selectedItems.reduce(
    (acc, item) => {
      const key = `${item.supplier_name}-${item.model_id}`;
      if (!acc[key]) {
        acc[key] = {
          id: Object.keys(acc).length + 1,
          product_name: item.product_name || "",
          models: [],
        };
      }
      acc[key].models.push({
        id: acc[key].models.length + 1,
        name: item.model_name || "",
        quantity: 1,
      });
      return acc;
    },
    {} as Record<string, PurchaseItem>
  );

  return Object.values(groupedItems);
};

export const validateItems = (items: PurchaseItem[]): string | null => {
  for (const item of items) {
    if (!item.product_name.trim()) {
      return `請輸入品項 ${item.id} 的商品名稱`;
    }
    if (item.models.length === 0) {
      return `請為品項 ${item.product_name} 新增規格`;
    }
    for (const model of item.models) {
      if (!model.name.trim()) {
        return `請輸入品項 ${item.product_name} 的規格 ${model.id} 的名稱`;
      }
      if (model.quantity <= 0) {
        return `品項 ${item.product_name} 的規格 ${model.name} 的數量必須大於 0`;
      }
    }
  }
  return null;
};

export const calculateTotalQuantity = (items: PurchaseItem[]) =>
  items.reduce(
    (sum, item) =>
      sum +
      item.models.reduce((modelSum, model) => modelSum + model.quantity, 0),
    0
  );

export const calculateUniqueProductCount = (items: PurchaseItem[]) =>
  new Set(items.map((item) => item.product_name).filter(Boolean)).size;
