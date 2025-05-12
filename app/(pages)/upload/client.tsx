"use client";

import * as React from "react";
import { FileIcon, UploadIcon } from "lucide-react";
import { IconFileImport } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for import history
type ImportHistory = {
  id: string;
  date: string;
  fileName: string;
  recordCount: number;
  status: string;
  note?: string;
};

// Create a client component that uses useSearchParams
function UploadContent() {
  const searchParams = useSearchParams();
  const [fileImportType, setFileImportType] = React.useState<string | null>(
    null
  );
  const [manualImportType, setManualImportType] = React.useState<string | null>(
    null
  );

  // Add validation state
  const [quantity, setQuantity] = React.useState<string>("");
  const [price, setPrice] = React.useState<string>("");
  const [quantityError, setQuantityError] = React.useState<string | null>(null);
  const [priceError, setPriceError] = React.useState<string | null>(null);

  // 檢查 URL 參數，自動選擇「庫存匯入」
  React.useEffect(() => {
    const type = searchParams.get("type");
    if (type === "inventory") {
      setFileImportType("single"); // 設定檔案上傳為「庫存匯入」
      setManualImportType("single"); // 設定手動輸入為「庫存匯入」
    }
  }, [searchParams]);

  // 處理檔案匯入類型選擇
  const handleFileImportTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFileImportType(event.target.value);
  };

  // Handler for manual import type selection
  const handleManualImportTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setManualImportType(event.target.value);
  };

  // Mock import history data
  const [importHistory] = React.useState<ImportHistory[]>([
    {
      id: "IMP2024001",
      date: "2024-12-02 09:15",
      fileName: "1202出貨紀錄.csv",
      recordCount: 50,
      status: "部份成功",
    },
    {
      id: "IMP2024002",
      date: "2024-12-05 09:15",
      fileName: "1205出貨紀錄.csv",
      recordCount: 150,
      status: "失敗",
    },
    {
      id: "IMP2024003",
      date: "2024-12-30 09:15",
      fileName: "1230出貨紀錄.csv",
      recordCount: 250,
      status: "成功",
    },
    {
      id: "IMP2025001",
      date: "2025-01-22 09:15",
      fileName: "0122出貨紀錄.csv",
      recordCount: 10,
      status: "成功",
    },
    {
      id: "IMP2025002",
      date: "2025-02-24 09:15",
      fileName: "0224出貨紀錄.csv",
      recordCount: 150,
      status: "成功",
    },
  ]);

  // Validation handlers
  const validateQuantity = (value: string) => {
    setQuantity(value);

    if (!value) {
      setQuantityError(null);
      return;
    }

    const numberValue = parseInt(value, 10);
    if (
      isNaN(numberValue) ||
      !Number.isInteger(numberValue) ||
      numberValue <= 0 ||
      value.includes(".")
    ) {
      setQuantityError("請輸入正整數");
    } else {
      setQuantityError(null);
    }
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

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Main Content */}
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-semibold mb-4">資料匯入</h1>

          <Tabs defaultValue="import" className="w-full">
            <TabsList className="w-fit mb-4">
              <TabsTrigger value="import">匯入資料</TabsTrigger>
              <TabsTrigger value="history">匯入歷史</TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* File Upload Section */}
                <Card className="border shadow-sm">
                  <CardContent className="pt-3">
                    <h3 className="text-xl font-medium mb-2">上傳檔案</h3>
                    <div className="flex flex-col justify-between gap-4">
                      <div className="flex gap-2 mb-2">
                        <div className="flex items-center">
                          <Input
                            type="radio"
                            id="batch-import"
                            name="import-type-left"
                            value="batch"
                            className="h-4 w-4"
                            onChange={handleFileImportTypeChange}
                            checked={fileImportType === "batch"}
                          />
                          <Label htmlFor="batch-import" className="ml-2">
                            銷售匯入
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Input
                            type="radio"
                            id="single-import"
                            name="import-type-left"
                            value="single"
                            className="h-4 w-4"
                            onChange={handleFileImportTypeChange}
                            checked={fileImportType === "single"}
                          />
                          <Label htmlFor="single-import" className="ml-2">
                            庫存匯入
                          </Label>
                        </div>
                      </div>

                      <div className="border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center py-6">
                          <UploadIcon className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-center">
                            拖放檔案或點擊上傳
                          </p>
                          <p className="text-xs text-muted-foreground">
                            支援 .xlsx, .csv 檔案格式
                          </p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500">
                        <h4 className="font-medium">備註</h4>
                        <Textarea
                          placeholder="請輸入此次匯入的相關資訊..."
                          className="w-full h-[184px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground mt-2 min-h-[80px]"
                        />
                      </div>

                      <Button className="w-full" type="submit">
                        確認上傳
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Manual Input Section */}
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
                            onChange={handleManualImportTypeChange}
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
                            onChange={handleManualImportTypeChange}
                            checked={manualImportType === "single"}
                          />
                          <Label htmlFor="single-manual" className="ml-2">
                            庫存匯入
                          </Label>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <div className="grid gap-1.5">
                          <Label htmlFor="product-code">貨品編號</Label>
                          <Input
                            id="product-code"
                            placeholder="請輸入貨品編號"
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="item-name">商品名稱</Label>
                          <Input id="item-name" placeholder="請輸入商品名稱" />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="quantity">數量</Label>
                          <Input
                            id="quantity"
                            placeholder="請輸入數量"
                            value={quantity}
                            onChange={(e) => validateQuantity(e.target.value)}
                            className={quantityError ? "border-red-500" : ""}
                          />
                          {quantityError && (
                            <p className="text-sm text-red-500">
                              {quantityError}
                            </p>
                          )}
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="price">價格</Label>
                          <Input
                            id="price"
                            placeholder="請輸入價格"
                            disabled={manualImportType === "single"}
                            className={`${
                              manualImportType === "single"
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                            } ${priceError ? "border-red-500" : ""}`}
                            value={price}
                            onChange={(e) => validatePrice(e.target.value)}
                          />
                          {priceError && manualImportType !== "single" && (
                            <p className="text-sm text-red-500">{priceError}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-gray-500">
                        <h4 className="font-medium">備註</h4>
                        <Textarea
                          placeholder="請輸入此次匯入的相關資訊..."
                          className="mt-2"
                        />
                      </div>

                      <Button className="w-full" type="submit">
                        確認輸入
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Import Guidelines */}
              <div className="border rounded-lg p-6 bg-gray-50">
                <h3 className="text-lg font-medium mb-4">匯入指南</h3>

                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
                      <FileIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">檔案格式要求</h4>
                      <p className="text-sm text-muted-foreground">
                        所需欄位包含: 商品編號、規格資訊、數量、批號。
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
                      <IconFileImport className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">匯入流程</h4>
                      <p className="text-sm text-muted-foreground">
                        上傳檔案後，系統將自動解析資料格式，若有疑問請聯繫系統管理員。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">匯入歷史紀錄</h3>
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead>匯入編號</TableHead>
                        <TableHead>日期時間</TableHead>
                        <TableHead>檔案名稱</TableHead>
                        <TableHead className="text-right">紀錄數量</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>備註</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importHistory.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.id}</TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.fileName}</TableCell>
                          <TableCell className="text-right font-mono">
                            {record.recordCount}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-md  font-medium ${
                                record.status === "成功"
                                  ? "bg-green-50 text-green-600"
                                  : record.status === "失敗"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-yellow-50 text-yellow-600"
                              }`}
                            >
                              {record.status}
                            </span>
                          </TableCell>
                          <TableCell>{record.note || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps the client component in a Suspense boundary
export default function InventoryClient() {
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
          <React.Suspense fallback={<div className="p-4">Loading...</div>}>
            <UploadContent />
          </React.Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
