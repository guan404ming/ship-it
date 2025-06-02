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
import { ImportHistory as ImportHistoryType } from "@/lib/types";

interface ImportHistoryProps {
  importHistory: ImportHistoryType[];
}

export function ImportHistory({ importHistory }: ImportHistoryProps) {
  return (
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
                    className={`px-2 py-1 rounded-md font-medium ${
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
  );
}
