"use client";

import * as React from "react";
import { BoxIcon, FileDown, FileUp, PackageIcon, Search } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StockRecordWithModel } from "@/lib/types";

interface InventoryClientProps {
  initialInventory: StockRecordWithModel[];
  // TODO: Implement inventory movements history view
  // initialMovements: InventoryMovementWithModel[];
}

export function InventoryClient({ initialInventory }: InventoryClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [categoryFilter, setCategoryFilter] =
    React.useState<string>("所有類別");
  const [statusFilter, setStatusFilter] = React.useState<string>("所有狀態");
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof StockRecordWithModel | null;
    direction: "ascending" | "descending" | null;
  }>({
    key: null,
    direction: null,
  });

  const handleInventoryImport = () => {
    router.push("/upload?type=inventory");
  };

  const totalItems = initialInventory.length;
  const lowStockItems = initialInventory.filter(
    (item) => (item.stock_quantity ?? 0) < 10
  ).length;

  const handleStatusFilter = (status: string) => {
    if (statusFilter === status) {
      setStatusFilter("所有狀態");
    } else {
      setStatusFilter(status);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setCategoryFilter("所有類別");
    setStatusFilter("所有狀態");
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
    let filteredData = [...initialInventory];

    if (searchQuery) {
      filteredData = filteredData.filter(
        (item) =>
          item.product_models.products.product_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.product_models.model_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "所有類別") {
      filteredData = filteredData.filter(
        (item) =>
          item.product_models.products.category_id === parseInt(categoryFilter)
      );
    }

    if (statusFilter !== "所有狀態") {
      filteredData = filteredData.filter((item) => {
        if (statusFilter === "警告") return (item.stock_quantity ?? 0) < 10;
        if (statusFilter === "充足") return (item.stock_quantity ?? 0) >= 10;
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
  }, [searchQuery, categoryFilter, statusFilter, sortConfig, initialInventory]);

  const productCategories = React.useMemo(() => {
    const categories = new Set(
      initialInventory.map((item) => item.product_models.products.category_id)
    );
    return [
      "所有類別",
      ...Array.from(categories).filter((c): c is number => c !== null),
    ];
  }, [initialInventory]);

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
                  <Button variant="outline" size="sm" className="h-10 px-4">
                    <FileDown className="mr-2 h-4 w-4" />
                    資料匯出
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
                </div>
                <div className="flex gap-3 items-center">
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-[180px] h-10">
                      <SelectValue placeholder="選擇類別" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((category) => (
                        <SelectItem key={category} value={category.toString()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-10">
                      <SelectValue placeholder="選擇狀態" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="所有狀態">所有狀態</SelectItem>
                      <SelectItem value="充足">充足</SelectItem>
                      <SelectItem value="警告">警告</SelectItem>
                    </SelectContent>
                  </Select>
                  {(searchQuery ||
                    categoryFilter !== "所有類別" ||
                    statusFilter !== "所有狀態") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-10"
                    >
                      清除篩選
                    </Button>
                  )}
                </div>
              </div>

              {/* 庫存數據表格 */}
              <div className="px-4 lg:px-6">
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
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
                        <TableHead>最後更新</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedData.map((item) => (
                        <TableRow key={item.model_id}>
                          <TableCell>
                            <Checkbox />
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
                                (item.stock_quantity ?? 0) >= 10
                                  ? "bg-green-50 text-green-600 hover:bg-green-100"
                                  : "bg-[#F27F3D]/10 text-[#F27F3D] hover:bg-[#F27F3D]/20"
                              } ${
                                statusFilter ===
                                ((item.stock_quantity ?? 0) >= 10
                                  ? "充足"
                                  : "警告")
                                  ? "ring-2 ring-offset-1"
                                  : ""
                              }`}
                              onClick={() =>
                                handleStatusFilter(
                                  (item.stock_quantity ?? 0) >= 10
                                    ? "充足"
                                    : "警告"
                                )
                              }
                            >
                              {(item.stock_quantity ?? 0) >= 10
                                ? "充足"
                                : "警告"}
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
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
