"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PurchaseDashboardRow, PurchaseFormData } from "@/lib/types";
import dayjs from "dayjs";
import { updatePurchaseItem } from "@/actions/purchase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function PurchaseEditDialog({
  purchase,
}: {
  purchase: PurchaseDashboardRow;
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PurchaseFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open && purchase) {
      setFormData({
        ...purchase,
        models: [
          {
            id: purchase.model_id,
            name: purchase.model_name || "",
            quantity: purchase.quantity || 0,
          },
        ],
      });
    }
  }, [open, purchase]);

  const handleChange = (
    field: keyof PurchaseFormData,
    value: string | number
  ) => {
    if (formData) {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  const handleModelNameChange = (name: string) => {
    if (formData) {
      setFormData({
        ...formData,
        models: [{ ...formData.models[0], name }],
        model_name: name,
      });
    }
  };

  const handleModelQuantityChange = (quantity: number) => {
    if (formData) {
      setFormData({
        ...formData,
        models: [{ ...formData.models[0], quantity }],
        quantity: quantity,
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData) {
        await updatePurchaseItem(formData);
      }

      router.refresh();
      toast.success("叫貨項目已更新");
      setOpen(false);
    } catch (error) {
      console.error("Error updating purchase item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="underline bg-transparent p-0 h-auto text-gray-500 hover:bg-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          編輯
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>編輯叫貨項目</DialogTitle>
          <DialogDescription>修改叫貨資料，完成後將自動更新</DialogDescription>
        </DialogHeader>

        {formData ? (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">廠商名稱</label>
                <Input
                  value={formData.supplier_name}
                  onChange={(e) =>
                    handleChange("supplier_name", e.target.value)
                  }
                  placeholder="輸入廠商名稱"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">商品名稱</label>
                <Input
                  value={formData.product_name}
                  onChange={(e) => handleChange("product_name", e.target.value)}
                  placeholder="輸入商品名稱"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  商品規格
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">規格名稱</label>
                    <Input
                      placeholder="輸入規格名稱"
                      value={formData.models[0].name}
                      onChange={(e) => handleModelNameChange(e.target.value)}
                      className="h-10 w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">數量</label>
                    <NumberInput
                      value={formData.models[0].quantity}
                      onChange={(value) => handleModelQuantityChange(value)}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div className="space-y-2">
                <label className="text-sm font-medium">單價</label>
                <Input
                  type="number"
                  value={
                    formData.unit_cost ? formData.unit_cost.toString() : "0"
                  }
                  onChange={(e) =>
                    handleChange("unit_cost", parseFloat(e.target.value) || 0)
                  }
                  placeholder="輸入單價"
                />
              </div> */}

              <div className="space-y-2">
                <label className="text-sm font-medium">預計到貨日</label>
                <Input
                  type="date"
                  value={dayjs(formData.expect_date).format("YYYY-MM-DD")}
                  onChange={(e) => handleChange("expect_date", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">備註</label>
              <Textarea
                value={formData.note || ""}
                onChange={(e) => handleChange("note", e.target.value)}
                placeholder="輸入備註或描述商品的相關訊息..."
                className="min-h-[100px]"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                取消
              </Button>
              <Button
                type="submit"
                className="bg-[#08678C]"
                disabled={isLoading}
              >
                {isLoading ? "處理中..." : "儲存變更"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-4 text-center">載入中...</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
