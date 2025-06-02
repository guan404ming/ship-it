import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import { ProductCardProps } from "./types";
import { ModelRow } from "./model-row";

export const ProductCard = ({
  item,
  onProductNameChange,
  onAddModel,
  onUpdateModelName,
  onUpdateModelQuantity,
  onRemoveModel,
  onNoteChange,
  onDelete,
}: ProductCardProps) => {
  return (
    <Card className="relative p-4">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-row justify-between gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">商品名稱</label>
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
                    {item.models.length} 種規格，共{" "}
                    {item.models.reduce(
                      (sum, model) => sum + model.quantity,
                      0
                    )}{" "}
                    件
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
          <label className="text-sm font-medium mb-2 block">商品規格</label>

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
                    onQuantityChange={(quantity) =>
                      onUpdateModelQuantity(model.id, quantity)
                    }
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
        <label className="text-sm font-medium mb-2 block">備註</label>
        <Textarea
          placeholder="輸入備註或描述商品的相關訊息..."
          className="min-h-[80px]"
          value={item.note}
          onChange={(e) => onNoteChange(e.target.value)}
        />
      </div>
    </Card>
  );
};
