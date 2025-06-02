"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { InventoryDashboardRow } from "@/lib/types";
import dayjs from "dayjs";

interface InventoryTableProps {
  filteredAndSortedData: InventoryDashboardRow[];
  selectedItems: Set<string>;
  sortConfig: {
    key: keyof InventoryDashboardRow | null;
    direction: "ascending" | "descending" | null;
  };
  onToggleItemSelection: (modelId: string) => void;
  onToggleSelectAll: () => void;
  onRequestSort: (key: keyof InventoryDashboardRow) => void;
  onStockStatusFilter: (status: string) => void;
  onOrderStatusFilter: (status: string) => void;
  stockStatusFilter: string;
  orderStatusFilter: string;
}

export function InventoryTable({
  filteredAndSortedData,
  selectedItems,
  sortConfig,
  onToggleItemSelection,
  onToggleSelectAll,
  onRequestSort,
  onStockStatusFilter,
  onOrderStatusFilter,
  stockStatusFilter,
  orderStatusFilter,
}: InventoryTableProps) {
  return (
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
                  onCheckedChange={onToggleSelectAll}
                  aria-label="全選"
                />
              </TableHead>
              <TableHead>廠商名稱</TableHead>
              <TableHead>商品名稱</TableHead>
              <TableHead>規格</TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => onRequestSort("stock_quantity")}
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
                onClick={() => onRequestSort("remaining_days")}
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
              <TableRow key={`${item.supplier_name}-${item.model_id}`}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.has(
                      `${item.supplier_name}-${item.model_id}`
                    )}
                    onCheckedChange={() =>
                      onToggleItemSelection(
                        `${item.supplier_name}-${item.model_id}`
                      )
                    }
                  />
                </TableCell>
                <TableCell>{item.supplier_name ?? "-"}</TableCell>
                <TableCell>{item.product_name ?? "-"}</TableCell>
                <TableCell>{item.model_name ?? "-"}</TableCell>
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
                      ((item.remaining_days ?? 0) >= 7 ? "充足" : "警告")
                        ? "ring-2 ring-offset-1"
                        : ""
                    }`}
                    onClick={() =>
                      onStockStatusFilter(
                        (item.remaining_days ?? 0) >= 7 ? "充足" : "警告"
                      )
                    }
                  >
                    {(item.remaining_days ?? 0) >= 7 ? "充足" : "警告"}
                  </span>
                </TableCell>
                <TableCell
                  className={`text-right font-mono ${
                    (item.remaining_days ?? 0) < 7
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
                      orderStatusFilter ===
                      (item.is_ordered ? "已叫貨" : "未叫貨")
                        ? "ring-2 ring-offset-1"
                        : ""
                    }`}
                    onClick={() =>
                      onOrderStatusFilter(item.is_ordered ? "已叫貨" : "未叫貨")
                    }
                  >
                    {item.is_ordered ? "已叫貨" : "未叫貨"}
                  </span>
                </TableCell>
                <TableCell>
                  {dayjs(item.last_updated).format("YYYY-MM-DD HH:mm")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
