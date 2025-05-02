"use client";

import * as React from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";

export default function PurchaseImportPage() {
  const router = useRouter();
  const [orderItems, setOrderItems] = React.useState<{ id: number; isVisible: boolean; quantity: number; price: number | undefined }[]>([
    { id: 1, isVisible: true, quantity: 50, price: undefined },
    { id: 2, isVisible: true, quantity: 50, price: undefined },
  ]);
  const [totalItems, setTotalItems] = React.useState(2);
  const [totalQuantity, setTotalQuantity] = React.useState(100);

  const addNewItem = () => {
    // 當商品列表為空時，從1開始；否則使用最大ID + 1
    const newId = orderItems.length === 0 
      ? 1 
      : Math.max(...orderItems.map(item => item.id)) + 1;
      
    setOrderItems([...orderItems, { id: newId, isVisible: true, quantity: 0, price: undefined }]);
    setTotalItems(totalItems + 1);
  };

  const deleteItem = (id: number) => {
    const itemToDelete = orderItems.find(item => item.id === id);
    const deletedQuantity = itemToDelete?.quantity || 0;

    setOrderItems(orderItems.filter(item => item.id !== id));
    setTotalItems(totalItems - 1);
    setTotalQuantity(totalQuantity - deletedQuantity);
  };

  const handleCancel = () => {
    router.push("/purchase-temp");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/purchase-temp");
  };

  const handleQuantityChange = (id: number, value: number) => {
    const currentItem = orderItems.find(item => item.id === id);
    const currentQuantity = currentItem?.quantity || 0;
    const difference = value - currentQuantity;

    setOrderItems(orderItems.map(item =>
      item.id === id ? { ...item, quantity: value } : item
    ));
    setTotalQuantity(totalQuantity + difference);
  };

  const handlePriceChange = (id: number, value: number) => {
    setOrderItems(orderItems.map(item =>
      item.id === id ? { ...item, price: value } : item
    ));
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex items-center px-4 lg:px-6">
                <h1 className="text-3xl font-semibold">叫貨匯入</h1>
              </div>

              <form onSubmit={handleSubmit} className="px-4 lg:px-6">
                <div className="rounded-lg border bg-background p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
                    <div>
                      <label className="text-sm font-medium mb-2 block">廠商名稱</label>
                      <Input placeholder="輸入訂單名稱" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">叫貨日期</label>
                      <Input type="date" placeholder="yyyy/mm/dd" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">預計到貨日</label>
                      <Input type="date" placeholder="yyyy/mm/dd" />
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">商品明細</h2>
                      <Button
                        type="button"
                        variant="default"
                        onClick={addNewItem}
                        className="bg-[#08678C]"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        新增商品
                      </Button>
                    </div>

                    <div className="space-y-8">
                      {orderItems.map((item) => (
                        <Card key={item.id} className="relative p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">商品 #{item.id}</h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteItem(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              刪除
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">商品名稱</label>
                              <Input placeholder="輸入商品名稱" />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">規格名稱</label>
                              <Input placeholder="輸入規格名稱" />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">叫貨數量</label>
                              <NumberInput
                                value={item.quantity}
                                onChange={(value) => handleQuantityChange(item.id, value)}
                                min={0}
                                step={1}
                                placeholder="輸入叫貨數量"
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">總價格</label>
                              <NumberInput
                                value={item.price}
                                onChange={(value) => handlePriceChange(item.id, value)}
                                min={0}
                                step={10}
                                formatOptions={{ style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }}
                                placeholder="輸入總價格"
                                controls={false}
                                className="w-full"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">備註</label>
                            <Textarea
                              placeholder="輸入備註或描述商品的相關信息..."
                              className="min-h-[100px]"
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-md mb-8">
                    <div className="flex flex-col md:flex-row md:justify-between">
                      <div className="mb-2 md:mb-0">
                        <span className="text-sm text-muted-foreground">總商品數量</span>
                        <p className="text-xl font-bold">{totalItems} 項商品</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">總叫貨數量</span>
                        <p className="text-xl font-bold">{totalQuantity} 件</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      取消
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#08678C]"
                    >
                      確認匯入
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}