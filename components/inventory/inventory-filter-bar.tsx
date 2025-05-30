"use client";

import * as React from "react";
import { Search, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface InventoryFilterBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  stockStatusFilter: string;
  onStockStatusFilterChange: (status: string) => void;
  orderStatusFilter: string;
  onOrderStatusFilterChange: (status: string) => void;
  selectedItemsCount: number;
  onBulkOrder: () => void;
  onBulkDelete: () => void;
  onClearAllFilters: () => void;
  hasActiveFilters: boolean;
}

export function InventoryFilterBar({
  searchQuery,
  onSearchQueryChange,
  stockStatusFilter,
  onStockStatusFilterChange,
  orderStatusFilter,
  onOrderStatusFilterChange,
  selectedItemsCount,
  onBulkOrder,
  onBulkDelete,
  onClearAllFilters,
  hasActiveFilters,
}: InventoryFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center lg:px-6">
      <div className="flex items-center flex-1">
        <Search className="mr-2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜尋項目..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full max-w-sm h-10"
        />

        {selectedItemsCount > 0 && (
          <div className="flex gap-2 ml-4">
            <Button
              variant="default"
              size="sm"
              onClick={onBulkOrder}
              className="bg-[#08678C]"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              一鍵叫貨 ({selectedItemsCount})
            </Button>
            <Button variant="destructive" size="sm" onClick={onBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              刪除 ({selectedItemsCount})
            </Button>
          </div>
        )}
      </div>
      <div className="flex gap-3 items-end">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
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
            onValueChange={(value) =>
              onStockStatusFilterChange(value || "所有狀態")
            }
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
            onValueChange={(value) =>
              onOrderStatusFilterChange(value || "所有狀態")
            }
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
  );
}
