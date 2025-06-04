"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProductAndModelIdByName } from "@/actions/products";
import { toast } from "sonner";
import { upsertStockRecord } from "@/actions/stock_record";
import { upsertOrder } from "@/actions/orders";
import dayjs from "dayjs";
import { getSupplierIdByName } from "@/actions/suppliers";
import { createPurchaseBatch } from "@/actions/purchase";

interface Model {
  id: string;
  modelName: string;
  quantity: string;
  error: string | null;
  price: string;
  priceError: string | null;
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
  const [supplierName, setSupplierName] = React.useState<string>("");
  const [modelName, setModelName] = React.useState<string>("");
  const [modelNameError, setModelNameError] = React.useState<string | null>(
    null
  );
  const [models, setModels] = React.useState<Model[]>([]);
  const [orderId, setOrderId] = React.useState<string>("");

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

  const validateModelPrice = (id: string, value: string) => {
    const updatedModels = models.map((model) => {
      if (model.id === id) {
        let priceError: string | null = null;
        if (value) {
          const numberValue = parseFloat(value);
          if (isNaN(numberValue) || numberValue <= 0) {
            priceError = "請輸入大於0的數字";
          }
        }
        return { ...model, price: value, priceError };
      }
      return model;
    });
    setModels(updatedModels);
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
      {
        id: newId,
        modelName: trimmedModelName,
        quantity: "",
        error: null,
        price: "",
        priceError: null,
      },
    ]);
    setModelName("");
    setModelNameError(null);
  };

  const removeModel = (id: string) => {
    setModels(models.filter((model) => model.id !== id));
  };

  // Helper: validate all models
  function validateModels(type: string) {
    let hasError = false;
    const updatedModels = models.map((model) => {
      let error = model.error;
      let priceError = model.priceError;
      // Always validate quantity
      if (!model.quantity || parseInt(model.quantity, 10) <= 0) {
        error = "請輸入正整數";
        hasError = true;
      }
      // Only validate price in 'order' mode
      if (type === "order" && (!model.price || parseFloat(model.price) <= 0)) {
        priceError = "請輸入大於0的數字";
        hasError = true;
      }
      return { ...model, error, priceError };
    });
    setModels(updatedModels);
    return hasError;
  }

  // Helper: reset all input fields
  function resetForm() {
    setProductName("");
    setModelName("");
    setModels([]);
  }

  const handleSubmit = async () => {
    // 驗證商品名稱
    if (!productName.trim()) {
      toast.error("請輸入商品名稱");
      return;
    }
    // 驗證 models
    const hasError = validateModels(manualImportType || "");
    if (hasError) {
      toast.error(
        manualImportType === "order"
          ? "請檢查所有規格的數量與價格"
          : "請檢查所有規格的數量"
      );
      return;
    }
    if (supplierName.trim() === "") {
      toast.error("請輸入廠商名稱");
      return;
    }
    if (manualImportType === "order") {
      try {
        const items = await Promise.all(
          models.map(async (model) => {
            const { product_id, model_id } = await getProductAndModelIdByName(
              productName,
              model.modelName
            );
            return {
              product_id,
              model_id,
              quantity: parseInt(model.quantity, 10),
              returned_quantity: 0,
              sold_price: parseFloat(model.price),
              total_price:
                parseFloat(model.price) * parseInt(model.quantity, 10),
            };
          })
        );

        await upsertOrder({
          buyer_id: 1,
          order_id: orderId,
          product_total_price: items.reduce(
            (sum, item) => sum + item.total_price,
            0
          ),
          shipping_fee: 0,
          total_paid: items.reduce((sum, item) => sum + item.total_price, 0),
          order_status: "delivered",
          payment_time: dayjs().toISOString(),
          shipped_at: dayjs().toISOString(),
          completed_at: dayjs().toISOString(),
          items,
        });
        toast.success("成功建立訂單");
      } catch (error) {
        toast.error(`發生錯誤，請稍後再試: ${error}`);
      }
    } else {
      try {
        await Promise.all(
          models.map(async (model) => {
            const { model_id } = await getProductAndModelIdByName(
              productName,
              model.modelName
            );

            const supplier_id = await getSupplierIdByName(supplierName);
            if (supplier_id !== null) {
              await createPurchaseBatch(
                supplier_id,
                dayjs().toISOString(),
                dayjs().toISOString(),
                [{ model_id, quantity: parseInt(model.quantity, 10) }],
                "confirmed"
              );
            }

            await upsertStockRecord(
              model_id,
              true,
              parseInt(model.quantity, 10)
            );
            toast.success(
              `成功新增商品: ${productName} 規格: ${model.modelName} 數量: ${model.quantity}`
            );
          })
        );
      } catch (error) {
        toast.error(`發生錯誤，請稍後再試: ${error}`);
      }
    }
    resetForm();
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
                id="order"
                name="import-type-right"
                value="order"
                className="h-4 w-4"
                onChange={onManualImportTypeChange}
                checked={manualImportType === "order"}
              />
              <Label htmlFor="order" className="ml-2">
                銷售匯入
              </Label>
            </div>
            <div className="flex items-center">
              <Input
                type="radio"
                id="inventory"
                name="import-type-right"
                value="inventory"
                className="h-4 w-4"
                onChange={onManualImportTypeChange}
                checked={manualImportType === "inventory"}
              />
              <Label htmlFor="inventory" className="ml-2">
                庫存匯入
              </Label>
            </div>
          </div>

          <div className="grid gap-3">
            {manualImportType === "order" && (
              <div className="grid gap-1.5">
                <Label htmlFor="order-id">訂單編號</Label>
                <Input
                  id="order-id"
                  placeholder="請輸入訂單編號 (選填，若有訂單編號可填寫，否則系統會自動生成)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
            )}
            {manualImportType === "inventory" && (
              <div className="grid gap-1.5">
                <Label htmlFor="supplier-name">廠商名稱</Label>
                <Input
                  id="supplier-name"
                  placeholder="請輸入廠商名稱"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                />
              </div>
            )}
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
                  <div className="grid grid-cols-7 gap-2 text-sm text-muted-foreground font-medium">
                    <div className="col-span-2">規格名稱</div>
                    <div className="col-span-2">數量</div>
                    <div
                      className="col-span-2"
                      hidden={manualImportType !== "order"}
                    >
                      價格
                    </div>
                    <div className="col-span-1 text-center" />
                  </div>

                  {models.map((model) => (
                    <div
                      key={model.id}
                      className="grid grid-cols-7 gap-2 items-center"
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
                      <div className="col-span-2">
                        {manualImportType === "order" && (
                          <>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="價格"
                              value={model.price}
                              onChange={(e) =>
                                validateModelPrice(model.id, e.target.value)
                              }
                              className={
                                model.priceError ? "border-red-500" : ""
                              }
                            />
                            {model.priceError && (
                              <p className="text-sm text-red-500 mt-1">
                                {model.priceError}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <div className="col-span-1 flex justify-center">
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
          </div>

          <Button className="w-full" type="submit" onClick={handleSubmit}>
            確認輸入
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
