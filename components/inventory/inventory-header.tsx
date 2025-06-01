"use client";

import * as React from "react";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InventoryHeaderProps {
  onInventoryImport: () => void;
}

export function InventoryHeader({ onInventoryImport }: InventoryHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 lg:px-6">
      <h1 className="text-3xl font-semibold">我的庫存</h1>
      <div className="flex gap-3">
        <Button
          onClick={onInventoryImport}
          variant="default"
          size="sm"
          className="h-10 px-4"
        >
          <FileUp className="mr-2 h-4 w-4" />
          庫存匯入
        </Button>
      </div>
    </div>
  );
}
