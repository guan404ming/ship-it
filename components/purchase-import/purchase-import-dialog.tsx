"use client";

import { useState, useEffect, FormEvent } from "react";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createPurchaseBatch } from "@/actions/purchase";
import { getSuppliers, type Supplier } from "@/actions/suppliers";
import { getProductAndModelIdByName } from "@/actions/products";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { PurchaseImportDialogProps, PurchaseItem } from "./types";
import { PurchaseHeader } from "./purchase-header";
import { ProductCard } from "./product-card";
import { PurchaseSummary } from "./purchase-summary";
import {
  updateItemField,
  updateModelField,
  addModel,
  removeModel,
  calculateExpectedDeliveryDate,
  initializeItemsFromSelection,
  validateItems,
  calculateTotalQuantity,
  calculateUniqueProductCount,
} from "./utils";

export function PurchaseImportDialog({
  trigger,
  open,
  onOpenChange,
  selectedItems = [],
}: PurchaseImportDialogProps) {
  const router = useRouter();
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState<number | null>(
    selectedItems[0]?.supplier_id ?? null
  );
  const [orderDate, setOrderDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [expectedDeliveryDays, setExpectedDeliveryDays] = useState(7);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(() =>
    calculateExpectedDeliveryDate(new Date().toISOString().split("T")[0], 7)
  );

  // Initialize items from selected inventory items
  useEffect(() => {
    if (!open) {
      setItems([
        {
          id: 1,
          product_name: "",
          models: [{ id: 1, name: "", quantity: 1 }],
        },
      ]);
      return;
    }

    setItems(initializeItemsFromSelection(selectedItems));
  }, [open, selectedItems]);

  // Fetch suppliers
  useEffect(() => {
    if (open) {
      getSuppliers()
        .then(setSuppliers)
        .catch((error) => {
          toast.error("讀取廠商列表失敗");
          console.error(error);
        });
    }
  }, [open]);

  useEffect(() => {
    if (suppliers.length > 0) {
      const defaultSupplier = suppliers.find(
        (s) => s.supplier_name === selectedItems[0]?.supplier_name
      );
      setSupplierId(defaultSupplier?.supplier_id ?? null);
    }
  }, [suppliers, selectedItems]);

  // Update expected delivery date
  useEffect(() => {
    setExpectedDeliveryDate(
      calculateExpectedDeliveryDate(orderDate, expectedDeliveryDays)
    );
  }, [orderDate, expectedDeliveryDays]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toast.error("請選擇供應商");
      return;
    }

    const validationError = validateItems(items);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const itemsForBatch = await Promise.all(
        items.flatMap((item) =>
          item.models.map(async (model) => {
            const { model_id } = await getProductAndModelIdByName(
              item.product_name,
              model.name
            );
            return {
              model_id,
              quantity: model.quantity,
              note: item.note ?? null,
            };
          })
        )
      );

      const batch = await createPurchaseBatch(
        supplierId,
        orderDate,
        expectedDeliveryDate,
        itemsForBatch
      );

      if (!batch?.batch_id) {
        throw new Error("建立叫貨批次失敗");
      }

      toast.success("叫貨單已成功建立！");
      setTimeout(() => {
        router.refresh();
        onOpenChange?.(false);
      }, 300);
    } catch (error) {
      console.error("叫貨失敗:", error);
      toast.error(
        `叫貨失敗: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  const totalQuantity = calculateTotalQuantity(items);
  const uniqueProductCount = calculateUniqueProductCount(items);

  const dialogContent = (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>新增叫貨</DialogTitle>
        <DialogDescription>
          填寫目前新增的叫貨資料，完成後將自動更新庫存數量
        </DialogDescription>
      </DialogHeader>

      <PurchaseHeader
        suppliers={suppliers}
        supplierId={supplierId}
        onSupplierChange={(value) => setSupplierId(Number(value))}
        orderDate={orderDate}
        onOrderDateChange={setOrderDate}
        expectedDeliveryDays={expectedDeliveryDays}
        onDeliveryDaysChange={setExpectedDeliveryDays}
        expectedDeliveryDate={expectedDeliveryDate}
      />

      <div className="my-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">商品明細</h3>
          <Button
            type="button"
            variant="default"
            onClick={() =>
              setItems([
                ...items,
                {
                  id: items.length + 1,
                  product_name: "",
                  models: [{ id: 1, name: "", quantity: 1 }],
                },
              ])
            }
            className="bg-[#08678C]"
            size="sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            新增商品
          </Button>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onProductNameChange={(value) =>
                setItems(updateItemField(items, item.id, "product_name", value))
              }
              onAddModel={() => setItems(addModel(items, item.id))}
              onUpdateModelName={(modelId, name) =>
                setItems(
                  updateModelField(items, item.id, modelId, "name", name)
                )
              }
              onUpdateModelQuantity={(modelId, quantity) =>
                setItems(
                  updateModelField(
                    items,
                    item.id,
                    modelId,
                    "quantity",
                    quantity
                  )
                )
              }
              onRemoveModel={(modelId) =>
                setItems(removeModel(items, item.id, modelId))
              }
              onNoteChange={(note) =>
                setItems(updateItemField(items, item.id, "note", note))
              }
              onDelete={() => setItems(items.filter((i) => i.id !== item.id))}
            />
          ))}
        </div>
      </div>

      <PurchaseSummary
        totalItems={items.length}
        totalQuantity={totalQuantity}
        uniqueProductCount={uniqueProductCount}
      />

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange?.(false)}
        >
          取消
        </Button>
        <Button type="submit" className="bg-[#08678C]">
          確認匯入
        </Button>
      </DialogFooter>
    </form>
  );

  if (open !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="sm:max-w-4xl">{dialogContent}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-4xl">{dialogContent}</DialogContent>
    </Dialog>
  );
}
