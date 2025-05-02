"use client";

import * as React from "react";
import { FileDown, FileUp, PackageIcon, PlusCircle, Search } from "lucide-react";
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

type PurchaseOrderItem = {
  id: string;
  orderNumber: string;
  vendorCode: string;
  productCategory: string;
  productName: string;
  spec: string;
  quantity: number;
  totalPrice: number;
  orderDate: string;
  expectedArrivalDate: string;
  note?: string;
};

const purchaseOrderData: PurchaseOrderItem[] = [
  {
    id: "1",
    orderNumber: "PO2023001",
    vendorCode: "fju3299",
    productCategory: "兒童玩具",
    productName: "拼圖",
    spec: "長頸鹿款",
    quantity: 200,
    totalPrice: 10000,
    orderDate: "2025-05-15",
    expectedArrivalDate: "2025-05-30",
  },
  {
    id: "2",
    orderNumber: "PO2023001",
    vendorCode: "fju3299",
    productCategory: "兒童玩具",
    productName: "拼圖",
    spec: "海豚款",
    quantity: 200,
    totalPrice: 10000,
    orderDate: "2025-05-15",
    expectedArrivalDate: "2025-05-30",
  },
  {
    id: "3",
    orderNumber: "PO2023001",
    vendorCode: "fju3299",
    productCategory: "兒童玩具",
    productName: "拼圖",
    spec: "海豚款",
    quantity: 200,
    totalPrice: 10000,
    orderDate: "2025-05-15",
    expectedArrivalDate: "2025-05-30",
  },
  {
    id: "4",
    orderNumber: "PO2023001",
    vendorCode: "jde2088",
    productCategory: "服飾",
    productName: "兒童外套",
    spec: "黑色",
    quantity: 110,
    totalPrice: 5000,
    orderDate: "2025-04-29",
    expectedArrivalDate: "2025-05-10",
  },
  {
    id: "5",
    orderNumber: "PO2023001",
    vendorCode: "jde2088",
    productCategory: "服飾",
    productName: "兒童外套",
    spec: "粉色",
    quantity: 100,
    totalPrice: 6000,
    orderDate: "2025-04-29",
    expectedArrivalDate: "2025-05-10",
  },
  {
    id: "6",
    orderNumber: "PO2023001",
    vendorCode: "kk7655",
    productCategory: "裝飾品",
    productName: "聖誕裝飾",
    spec: "星星",
    quantity: 50,
    totalPrice: 2000,
    orderDate: "2025-04-11",
    expectedArrivalDate: "2025-05-10",
  },
];

export default function PurchaseTempPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("所有規則");

  const handlePurchaseOrderImport = () => {
    router.push("/purchase-import");
  };

  const totalOrders = new Set(purchaseOrderData.map(item => item.orderNumber)).size;
  const totalItems = purchaseOrderData.length;

  const clearAllFilters = () => {
    setSearchQuery("");
    setCategoryFilter("所有規則");
  };

  const filteredData = React.useMemo(() => {
    let filtered = [...purchaseOrderData];

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.vendorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.spec.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "所有規則") {
      filtered = filtered.filter(
        (item) => item.productCategory === categoryFilter
      );
    }

    return filtered;
  }, [searchQuery, categoryFilter]);

  const productCategories = React.useMemo(() => {
    const categories = new Set(
      purchaseOrderData.map((item) => item.productCategory)
    );
    return ["所有規則", ...Array.from(categories)];
  }, []);

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
                <h1 className="text-3xl font-semibold">進貨暫存</h1>
                <div className="flex gap-3">
                  <Button
                    onClick={handlePurchaseOrderImport}
                    variant="default"
                    size="sm"
                    className="h-10 px-4"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    叫貨匯入
                  </Button>
                  <Button variant="outline" size="sm" className="h-10 px-4">
                    <FileDown className="mr-2 h-4 w-4" />
                    資料匯出
                  </Button>
                </div>
              </div>

              {/* 指標卡片 */}
              <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6">
                {/* 總進貨單卡片 */}
                <Card className="border shadow-sm">
                  <CardContent className="flex items-center p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#08678C]/10">
                      <FileUp className="h-6 w-6 text-[#08678C]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-muted-foreground">
                        總進貨單
                      </p>
                      <h2 className="text-3xl font-bold text-[#08678C]">
                        {totalOrders}
                      </h2>
                    </div>
                  </CardContent>
                </Card>

                {/* 總項目數卡片 */}
                <Card className="border shadow-sm">
                  <CardContent className="flex items-center p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#08678C]/10">
                      <PackageIcon className="h-6 w-6 text-[#08678C]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-muted-foreground">
                        總項目數
                      </p>
                      <h2 className="text-3xl font-bold text-[#08678C]">
                        {totalItems}
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
                    <SelectTrigger className="w-[140px] h-10">
                      <SelectValue placeholder="所有規則" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(searchQuery ||
                    categoryFilter !== "所有規則") && (
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

              {/* 進貨數據表格 */}
              <div className="px-4 lg:px-6">
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>進貨單號</TableHead>
                        <TableHead>廠商名稱</TableHead>
                        <TableHead>產品分類</TableHead>
                        <TableHead>產品名稱</TableHead>
                        <TableHead>規格</TableHead>
                        <TableHead className="text-right">數量</TableHead>
                        <TableHead className="text-right">總價</TableHead>
                        <TableHead>叫貨日期</TableHead>
                        <TableHead>預計到貨日</TableHead>
                        <TableHead>備註</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell>{item.orderNumber}</TableCell>
                          <TableCell>{item.vendorCode}</TableCell>
                          <TableCell>{item.productCategory}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.spec}</TableCell>
                          <TableCell className="text-right font-mono">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {item.totalPrice}
                          </TableCell>
                          <TableCell>{item.orderDate}</TableCell>
                          <TableCell>{item.expectedArrivalDate}</TableCell>
                          <TableCell>{item.note || "-"}</TableCell>
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