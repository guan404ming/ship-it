"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { InventoryDashboardRow } from "@/lib/types";
import { PurchaseImportDialog } from "@/components/purchase-import/purchase-import-dialog";
import { InventoryHeader } from "./inventory-header";
import { InventorySummary } from "./inventory-summary";
import { InventoryFilterBar } from "./inventory-filter-bar";
import { InventoryTable } from "./inventory-table";
import { InventoryStatusExplanation } from "./inventory-status-explanation";

interface InventoryClientProps {
  initialInventory: InventoryDashboardRow[];
}

export function InventoryClient({ initialInventory }: InventoryClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [stockStatusFilter, setStockStatusFilter] =
    React.useState<string>("所有狀態");
  const [orderStatusFilter, setOrderStatusFilter] =
    React.useState<string>("所有狀態");
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof InventoryDashboardRow | null;
    direction: "ascending" | "descending" | null;
  }>({
    key: null,
    direction: null,
  });
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(
    new Set()
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const handleInventoryImport = () => {
    router.push("/upload?type=inventory");
  };

  const totalItems = initialInventory.length;
  const lowStockItems = initialInventory.filter(
    (item) => (item.remaining_days ?? 0) < 7
  ).length;

  const handleStockStatusFilter = (status: string) => {
    setStockStatusFilter(stockStatusFilter === status ? "所有狀態" : status);
  };

  const handleOrderStatusFilter = (status: string) => {
    setOrderStatusFilter(orderStatusFilter === status ? "所有狀態" : status);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStockStatusFilter("所有狀態");
    setOrderStatusFilter("所有狀態");
  };

  const requestSort = (key: keyof InventoryDashboardRow) => {
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
    let filteredData = [...initialInventory].map((item) => ({
      ...item,
      supplier_name: item.supplier_name || "未知廠商",
      remaining_days: item.remaining_days || 0,
      is_ordered: item.is_ordered !== undefined ? item.is_ordered : false,
    }));

    if (searchQuery) {
      filteredData = filteredData.filter(
        (item) =>
          item.supplier_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.product_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.model_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (stockStatusFilter !== "所有狀態") {
      filteredData = filteredData.filter((item) => {
        if (stockStatusFilter === "警告") return (item.remaining_days ?? 0) < 7;
        if (stockStatusFilter === "充足")
          return (item.remaining_days ?? 0) >= 7;
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
        const aValue = a[sortConfig.key as keyof InventoryDashboardRow];
        const bValue = b[sortConfig.key as keyof InventoryDashboardRow];

        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;

        // Handle string values
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle numeric values
        const aCompare = Number(aValue);
        const bCompare = Number(bValue);

        if (sortConfig.direction === "ascending") {
          return aCompare - bCompare;
        } else {
          return bCompare - aCompare;
        }
      });
    }

    return filteredData;
  }, [
    searchQuery,
    stockStatusFilter,
    orderStatusFilter,
    sortConfig,
    initialInventory,
  ]);

  const toggleItemSelection = (modelId: string) => {
    setSelectedItems((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(modelId)) {
        newSelected.delete(modelId);
      } else {
        newSelected.add(modelId);
      }
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredAndSortedData.length) {
      setSelectedItems(new Set());
    } else {
      const allModelIds = filteredAndSortedData.map(
        (item) => `${item.supplier_name}-${item.model_id}`
      );
      setSelectedItems(new Set(allModelIds));
    }
  };

  const getSelectedItemsData = () => {
    return filteredAndSortedData.filter((item) =>
      selectedItems.has(`${item.supplier_name}-${item.model_id}`)
    );
  };

  const handleBulkDelete = () => {
    alert(`已選擇 ${selectedItems.size} 個項目準備刪除`);
    setSelectedItems(new Set());
  };

  const hasActiveFilters =
    !!searchQuery ||
    stockStatusFilter !== "所有狀態" ||
    orderStatusFilter !== "所有狀態";

  return (
    <div className="flex flex-1 flex-col h-full w-full">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <InventoryHeader onInventoryImport={handleInventoryImport} />
          <InventorySummary
            totalItems={totalItems}
            lowStockItems={lowStockItems}
          />
          <InventoryFilterBar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            stockStatusFilter={stockStatusFilter}
            onStockStatusFilterChange={handleStockStatusFilter}
            orderStatusFilter={orderStatusFilter}
            onOrderStatusFilterChange={handleOrderStatusFilter}
            selectedItemsCount={selectedItems.size}
            onBulkOrder={() => setIsDialogOpen(true)}
            onBulkDelete={handleBulkDelete}
            onClearAllFilters={clearAllFilters}
            hasActiveFilters={hasActiveFilters}
          />
          <InventoryTable
            filteredAndSortedData={filteredAndSortedData}
            selectedItems={selectedItems}
            sortConfig={sortConfig}
            onToggleItemSelection={toggleItemSelection}
            onToggleSelectAll={toggleSelectAll}
            onRequestSort={requestSort}
            onStockStatusFilter={handleStockStatusFilter}
            onOrderStatusFilter={handleOrderStatusFilter}
            stockStatusFilter={stockStatusFilter}
            orderStatusFilter={orderStatusFilter}
          />
          <InventoryStatusExplanation />
        </div>
        <PurchaseImportDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          selectedItems={isDialogOpen ? getSelectedItemsData() : []}
        />
      </div>
    </div>
  );
}
