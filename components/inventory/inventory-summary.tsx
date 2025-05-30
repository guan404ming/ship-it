"use client";

import * as React from "react";
import { BoxIcon, PackageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InventorySummaryProps {
  totalItems: number;
  lowStockItems: number;
}

export function InventorySummary({
  totalItems,
  lowStockItems,
}: InventorySummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6">
      <Card className="border shadow-sm">
        <CardContent className="flex items-center p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#08678C]/10">
            <BoxIcon className="h-6 w-6 text-[#08678C]" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-muted-foreground">總庫存項目</p>
            <h2 className="text-3xl font-bold text-[#08678C]">{totalItems}</h2>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardContent className="flex items-center p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F27F3D]/10">
            <PackageIcon className="h-6 w-6 text-[#F27F3D]" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-muted-foreground">低庫存項目</p>
            <h2 className="text-3xl font-bold text-[#F27F3D]">
              {lowStockItems}
            </h2>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
