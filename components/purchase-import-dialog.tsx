"use client";

import * as React from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";
import { Textarea } from "@/components/ui/textarea";
import { createPurchaseBatch, addPurchaseItem } from "@/actions/purchase";
import { ModelItem, StockRecordWithModel } from "@/lib/types";

// Local interface - different from database PurchaseItem
interface PurchaseItem {
  id: number;
  isVisible: boolean;
  product_name: string;
  quantity: number;
  model_id?: number;
  product_id?: number;
  models: ModelItem[]; 
  note?: string;
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PurchaseImportDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  selectedItems?: StockRecordWithModel[];
}

type ModelRowProps = {
  model: ModelItem;
  onNameChange: (name: string) => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

const ModelRow = ({ model, onNameChange, onQuantityChange, onRemove }: ModelRowProps) => (
  <div className="grid grid-cols-12 gap-4 p-2 items-center">
    <div className="col-span-6">
      <Input 
        placeholder="輸入規格名稱" 
        value={model.name}
        onChange={(e) => onNameChange(e.target.value)}
        className="h-10 w-full"
      />
    </div>
    <div className="col-span-4">
      <NumberInput
        value={model.quantity}
        onChange={(value) => onQuantityChange(value)}
        min={1}
        step={1}
        className="w-full"
      />
    </div>
    <div className="col-span-2 text-right">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

type ProductCardProps = {
  item: PurchaseItem;
  onProductNameChange: (value: string) => void;
  onAddModel: () => void;
  onUpdateModelName: (modelId: number, name: string) => void;
  onUpdateModelQuantity: (modelId: number, quantity: number) => void;
  onRemoveModel: (modelId: number) => void;
  onDelete: () => void;
};

const ProductCard = ({ 
  item, 
  onProductNameChange, 
  onAddModel, 
  onUpdateModelName, 
  onUpdateModelQuantity,
  onRemoveModel,
  onDelete 
}: ProductCardProps) => {
  return (
    <Card className="relative p-4">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-row justify-between gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              商品名稱
            </label>
            <div className="flex flex-row items-center gap-4">
              <Input 
                placeholder="輸入商品名稱" 
                className="w-100"
                value={item.product_name}
                onChange={(e) => onProductNameChange(e.target.value)}
              />
              {item.models.length > 0 && (
                <div className="mt-1">
                  <p className="text-xs text-blue-600">
                    {item.models.length} 種規格，共 {item.models.reduce((sum, model) => sum + model.quantity, 0)} 件
                  </p>
                </div>
              )}
            </div>
          </div>
          <div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              刪除
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            商品規格
          </label>
          
          <div className="border rounded-md overflow-hidden mb-2">
            <div className="grid grid-cols-12 gap-4 bg-muted p-2 text-sm font-medium">
              <div className="col-span-6">規格名稱</div>
              <div className="col-span-4">數量</div>
              <div className="col-span-2 text-right">操作</div>
            </div>
            
            {item.models.length > 0 ? (
              <div className="divide-y">
                {item.models.map((model) => (
                  <ModelRow
                    key={model.id}
                    model={model}
                    onNameChange={(name) => onUpdateModelName(model.id, name)}
                    onQuantityChange={(quantity) => onUpdateModelQuantity(model.id, quantity)}
                    onRemove={() => onRemoveModel(model.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                尚未添加規格，請點擊下方按鈕添加
              </div>
            )}
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddModel}
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            新增規格
          </Button>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">
          備註
        </label>
        <Textarea
          placeholder="輸入備註或描述商品的相關訊息..."
          className="min-h-[80px]"
        />
      </div>
    </Card>
  );
};

export function PurchaseImportDialog({
  trigger,
  open,
  onOpenChange,
  selectedItems = [],
}: PurchaseImportDialogProps) {
  const router = useRouter();
  const [orderItems, setOrderItems] = React.useState<PurchaseItem[]>([
    { id: 1, isVisible: true, product_name: "", quantity: 50, models: [{ id: 1, name: "", quantity: 1 }] },
    { id: 2, isVisible: true, product_name: "", quantity: 50, models: [{ id: 1, name: "", quantity: 1 }] },
  ]);
  const [totalItems, setTotalItems] = React.useState(2);
  const [totalQuantity, setTotalQuantity] = React.useState(100);
  const [supplierId, setSupplierId] = React.useState<number | null>(null);
  const [orderDate, setOrderDate] = React.useState<string>(() => {
    // Set default order date to today
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  const [expectedDeliveryDays, setExpectedDeliveryDays] = React.useState<number>(7); // Default to 7 days
  const [expectedDeliveryDate, setExpectedDeliveryDate] = React.useState<string>(() => {
    // Calculate default expected delivery date (7 days from today)
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  
  // Use a ref to track if we've already processed the selected items to prevent infinite loops
  const processedRef = React.useRef(false);
  const selectedItemsRef = React.useRef(selectedItems);
  
  // Store selectedItems in a ref to avoid dependency issues
  React.useEffect(() => {
    selectedItemsRef.current = selectedItems;
  }, [selectedItems]);
  
  // Initialize order items from selected inventory items when the dialog opens
  React.useEffect(() => {
    // Reset the ref when dialog opens/closes
    if (!open) {
      processedRef.current = false;
      
      // Reset if dialog closes
      setOrderItems([
        { id: 1, isVisible: true, product_name: "", quantity: 50, models: [{ id: 1, name: "", quantity: 1 }] },
        { id: 2, isVisible: true, product_name: "", quantity: 50, models: [{ id: 1, name: "", quantity: 1 }] },
      ]);
      setTotalItems(2);
      return;
    }
    
    // Only process selected items once when dialog opens
    const items = selectedItemsRef.current;
    if (open && items && items.length > 0 && !processedRef.current) {
      processedRef.current = true;
      
      // Group items by product to group same products with different models
      const groupedByProduct: Record<string, StockRecordWithModel[]> = {};
      
      items.forEach(item => {
        const productId = item.product_models.product_id?.toString() || '';
        if (!groupedByProduct[productId]) {
          groupedByProduct[productId] = [];
        }
        groupedByProduct[productId].push(item);
      });
      
      // Convert grouped items to purchase items
      const initialItems: PurchaseItem[] = Object.entries(groupedByProduct).map(([productId, items], index) => {
        // Get first item for product name
        const firstItem = items[0];
        const productName = firstItem.product_models.products.product_name || '';
        
        // Convert each variant to a model
        const models: ModelItem[] = items.map((item, modelIndex) => ({
          id: modelIndex + 1,
          name: item.product_models.model_name || '',
          quantity: 1 // Suggest order quantity based on current stock
        }));
        
        return {
          id: index + 1,
          isVisible: true,
          product_name: productName,
          quantity: models.reduce((sum, model) => sum + model.quantity, 0),
          product_id: Number(productId),
          models,
        };
      });
      
      if (initialItems.length > 0) {
        setOrderItems(initialItems);
        setTotalItems(initialItems.length);
      }
    }
  }, [open]);

  // Calculate total quantity whenever orderItems changes
  React.useEffect(() => {
    // Use a comparison to prevent unnecessary state updates that could cause infinite loops
    const newTotalQuantity = orderItems.reduce(
      (sum, item) => sum + item.models.reduce((modelSum, model) => modelSum + model.quantity, 0), 
      0
    );
    
    if (newTotalQuantity !== totalQuantity) {
      setTotalQuantity(newTotalQuantity);
    }
  }, [orderItems, totalQuantity]);

  // Update expected delivery date when order date or expected delivery days change
  React.useEffect(() => {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + expectedDeliveryDays);
    setExpectedDeliveryDate(date.toISOString().split('T')[0]);
  }, [orderDate, expectedDeliveryDays]);
  
  const addNewItem = () => {
    const newId = orderItems.length === 0
      ? 1 
      : Math.max(...orderItems.map((item) => item.id)) + 1;

    setOrderItems([
      ...orderItems,
      { 
        id: newId, 
        isVisible: true, 
        product_name: "", 
        quantity: 0, 
        models: [{ id: 1, name: "", quantity: 1 }], // 預設一個規格
      },
    ]);
    setTotalItems(totalItems + 1);
  };

  const deleteItem = (id: number) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
    setTotalItems(totalItems - 1);
  };
  const handleProductNameChange = (id: number, value: string) => {
    setOrderItems(
      orderItems.map((item) =>
        item.id === id ? { ...item, product_name: value } : item
      )
    );
  };

  const addModelToProduct = (productId: number, modelName: string = "") => {
    setOrderItems(
      orderItems.map(item => {
        if (item.id === productId) {
          const newModelId = item.models.length > 0
            ? Math.max(...item.models.map(model => model.id)) + 1
            : 1;
            
          return {
            ...item,
            models: [...item.models, {
              id: newModelId,
              name: modelName,
              quantity: 1
            }]
          };
        }
        return item;
      })
    );
  };

  const updateModelName = (productId: number, modelId: number, name: string) => {
    setOrderItems(
      orderItems.map(item => {
        if (item.id === productId) {
          return {
            ...item,
            models: item.models.map(model => 
              model.id === modelId ? { ...model, name } : model
            )
          };
        }
        return item;
      })
    );
  };

  const updateModelQuantity = (productId: number, modelId: number, quantity: number) => {
    setOrderItems(
      orderItems.map(item => {
        if (item.id === productId) {
          return {
            ...item,
            models: item.models.map(model => 
              model.id === modelId ? { ...model, quantity } : model
            )
          };
        }
        return item;
      })
    );
  };

  const removeModel = (productId: number, modelId: number) => {
    setOrderItems(
      orderItems.map(item => {
        if (item.id === productId) {
          if (item.models.length <= 1) {
            return item;
          }
          return {
            ...item,
            models: item.models.filter(model => model.id !== modelId)
          };
        }
        return item;
      })
    );
  };

  const handleCancel = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 驗證
    if (!supplierId) {
      alert("請選擇供應商");
      return;
    }
    
    if (orderItems.some(item => !item.product_name)) {
      alert("請確保所有商品都填寫了商品名稱");
      return;
    }
    
    if (orderItems.some(item => item.models.length === 0)) {
      alert("每個商品至少需要添加一個規格");
      return;
    }
    
    if (orderItems.some(item => item.models.some(model => !model.name.trim()))) {
      alert("請確保所有規格都有名稱");
      return;
    }

    const hasDuplicateModels = orderItems.some(item => {
      const modelNames = new Set<string>();
      for (const model of item.models) {
        if (modelNames.has(model.name)) {
          return true;
        }
        modelNames.add(model.name);
      }
      return false;
    });
    
    if (hasDuplicateModels) {
      alert("同一個商品不能有重複的規格名稱，請修改後再提交");
      return;
    }

    try {
      // Include order date and expected delivery date in the batch creation
      const batch = await createPurchaseBatch(supplierId, orderDate, expectedDeliveryDate);
      
      for (const item of orderItems) {
        console.log(`Processing product: ${item.product_name} with ${item.models.length} models`);
        
        for (const model of item.models) {
          const modelId = Math.floor(Math.random() * 10000); // 模擬生成 modelId
          console.log(`Adding model: ${model.name}, quantity: ${model.quantity}`);
          
          await addPurchaseItem(
            batch.batch_id,
            modelId,
            model.quantity,
            0 // 不再使用價格欄位，設為 0
          );
        }
      }
      
      if (onOpenChange) {
        onOpenChange(false);
      }
      router.refresh();
    } catch (error) {
      console.error("Error creating purchase batch:", error);
      alert("創建採購批次時發生錯誤");
    }
  };

  const getUniqueProductCount = () => {
    return new Set(
      orderItems.map((item) => item.product_name).filter(name => name !== "")
    ).size;
  };

  const dialogContent = (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>新增叫貨</DialogTitle>
        <DialogDescription>
          填寫目前新增的叫貨資料，完成後將自動更新庫存數量
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 my-6">
        <div>
          <label className="text-sm font-medium mb-2 block">
            廠商名稱
          </label>
          <Input
            placeholder="輸入廠商名稱"
            onChange={(e) => setSupplierId(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            叫貨日期
          </label>
          <Input 
            type="date" 
            placeholder="yyyy/mm/dd" 
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            預計到貨天數
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={expectedDeliveryDays}
              onChange={(e) => setExpectedDeliveryDays(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">天後</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            預計到貨日期：{expectedDeliveryDate}
          </p>
        </div>
      </div>
      <div className="my-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">商品明細</h3>
          <Button
            type="button"
            variant="default"
            onClick={addNewItem}
            className="bg-[#08678C]"
            size="sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            新增商品
          </Button>
        </div>

        <div className="space-y-4">
          {orderItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onProductNameChange={(value) => handleProductNameChange(item.id, value)}
              onAddModel={() => addModelToProduct(item.id, "")}
              onUpdateModelName={(modelId, name) => updateModelName(item.id, modelId, name)}
              onUpdateModelQuantity={(modelId, quantity) => updateModelQuantity(item.id, modelId, quantity)}
              onRemoveModel={(modelId) => removeModel(item.id, modelId)}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
        </div>
      </div>

      <div className="bg-muted p-4 rounded-md my-6">
        <div className="flex flex-col md:flex-row gap-8 justify-end">
          <div className="mb-2 md:mb-0">
            <span className="text-sm text-muted-foreground">
              總商品數量
            </span>
            <p className="text-xl font-bold">
              {totalItems} 項商品
              {getUniqueProductCount() > 0 && getUniqueProductCount() < totalItems && (
                <span className="ml-2 text-sm text-blue-600">
                  ({getUniqueProductCount()} 種不同商品)
                </span>
              )}
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">
              總叫貨數量
            </span>
            <p className="text-xl font-bold">{totalQuantity} 件</p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
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
