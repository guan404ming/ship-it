"use client";

import * as React from "react";

export function InventoryStatusExplanation() {
  return (
    <div className="px-4 lg:px-6 mt-2 mb-8">
      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-medium mb-2">庫存狀態說明</h3>
        <ul className="text-sm space-y-1">
          <li>• 剩餘天數的計算方式為目前的庫存量除以過去 30 天的日均銷售量 </li>
          <li>• 剩餘天數小於 7 天的商品將被標記為「警告」狀態</li>
          <li>• 剩餘天數大於或等於 7 天的商品將被標記為「充足」狀態</li>
          <li>• 低庫存項目的統計基於剩餘天數小於 7 天的商品數量</li>
        </ul>
      </div>
    </div>
  );
}
