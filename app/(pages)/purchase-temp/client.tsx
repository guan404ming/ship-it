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
import { purchaseOrderData } from "@/lib/data/purchase-data";

export default function PurchaseTempClient() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [categoryFilter, setCategoryFilter] =
    React.useState<string>("所有規則");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handlePurchaseOrderImport = () => {
    setIsDialogOpen(true);
  };

  const totalOrders = new Set(purchaseOrderData.map((item) => item.batch_id))
    .size;
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
          item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.batch_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.model_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "所有規則") {
      filtered = filtered.filter(
        (item) => item.category_name === categoryFilter
      );
    }

    return filtered;
  }, [searchQuery, categoryFilter]);

  const productCategories = React.useMemo(() => {
    const categories = new Set(
      purchaseOrderData.map((item) => item.category_name)
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
                </div>
                
                <PurchaseImportDialog 
                  open={isDialogOpen} 
                  onOpenChange={setIsDialogOpen} 
                />
              </div>

              <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6">
                <Card className="border shadow-sm">
                  <CardContent className="flex items-center p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#08678C]/10">
                      <FileUp className="h-6 w-6 text-[#08678C]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-muted-foreground">總叫貨單</p>
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
                        <TableHead>商品分類</TableHead>
                        <TableHead>商品名稱</TableHead>
                        <TableHead>規格</TableHead>
                        <TableHead className="text-right">數量</TableHead>
                        <TableHead className="text-right">單價</TableHead>
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
                          <TableCell>{item.batch_id}</TableCell>
                          <TableCell>{item.supplier_name}</TableCell>
                          <TableCell>{item.category_name}</TableCell>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>{item.model_name}</TableCell>
                          <TableCell className="text-right font-mono">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {item.unit_cost}
                          </TableCell>
                          <TableCell>{item.created_at}</TableCell>
                          <TableCell>{item.expected_arrival}</TableCell>
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
