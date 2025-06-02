"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProductAndModelIdByName } from "@/actions/products";
import { toast } from "sonner";
import { upsertStockRecord } from "@/actions/stock_record";

interface Model {
  id: string;
  modelName: string;
  quantity: string;
  error: string | null;
}

interface ManualInputSectionProps {
  manualImportType: string | null;
  onManualImportTypeChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export function ManualInputSection({
  manualImportType,
  onManualImportTypeChange,
}: ManualInputSectionProps) {
  const [productName, setProductName] = React.useState<string>("");
  const [modelName, setModelName] = React.useState<string>("");
  const [modelNameError, setModelNameError] = React.useState<string | null>(
    null
  );
  const [price, setPrice] = React.useState<string>("");
  const [priceError, setPriceError] = React.useState<string | null>(null);
  const [models, setModels] = React.useState<Model[]>([]);

  const validateModelQuantity = (id: string, value: string) => {
    const updatedModels = models.map((model) => {
      if (model.id === id) {
        let error: string | null = null;
        if (value) {
          const numberValue = parseInt(value, 10);
          if (
            isNaN(numberValue) ||
            !Number.isInteger(numberValue) ||
            numberValue <= 0 ||
            value.includes(".")
          ) {
            error = "請輸入正整數";
          }
        }
        return { ...model, quantity: value, error };
      }
      return model;
    });
    setModels(updatedModels);
  };

  const validatePrice = (value: string) => {
    setPrice(value);

    if (!value) {
      setPriceError(null);
      return;
    }

    const numberValue = parseFloat(value);
    if (isNaN(numberValue) || numberValue <= 0) {
      setPriceError("請輸入大於0的數字");
    } else {
      setPriceError(null);
    }
  };

  const addModel = () => {
    if (!modelName.trim()) return;

    const trimmedModelName = modelName.trim();
    const isDuplicate = models.some(
      (model) =>
        model.modelName.toLowerCase() === trimmedModelName.toLowerCase()
    );

    if (isDuplicate) {
      setModelNameError("此規格名稱已存在");
      return;
    }

    const newId = `model-${Date.now()}`;
    setModels([
      ...models,
      { id: newId, modelName: trimmedModelName, quantity: "", error: null },
    ]);
    setModelName("");
    setModelNameError(null);
  };

  const removeModel = (id: string) => {
    setModels(models.filter((model) => model.id !== id));
  };

  const handleSubmit = async () => {
    try {
      await Promise.all(
        models.map(async (model) => {
          const { model_id } = await getProductAndModelIdByName(
            productName,
            model.modelName
          );

          await upsertStockRecord(model_id, true, parseInt(model.quantity, 10));

          toast.success(
            `成功新增商品: ${productName} 規格: ${model.modelName} 數量: ${model.quantity}`
          );
        })
      );
    } catch (error) {
      toast.error(`發生錯誤，請稍後再試: ${error}`);
    }

    setProductName("");
    setModelName("");
    setModels([]);
    setPrice("");
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="pt-3">
        <h3 className="text-xl font-medium mb-2">手動輸入</h3>
        <div className="flex flex-col justify-between gap-4">
          <div className="flex gap-2 mb-2">
            <div className="flex items-center">
              <Input
                type="radio"
                id="batch-manual"
                name="import-type-right"
                value="batch"
                className="h-4 w-4"
                onChange={onManualImportTypeChange}
                checked={manualImportType === "batch"}
              />
              <Label htmlFor="batch-manual" className="ml-2">
                銷售匯入
              </Label>
            </div>
            <div className="flex items-center">
              <Input
                type="radio"
                id="single-manual"
                name="import-type-right"
                value="single"
                className="h-4 w-4"
                onChange={onManualImportTypeChange}
                checked={manualImportType === "single"}
              />
              <Label htmlFor="single-manual" className="ml-2">
                庫存匯入
              </Label>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="item-name">商品名稱</Label>
              <Input
                id="item-name"
                placeholder="請輸入商品名稱"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="item-name">商品規格</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="請輸入規格名稱"
                    value={modelName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setModelName(value);

                      const trimmedValue = value.trim();
                      if (trimmedValue) {
                        const isDuplicate = models.some(
                          (model) =>
                            model.modelName.toLowerCase() ===
                            trimmedValue.toLowerCase()
                        );
                        setModelNameError(
                          isDuplicate ? "此規格名稱已存在" : null
                        );
                      } else {
                        setModelNameError(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        modelName.trim() &&
                        !modelNameError
                      ) {
                        e.preventDefault();
                        addModel();
                      }
                    }}
                    className={modelNameError ? "border-red-500" : ""}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addModel}
                  disabled={!modelName.trim() || modelNameError !== null}
                >
                  新增規格
                </Button>
              </div>
              {modelNameError && (
                <p className="text-sm text-red-500">{modelNameError}</p>
              )}
            </div>

            <div className="rounded-lg border p-4">
              {models.length > 0 && (
                <div className="space-y-3 mt-2">
                  <div className="grid grid-cols-5 gap-2 text-sm text-muted-foreground font-medium">
                    <div className="col-span-2">規格名稱</div>
                    <div className="col-span-2">數量</div>
                  </div>

                  {models.map((model) => (
                    <div
                      key={model.id}
                      className="grid grid-cols-5 gap-2 items-center"
                    >
                      <div className="col-span-2 text-sm">
                        {model.modelName}
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          placeholder="數量"
                          value={model.quantity}
                          onChange={(e) =>
                            validateModelQuantity(model.id, e.target.value)
                          }
                          className={model.error ? "border-red-500" : ""}
                        />
                        {model.error && (
                          <p className="text-sm text-red-500 mt-1">
                            {model.error}
                          </p>
                        )}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeModel(model.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {models.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-3">
                  尚未新增任何規格
                </p>
              )}
            </div>

            {manualImportType !== "single" && (
              <div className="grid gap-1.5">
                <Label htmlFor="price">價格</Label>
                <Input
                  id="price"
                  placeholder="請輸入價格"
                  className={priceError ? "border-red-500" : ""}
                  value={price}
                  onChange={(e) => validatePrice(e.target.value)}
                />
                {priceError && (
                  <p className="text-sm text-red-500">{priceError}</p>
                )}
              </div>
            )}
          </div>

          <Button className="w-full" type="submit" onClick={handleSubmit}>
            確認輸入
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
