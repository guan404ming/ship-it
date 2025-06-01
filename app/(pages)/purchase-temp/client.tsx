"use client";

import * as React from "react";
import {
  FileUp,
  PackageIcon,
  PlusCircle,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { PurchaseImportDialog } from "@/components/purchase-import-dialog";
import { PurchaseEditDialog } from "@/components/purchase-edit-dialog";
import { PurchaseDashboardRow } from "@/lib/types";

interface PurchaseTempClientProps {
  initialPurchase: PurchaseDashboardRow[];
}

export default function PurchaseClient({ initialPurchase }: PurchaseTempClientProps) {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<
    Record<string, boolean>
  >({});
  const [sortField, setSortField] = React.useState<
    "created_at" | "expect_date"
  >("created_at");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "asc"
  );

  const handlePurchaseOrderImport = () => {
    setIsDialogOpen(true);
  };

  const totalOrders = new Set(initialPurchase.map((item) => item.batch_id)).size;
  const totalItems = initialPurchase.length;

  const filteredAndSortedData = React.useMemo(() => {
    let filteredData = [...initialPurchase];

    if (searchQuery) {
      
      filteredData = filteredData.filter(
        (item) =>
          (item.product_name?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          ) ||
          (item.supplier_name?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          ) ||
          (item.model_name?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          )
      );
    }

    // Sort data based on the selected sort field and direction
    filteredData.sort((a, b) => {
      // Handle null values and parse dates for proper comparison
      const valueA = a[sortField];
      const valueB = b[sortField];

      if (!valueA && !valueB) return 0;
      if (!valueA) return 1;
      if (!valueB) return -1;

      const dateA = new Date(valueA);
      const dateB = new Date(valueB);

      // Compare dates
      if (sortDirection === "asc") {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });

    return filteredData;
  }, [
    searchQuery,
    sortField, 
    sortDirection,
    initialPurchase]);

  // Toggle a single row selection
  const toggleRowSelection = (id: number) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle all rows selection
  const toggleAllRows = () => {
    if (
      Object.keys(selectedRows).length === filteredAndSortedData.length &&
      Object.values(selectedRows).every((selected) => selected)
    ) {
      // If all are selected, clear selection
      setSelectedRows({});
    } else {
      // Otherwise, select all filtered rows
      const newSelectedRows: Record<string, boolean> = {};
      filteredAndSortedData.forEach((item) => {
        newSelectedRows[item.item_id] = true;
      });
      setSelectedRows(newSelectedRows);
    }
  };

  // Check if all filtered rows are selected
  const areAllRowsSelected =
    filteredAndSortedData.length > 0 &&
    filteredAndSortedData.every((item) => selectedRows[item.item_id]);

  // Handle column sorting
  const handleSort = (field: "created_at" | "expect_date") => {
    if (sortField === field) {
      // Toggle sort direction if the same field is clicked again
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get selected items count
  const selectedItemsCount = Object.values(selectedRows).filter(Boolean).length;

  // Get selected items data
  const getSelectedItemsData = () => {
    return filteredAndSortedData.filter((item) => selectedRows[item.item_id]);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    // Placeholder for future implementation
    console.log("以下項目將被刪除:", getSelectedItemsData());
    alert(`已選擇 ${selectedItemsCount} 個項目準備刪除`);

    // Here you would implement the actual delete logic in a real application
    // For now, just clear the selection
    setSelectedRows({});
  };

  // Handle marking items as delivered
  const handleMarkAsDelivered = () => {
    // Placeholder for future implementation
    console.log("以下項目將被標記為已送達:", getSelectedItemsData());
    alert(`已標記 ${selectedItemsCount} 個項目為已送達`);

    // Here you would implement the actual API call to update the status
    // For now, just clear the selection
    setSelectedRows({});
  };

  return (
    <div className="flex flex-1 flex-col h-full w-full">
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
              selectedItems={[]}
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

              {/* 當有選擇項目時顯示的操作按鈕 */}
              {selectedItemsCount > 0 && (
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleMarkAsDelivered}
                    className="bg-[#08678C]"
                  >
                    <PackageIcon className="mr-2 h-4 w-4" />
                    標記為已送達 ({selectedItemsCount})
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    刪除 ({selectedItemsCount})
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-3 items-center">
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="h-10"
                >
                  清除搜尋
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
                      <Checkbox
                        checked={areAllRowsSelected}
                        onCheckedChange={toggleAllRows}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>廠商名稱</TableHead>
                    <TableHead>商品名稱</TableHead>
                    <TableHead>規格</TableHead>
                    <TableHead className="text-right">數量</TableHead>
                    <TableHead className="text-right">單價</TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 focus:outline-none hover:text-primary"
                        onClick={() => handleSort("created_at")}
                      >
                        <span>叫貨日期</span>
                        {sortField === "created_at" ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 focus:outline-none hover:text-primary"
                        onClick={() => handleSort("expect_date")}
                      >
                        <span>預計到貨日</span>
                        {sortField === "expect_date" ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>備註</TableHead>
                    <TableHead>動作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedData.map((item) => (
                    <TableRow key={item.item_id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRows[item.item_id] || false}
                          onCheckedChange={() =>
                            toggleRowSelection(item.item_id)
                          }
                        />
                      </TableCell>
                      <TableCell>{item.supplier_name}</TableCell>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.model_name}</TableCell>
                      <TableCell className="text-right font-mono">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.unit_cost}
                      </TableCell>
                      <TableCell>{item.created_at}</TableCell>
                      <TableCell>{item.expect_date}</TableCell>
                      <TableCell>{item.note || "-"}</TableCell>
                      <TableCell>
                        <PurchaseEditDialog
                          purchaseId={item.item_id.toString()}
                        />
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
  );
}
