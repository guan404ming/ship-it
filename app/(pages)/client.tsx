"use client";

import * as React from "react";
import { BoxIcon, FileUp, PackageIcon, Search, ShoppingCart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { StockRecordWithModel } from "@/lib/types";
import { PurchaseImportDialog } from "@/components/purchase-import-dialog";

interface InventoryClientProps {
  initialInventory: StockRecordWithModel[];
  // TODO: Implement inventory movements history view
  // initialMovements: InventoryMovementWithModel[];
}

export function InventoryClient({ initialInventory }: InventoryClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [stockStatusFilter, setStockStatusFilter] = React.useState<string>("所有狀態");
  const [orderStatusFilter, setOrderStatusFilter] = React.useState<string>("所有狀態");
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof StockRecordWithModel | null;
    direction: "ascending" | "descending" | null;
  }>({
    key: null,
    direction: null,
  });
  const [selectedItems, setSelectedItems] = React.useState<Set<number>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const handleInventoryImport = () => {
    router.push("/upload?type=inventory");
  };

  const totalItems = initialInventory.length;
  const lowStockItems = initialInventory.filter(
    (item) => (item.remaining_days ?? 0) < 7
  ).length;

  // 修改過濾處理邏輯以支持切換按鈕
  const handleStockStatusFilter = (status: string) => {
    setStockStatusFilter(stockStatusFilter === status ? "所有狀態" : status);
  };

  const handleOrderStatusFilter = (status: string) => {
    setOrderStatusFilter(orderStatusFilter === status ? "所有狀態" : status);
  };

  // 清除所有篩選條件
  const clearAllFilters = () => {
    setSearchQuery("");
    setStockStatusFilter("所有狀態");
    setOrderStatusFilter("所有狀態");
  };

  const requestSort = (key: keyof StockRecordWithModel) => {
    let direction: "ascending" | "descending" | null = "ascending";

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    } else if (
      sortConfig.key === key &&
      sortConfig.direction === "descending"
    ) {
      direction = null;
    }

    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = React.useMemo(() => {
    let filteredData = [...initialInventory].map(item => ({
      ...item,
      supplier_name: item.supplier_name || "廠商" + (item.model_id % 5 + 1),
      remaining_days: item.remaining_days || Math.floor(Math.random() * 20) + 1,
      is_ordered: item.is_ordered !== undefined ? item.is_ordered : Math.random() > 0.5
    }));

    if (searchQuery) {
      filteredData = filteredData.filter(
        (item) =>
          item.supplier_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.product_models.products.product_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.product_models.model_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    if (stockStatusFilter !== "所有狀態") {
      filteredData = filteredData.filter((item) => {
        if (stockStatusFilter === "警告") return (item.remaining_days ?? 0) < 7;
        if (stockStatusFilter === "充足") return (item.remaining_days ?? 0) >= 7;
        return true;
      });
    }

    if (orderStatusFilter !== "所有狀態") {
      filteredData = filteredData.filter((item) => {
        if (orderStatusFilter === "已叫貨") return item.is_ordered === true;
        if (orderStatusFilter === "未叫貨") return item.is_ordered === false;
        return true;
      });
    }

    if (sortConfig.key && sortConfig.direction) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof StockRecordWithModel];
        const bValue = b[sortConfig.key as keyof StockRecordWithModel];

        if (aValue !== undefined && bValue !== undefined) {
          const aCompare = aValue ?? 0;
          const bCompare = bValue ?? 0;
          if (aCompare < bCompare) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (aCompare > bCompare) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
        }
        return 0;
      });
    }

    return filteredData;
  }, [searchQuery, stockStatusFilter, orderStatusFilter, sortConfig, initialInventory]);

  // Handle item selection
  const toggleItemSelection = (modelId: number) => {
    setSelectedItems(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(modelId)) {
        newSelected.delete(modelId);
      } else {
        newSelected.add(modelId);
      }
      return newSelected;
    });
  };

  // Select/deselect all items
  const toggleSelectAll = () => {
    if (selectedItems.size === filteredAndSortedData.length) {
      // If all items are selected, deselect all
      setSelectedItems(new Set());
    } else {
      // Otherwise select all filtered items
      const allModelIds = filteredAndSortedData.map(item => item.model_id);
      setSelectedItems(new Set(allModelIds));
    }
  };

  // Get selected items data
  const getSelectedItemsData = () => {
    return filteredAndSortedData.filter(item => selectedItems.has(item.model_id));
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    // Placeholder for future implementation
    console.log("以下項目將被刪除:", getSelectedItemsData());
    alert(`已選擇 ${selectedItems.size} 個項目準備刪除`);
    // Here you would implement the actual delete logic
    // and then clear the selection
    setSelectedItems(new Set());
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
              {/* 頁面標題和操作按鈕 */}
              <div className="flex items-center justify-between px-4 lg:px-6">
                <h1 className="text-3xl font-semibold">我的庫存</h1>
                <div className="flex gap-3">
                  <Button
                    onClick={handleInventoryImport}
                    variant="default"
                    size="sm"
                    className="h-10 px-4"
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    庫存匯入
                  </Button>
                </div>
              </div>

              {/* 庫存指標卡 */}
              <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6">
                {/* 總庫存項目卡片 */}
                <Card className="border shadow-sm">
                  <CardContent className="flex items-center p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#08678C]/10">
                      <BoxIcon className="h-6 w-6 text-[#08678C]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-muted-foreground">
                        總庫存項目
                      </p>
                      <h2 className="text-3xl font-bold text-[#08678C]">
                        {totalItems}
                      </h2>
                    </div>
                  </CardContent>
                </Card>

                {/* 低庫存項目卡片 */}
                <Card className="border shadow-sm">
                  <CardContent className="flex items-center p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F27F3D]/10">
                      <PackageIcon className="h-6 w-6 text-[#F27F3D]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-muted-foreground">
                        低庫存項目
                      </p>
                      <h2 className="text-3xl font-bold text-[#F27F3D]">
                        {lowStockItems}
                      </h2>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 搜索和篩選區域 */}
              <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center lg:px-6">
                <div className="flex items-center flex-1">
                  <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜尋項目..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-sm h-10"
                  />
                  
                  {/* 當有選擇項目時顯示的操作按鈕 */}
                  {selectedItems.size > 0 && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-[#08678C]"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        一鍵叫貨 ({selectedItems.size})
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        刪除
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 items-end">
                  {/* 清除篩選按鈕 */}
                  {(searchQuery ||
                    stockStatusFilter !== "所有狀態" ||
                    orderStatusFilter !== "所有狀態") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-8 ml-2 border border-gray-300"
                    >
                      清除篩選
                    </Button>
                  )}

                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground px-1">庫存狀態</span>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      value={stockStatusFilter}
                      onValueChange={(value) => setStockStatusFilter(value || "所有狀態")}
                      className="justify-start"
                    >
                      <ToggleGroupItem 
                        value="充足"
                        size="sm"
                        className={
                          stockStatusFilter === "充足" 
                            ? "bg-gray-50 text-gray-600 border-gray-200" 
                            : ""
                        }
                      >
                        充足
                      </ToggleGroupItem>
                      <ToggleGroupItem 
                        value="警告"
                        size="sm"
                        className={
                          stockStatusFilter === "警告" 
                            ? "bg-gray-50 text-gray-600 border-gray-200"  
                            : ""
                        }
                      >
                        警告
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground px-1">叫貨狀態</span>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      value={orderStatusFilter}
                      onValueChange={(value) => setOrderStatusFilter(value || "所有狀態")}
                      className="justify-start"
                    >
                      <ToggleGroupItem 
                        value="已叫貨"
                        size="sm"
                        className={
                          orderStatusFilter === "已叫貨" 
                            ? "bg-gray-50 text-gray-600 border-gray-200" 
                            : ""
                        }
                      >
                        已叫貨
                      </ToggleGroupItem>
                      <ToggleGroupItem 
                        value="未叫貨"
                        size="sm"
                        className={
                          orderStatusFilter === "未叫貨" 
                            ? "bg-gray-50 text-gray-600 border-gray-200" 
                            : ""
                        }
                      >
                        未叫貨
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  

                </div>
              </div>

              {/* 庫存數據表格 */}
              <div className="px-4 lg:px-6">
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={
                              filteredAndSortedData.length > 0 && 
                              selectedItems.size === filteredAndSortedData.length
                            }
                            onCheckedChange={toggleSelectAll}
                            aria-label="全選"
                          />
                        </TableHead>
                        <TableHead>廠商名稱</TableHead>
                        <TableHead>商品名稱</TableHead>
                        <TableHead>規格</TableHead>
                        <TableHead
                          className="cursor-pointer text-right"
                          onClick={() => requestSort("stock_quantity")}
                        >
                          庫存量
                          {sortConfig.key === "stock_quantity" ? (
                            sortConfig.direction === "ascending" ? (
                              <span className="ml-1">↑</span>
                            ) : sortConfig.direction === "descending" ? (
                              <span className="ml-1">↓</span>
                            ) : null
                          ) : null}
                        </TableHead>
                        <TableHead>庫存狀態</TableHead>
                        <TableHead
                          className="cursor-pointer text-right"
                          onClick={() => requestSort("remaining_days")}
                        >
                          剩餘天數
                          {sortConfig.key === "remaining_days" ? (
                            sortConfig.direction === "ascending" ? (
                              <span className="ml-1">↑</span>
                            ) : sortConfig.direction === "descending" ? (
                              <span className="ml-1">↓</span>
                            ) : null
                          ) : null}
                        </TableHead>
                        <TableHead>是否已叫貨</TableHead>
                        <TableHead>最後更新</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedData.map((item) => (
                        <TableRow key={item.model_id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedItems.has(item.model_id)}
                              onCheckedChange={() => toggleItemSelection(item.model_id)}
                            />
                          </TableCell>
                          <TableCell>
                            {item.supplier_name ?? "-"}
                          </TableCell>
                          <TableCell>
                            {item.product_models.products.product_name ?? "-"}
                          </TableCell>
                          <TableCell>
                            {item.product_models.model_name ?? "-"}
                          </TableCell>
                          <TableCell
                            className={`text-right font-mono ${
                              (item.stock_quantity ?? 0) < 10
                                ? "text-[#F27F3D] font-bold"
                                : ""
                            }`}
                          >
                            {item.stock_quantity ?? 0}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-all hover:shadow-sm ${
                                (item.remaining_days ?? 0) >= 7
                                  ? "bg-green-50 text-green-600 hover:bg-green-100"
                                  : "bg-[#F27F3D]/10 text-[#F27F3D] hover:bg-[#F27F3D]/20"
                              } ${
                                stockStatusFilter ===
                                ((item.remaining_days ?? 0) >= 7
                                  ? "充足"
                                  : "警告")
                                  ? "ring-2 ring-offset-1"
                                  : ""
                              }`}
                              onClick={() =>
                                handleStockStatusFilter(
                                  (item.remaining_days ?? 0) >= 7
                                    ? "充足"
                                    : "警告"
                                )
                              }
                            >
                              {(item.remaining_days ?? 0) >= 7
                                ? "充足"
                                : "警告"}
                            </span>
                          </TableCell>
                          <TableCell
                            className={`text-right font-mono ${
                              (item.remaining_days ?? 0) < 7 // 目前的邏輯是剩餘天數小於 7 天就會顯示為橘色
                                ? "text-[#F27F3D] font-bold"
                                : ""
                            }`}
                          >
                            {item.remaining_days ?? "-"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-all hover:shadow-sm ${
                                item.is_ordered
                                  ? "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                  : "text-white bg-slate-500 hover:bg-slate-600"
                              } ${
                                orderStatusFilter === (item.is_ordered ? "已叫貨" : "未叫貨")
                                  ? "ring-2 ring-offset-1"
                                  : ""
                              }`}
                              onClick={() =>
                                handleOrderStatusFilter(
                                  item.is_ordered ? "已叫貨" : "未叫貨"
                                )
                              }
                            >
                              {item.is_ordered ? "已叫貨" : "未叫貨"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              item.last_updated ?? new Date()
                            ).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* 備註說明區塊 */}
              <div className="px-4 lg:px-6 mt-6 mb-8">
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium mb-2">庫存狀態說明</h3>
                  <ul className="text-sm space-y-1">
                    <li>• 剩餘天數的計算方式為目前的庫存量除以過去 30 天的日均銷售量 </li>
                    <li>• 剩餘天數小於 7 天的商品將被標記為「警告」狀態</li>
                    <li>• 剩餘天數大於或等於 7 天的商品將被標記為「充足」狀態</li>
                    <li>• 低庫存項目的統計基於剩餘天數小於 7 天的商品數量</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
      
      {/* 一鍵叫貨對話框 */}
      <PurchaseImportDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedItems={isDialogOpen ? getSelectedItemsData() : []}
      />
    </SidebarProvider>
  );
}
