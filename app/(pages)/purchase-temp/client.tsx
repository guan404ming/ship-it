"use client";

import * as React from "react";
import {
  FileDown,
  FileUp,
  PackageIcon,
  PlusCircle,
  Search,
} from "lucide-react";

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
import { PurchaseImportDialog } from "@/components/purchase-import-dialog";
import { getPurchaseOrderItems } from "@/actions/purchase";

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

// 1. raw 型別（只寫到你用得到的屬性）
type PurchaseItemRaw = {
  item_id: number;
  quantity: number | null;
  unit_cost: number | null;
  purchase_batches: {
    created_at: string | null;
    status: string | null;
    suppliers: { supplier_name: string | null }[];
  }[];
  product_models: {
    model_name: string | null;
    products: {
      product_name: string | null;
      categories: { category_name: string | null }[];
    }[];
  }[];
};

/** 把 Raw 轉平為前端欄位 */
const toItem = (row: PurchaseItemRaw): PurchaseOrderItem => {
  const batch = row.purchase_batches?.[0];
  const supp  = batch?.suppliers?.[0];
  const model = row.product_models?.[0];
  const prod  = model?.products?.[0];
  const cate  = prod?.categories?.[0];

  return {
    id: row.item_id.toString(),
    orderNumber: batch?.status ?? "N/A",
    vendorCode:  supp?.supplier_name ?? "未知廠商",
    productCategory: cate?.category_name ?? "未分類",
    productName: prod?.product_name ?? "未命名商品",
    spec: model?.model_name ?? "無規格",
    quantity: row.quantity ?? 0,
    totalPrice: (Number(row.unit_cost) || 0) * (row.quantity ?? 0),
    orderDate: batch?.created_at ?? "",
    expectedArrivalDate: "-",
    note: "-",
  };
};


export default function PurchaseTempClient() {
  // 後端資料
  const [purchaseOrderData, setPurchaseOrderData] =
    React.useState<PurchaseOrderItem[]>([]);
  // UI‧對話框‧搜尋‧分類
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("所有規則");
  // loading / error
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 讀取資料
  React.useEffect(() => {
    async function fetchData() {
      try {
        const raw = (await getPurchaseOrderItems()) as PurchaseItemRaw[];
        const flat = raw.map(toItem);        // ← 轉平
        setPurchaseOrderData(flat);
      } catch (e) {
        setError((e as Error).message ?? "載入失敗");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 衍生值
  const totalOrders = React.useMemo(
    () => new Set(purchaseOrderData.map((i) => i.orderNumber)).size,
    [purchaseOrderData],
  );
  const totalItems = purchaseOrderData.length;

  const productCategories = React.useMemo(() => {
    const set = new Set(purchaseOrderData.map((i) => i.productCategory));
    return ["所有規則", ...Array.from(set)];
  }, [purchaseOrderData]);

  const filteredData = React.useMemo(() => {
    let data = [...purchaseOrderData];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (i) =>
          i.productName.toLowerCase().includes(q) ||
          i.vendorCode.toLowerCase().includes(q) ||
          i.orderNumber.toLowerCase().includes(q) ||
          i.spec.toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== "所有規則") {
      data = data.filter((i) => i.productCategory === categoryFilter);
    }
    return data;
  }, [purchaseOrderData, searchQuery, categoryFilter]);

  // dialog open
  const handlePurchaseOrderImport = () => setIsDialogOpen(true);
  const clearAllFilters = () => {
    setSearchQuery("");
    setCategoryFilter("所有規則");
  };

  // loading / error 狀態顯示
  if (loading) return <p className="p-6">資料載入中…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  /* ———————— 以下維持原來 UI，僅把 purchaseOrderData 改為衍生資料 ———————— */
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
            {/* Header / Buttons */}
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex items-center justify-between px-4 lg:px-6">
                <h1 className="text-3xl font-semibold">我的叫貨</h1>
                <div className="flex gap-3">
                  <Button
                    onClick={handlePurchaseOrderImport}
                    variant="default"
                    size="sm"
                    className="h-10 px-4"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    新增叫貨
                  </Button>
                  <Button variant="outline" size="sm" className="h-10 px-4">
                    <FileDown className="mr-2 h-4 w-4" />
                    資料匯出
                  </Button>
                </div>
                <PurchaseImportDialog
                  open={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                />
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6">
                <Card className="border shadow-sm">
                  <CardContent className="flex items-center p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#08678C]/10">
                      <FileUp className="h-6 w-6 text-[#08678C]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-muted-foreground">總進貨單</p>
                      <h2 className="text-3xl font-bold text-[#08678C]">
                        {totalOrders}
                      </h2>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="flex items-center p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#08678C]/10">
                      <PackageIcon className="h-6 w-6 text-[#08678C]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-muted-foreground">總項目數</p>
                      <h2 className="text-3xl font-bold text-[#08678C]">
                        {totalItems}
                      </h2>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filter Bar */}
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
                      {productCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(searchQuery || categoryFilter !== "所有規則") && (
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

              {/* Data Table */}
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