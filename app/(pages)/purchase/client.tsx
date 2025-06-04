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
import { PurchaseImportDialog } from "@/components/purchase-import/purchase-import-dialog";
import { PurchaseEditDialog } from "@/components/purchase-edit-dialog";
import { PurchaseDashboardRow } from "@/lib/types";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import dayjs from "dayjs";
import {
  deletePurchaseItems,
  updatePurchaseBatchStatus,
} from "@/actions/purchase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PurchaseTempClientProps {
  initialPurchase: PurchaseDashboardRow[];
}

export default function PurchaseClient({
  initialPurchase,
}: PurchaseTempClientProps) {
  const router = useRouter();
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handlePurchaseOrderImport = () => {
    setIsDialogOpen(true);
  };

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

    return filteredData.filter((item) => item.status !== "confirmed");
  }, [searchQuery, sortField, sortDirection, initialPurchase]);

  // Group data by batch_id for display
  const groupedData = React.useMemo(() => {
    const groups = filteredAndSortedData.reduce((acc, item) => {
      const batchId = item.batch_id;
      if (!acc[batchId]) {
        acc[batchId] = [];
      }
      acc[batchId].push(item);
      return acc;
    }, {} as Record<string, PurchaseDashboardRow[]>);

    // Convert to array of groups and sort by the first item's created_at in each group
    return Object.entries(groups)
      .map(([batchId, items]) => ({
        batchId,
        items,
        firstCreatedAt: items[0]?.created_at
      }))
      .sort((a, b) => {
        if (!a.firstCreatedAt && !b.firstCreatedAt) return 0;
        if (!a.firstCreatedAt) return 1;
        if (!b.firstCreatedAt) return -1;
        
        const dateA = new Date(a.firstCreatedAt);
        const dateB = new Date(b.firstCreatedAt);
        
        if (sortDirection === "asc") {
          return dateA.getTime() - dateB.getTime();
        } else {
          return dateB.getTime() - dateA.getTime();
        }
      });
  }, [filteredAndSortedData, sortDirection]);

  const totalOrders = new Set(
    filteredAndSortedData.map((item) => item.batch_id)
  ).size;
  const totalItems = filteredAndSortedData.length;

  // Toggle a single row selection and all rows with the same batch_id
  const toggleRowSelection = (itemId: number) => {
    const clickedItem = filteredAndSortedData.find(item => item.item_id === itemId);
    if (!clickedItem) return;

    const batchId = clickedItem.batch_id;
    const itemsInSameBatch = filteredAndSortedData.filter(item => item.batch_id === batchId);
    
    // Check if any item in this batch is currently selected
    const isAnyItemInBatchSelected = itemsInSameBatch.some(item => selectedRows[item.item_id]);
    
    setSelectedRows((prev) => {
      const newSelectedRows = { ...prev };
      
      // If any item in the batch is selected, deselect all items in the batch
      // Otherwise, select all items in the batch
      itemsInSameBatch.forEach(item => {
        if (isAnyItemInBatchSelected) {
          delete newSelectedRows[item.item_id];
        } else {
          newSelectedRows[item.item_id] = true;
        }
      });
      
      return newSelectedRows;
    });
  };

  // Toggle all rows selection by batch
  const toggleAllRows = () => {
    // Group items by batch_id
    const batchGroups = filteredAndSortedData.reduce((groups, item) => {
      const batchId = item.batch_id;
      if (!groups[batchId]) {
        groups[batchId] = [];
      }
      groups[batchId].push(item);
      return groups;
    }, {} as Record<string, PurchaseDashboardRow[]>);

    // Check if all batches are fully selected
    const allBatchesSelected = Object.values(batchGroups).every(batchItems => 
      batchItems.every(item => selectedRows[item.item_id])
    );

    if (allBatchesSelected) {
      // If all batches are selected, clear selection
      setSelectedRows({});
    } else {
      // Otherwise, select all items in all batches
      const newSelectedRows: Record<string, boolean> = {};
      filteredAndSortedData.forEach((item) => {
        newSelectedRows[item.item_id] = true;
      });
      setSelectedRows(newSelectedRows);
    }
  };

  // Check if all filtered rows are selected (by batch)
  const areAllRowsSelected = React.useMemo(() => {
    if (filteredAndSortedData.length === 0) return false;
    
    // Group items by batch_id
    const batchGroups = filteredAndSortedData.reduce((groups, item) => {
      const batchId = item.batch_id;
      if (!groups[batchId]) {
        groups[batchId] = [];
      }
      groups[batchId].push(item);
      return groups;
    }, {} as Record<string, PurchaseDashboardRow[]>);

    // Check if all batches are fully selected
    return Object.values(batchGroups).every(batchItems => 
      batchItems.every(item => selectedRows[item.item_id])
    );
  }, [filteredAndSortedData, selectedRows]);

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
  const handleBulkDelete = async () => {
    try {
      const selectedItems = getSelectedItemsData();
      const itemsToDelete = selectedItems.map((item) => ({
        batch_id: item.batch_id,
        item_id: item.item_id,
      }));

      await deletePurchaseItems(itemsToDelete);

      toast.success(`成功刪除 ${selectedItemsCount} 個項目`);
      setSelectedRows({});
      router.refresh();
    } catch (error) {
      console.error("Error deleting items:", error);
      toast.error("刪除項目時發生錯誤");
    }
  };

  // Handle marking items as delivered
  const handleMarkAsDelivered = async () => {
    try {
      const selectedItems = getSelectedItemsData();
      const itemsToUpdate = selectedItems.map((item) => ({
        batch_id: item.batch_id,
        item_id: item.item_id,
      }));

      await updatePurchaseBatchStatus(itemsToUpdate, "confirmed");

      toast.success(`成功標記 ${selectedItemsCount} 個項目為已送達`);
      setSelectedRows({});
      router.refresh();
    } catch (error) {
      console.error("Error marking items as delivered:", error);
      toast.error("標記項目為已送達時發生錯誤");
    }
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
              <div className="relative flex items-center flex-1 max-w-sm">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="搜尋項目..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 border-muted-foreground/20 focus:border-primary transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* 當有選擇項目時顯示的操作按鈕 */}
              {selectedItemsCount > 0 && (
                <div className="flex gap-2 ml-4 p-2 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-primary">
                      已選擇 {selectedItemsCount} 項目
                    </span>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleMarkAsDelivered}
                    className="bg-[#08678C] hover:bg-[#08678C]/90 shadow-sm"
                  >
                    <PackageIcon className="mr-2 h-4 w-4" />
                    標記為已送達
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="shadow-sm"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    刪除
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-3 items-center">
              {searchQuery && (
                <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full text-sm text-muted-foreground">
                  <span>搜尋: &ldquo;{searchQuery}&rdquo;</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="h-6 w-6 p-0 hover:bg-muted"
                  >
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="px-4 lg:px-6">
            <div className="rounded-lg border shadow-sm bg-background overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12 py-2 px-4">
                      <Checkbox
                      checked={areAllRowsSelected}
                      onCheckedChange={toggleAllRows}
                      aria-label="全選"
                      className="transition-all duration-200 hover:scale-110"
                      />
                    </TableHead>
                    <TableHead className="font-semibold">廠商名稱</TableHead>
                    <TableHead className="font-semibold">商品名稱</TableHead>
                    <TableHead className="font-semibold">規格</TableHead>
                    <TableHead className="text-right font-semibold">數量</TableHead>
                    <TableHead className="font-semibold">
                      <button
                        className="flex items-center gap-1 focus:outline-none hover:text-primary transition-colors px-1 py-1 rounded hover:bg-primary/10"
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
                    <TableHead className="font-semibold">
                      <button
                        className="flex items-center gap-1 focus:outline-none hover:text-primary transition-colors px-1 py-1 rounded hover:bg-primary/10"
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
                    <TableHead className="font-semibold">備註</TableHead>
                    <TableHead className="font-semibold text-center">動作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedData.map((group, groupIndex) => (
                    <React.Fragment key={group.batchId}>
                      {/* Batch separator with visual divider */}
                      {groupIndex > 0 && (
                        <TableRow className="bg-transparent hover:bg-transparent">
                          <TableCell colSpan={9} className="h-6 p-0"></TableCell>
                        </TableRow>
                      )}
                      
                      {/* Batch header row - enhanced visual styling */}
                      <TableRow className="bg-gradient-to-r from-primary/8 to-primary/4 hover:from-primary/12 hover:to-primary/6 transition-all duration-200">
                        <TableCell className="py-2 px-4 w-12 bg-primary/5">
                          <Checkbox
                            checked={group.items.every(item => selectedRows[item.item_id])}
                            onCheckedChange={() => toggleRowSelection(group.items[0].item_id)}
                            className="transition-all duration-200 hover:scale-110 border-primary/20 hover:bg-primary/10 hover:shadow-sm"
                          />
                        </TableCell>
                        <TableCell colSpan={8} className="py-2 px-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-primary rounded-full shadow-sm"></div>
                                <span className="text-sm font-bold text-foreground tracking-wide">
                                  叫貨單 #{group.batchId}
                                </span>
                              </div>
                              <span className="text-xs bg-primary/20 text-primary px-3 py-1.5 rounded-full font-semibold">
                                {group.items.length} 項目
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                叫貨日期: {dayjs(group.items[0]?.created_at).format("YYYY-MM-DD")}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-muted-foreground font-medium">
                                總數量: <span className="text-foreground font-semibold">{group.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                              </span>
                              {group.items.every(item => selectedRows[item.item_id]) && (
                                <span className="bg-primary/15 text-primary px-3 py-1 rounded-full font-semibold">
                                  已全選
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Items in this batch with improved spacing */}
                      {group.items.map((item, itemIndex) => {
                        const isLastInGroup = itemIndex === group.items.length - 1;
                        const isSelected = selectedRows[item.item_id] || false;
                        
                        return (
                          <TableRow 
                            key={item.item_id}
                            className={`
                              ${isSelected ? 'bg-primary/8': 'bg-background'}
                              ${isLastInGroup ? 'border-b-2 border-b-muted/40' : ''}
                              hover:bg-muted/50 transition-all duration-200 group cursor-pointer
                              relative
                            `}
                            onClick={() => toggleRowSelection(item.item_id)}
                          >
                            <TableCell className="py-3 px-4 relative">
                              {/* Subtle connection line to batch header */}
                              <div className="absolute left-2 top-0 bottom-0 w-px bg-primary/15"></div>
                              <div className="ml-2">
                                {/* Empty space for visual hierarchy */}
                              </div>
                            </TableCell>
                            <TableCell className="py-3 px-4 font-medium text-sm">
                              {item.supplier_name}
                            </TableCell>
                            <TableCell className="py-3 px-4 text-sm">{item.product_name}</TableCell>
                            <TableCell className="py-3 px-4 text-muted-foreground text-sm">
                              {item.model_name}
                            </TableCell>
                            <TableCell className="py-3 px-4 text-right font-mono tabular-nums">
                              <span className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                {item.quantity}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 px-4 text-muted-foreground text-sm">
                              {dayjs(item.created_at).format("YYYY-MM-DD")}
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <span className="font-medium text-sm">
                                {dayjs(item.expect_date).format("YYYY-MM-DD")}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 px-4 text-muted-foreground max-w-32 truncate text-sm">
                              <span title={item.note || ""}>
                                {item.note || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                              <PurchaseEditDialog purchase={item} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  ))}
                  {groupedData.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={9} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                          <PackageIcon className="h-12 w-12 opacity-30" />
                          <div className="text-lg font-medium">沒有找到叫貨資料</div>
                          <div className="text-sm">請嘗試調整搜尋條件或新增叫貨</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleBulkDelete}
        itemCount={selectedItemsCount}
      />
    </div>
  );
}
