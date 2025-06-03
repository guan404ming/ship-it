"use client";

import * as React from "react";
import { FileIcon } from "lucide-react";
import { IconFileImport } from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";

export function ImportGuidelines() {
  return (
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
              所需欄位包含: 商品名稱、規格、數量。
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
  );
}
