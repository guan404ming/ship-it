"use client";

import * as React from "react";
import { FileIcon, UploadIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseCSV, type CSVRow } from "@/lib/csv-parser";
import { upsertStockRecord } from "@/actions/stock_record";
import { getProductAndModelIdByName } from "@/actions/products";
import { toast } from "sonner";
import { createOrder } from "@/actions/orders";

interface FileUploadSectionProps {
  fileImportType: string | null;
  onFileImportTypeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUploadSection({
  fileImportType,
  onFileImportTypeChange,
}: FileUploadSectionProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [fileName, setFileName] = React.useState<string>("");
  const [csvHeaders, setCsvHeaders] = React.useState<string[]>([]);
  const [csvData, setCsvData] = React.useState<CSVRow[]>([]);
  const [columnTypes, setColumnTypes] = React.useState<Record<string, string>>(
    {}
  );
  const [csvError, setCsvError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = React.useState<boolean | null>(
    null
  );
  const [uploadMessage, setUploadMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const noteRef = React.useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      processCSVFile(selectedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".xlsx"))
    ) {
      processCSVFile(droppedFile);
    } else {
      setCsvError("請上傳 .csv 或 .xlsx 格式檔案");
    }
  };

  const processCSVFile = (file: File) => {
    setFile(file);
    setFileName(file.name);
    setCsvError(null);
    setIsProcessing(true);
    setCsvData([]);
    setCsvHeaders([]);

    if (file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const result = parseCSV(text);
          setCsvHeaders(result.headers);
          setCsvData(result.data);
          setColumnTypes(result.columnTypes);
          setCsvError(null);
        } catch (err) {
          console.error("CSV parsing error:", err);
          setCsvError(err instanceof Error ? err.message : "無法解析 CSV 檔案");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        console.error("FileReader error");
        setCsvError("讀取檔案時發生錯誤");
        setIsProcessing(false);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith(".xlsx")) {
      setCsvError("暫時不支援 Excel 檔案格式，請轉為 CSV 格式後再上傳");
      setIsProcessing(false);
    } else {
      setCsvError("不支援的檔案格式");
      setIsProcessing(false);
    }
  };

  const resetCsvData = () => {
    setFile(null);
    setFileName("");
    setCsvHeaders([]);
    setCsvData([]);
    setColumnTypes({});
    setCsvError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file || !fileImportType) {
      return;
    }

    setIsUploading(true);
    setUploadSuccess(null);
    setUploadMessage(null);

    try {
      if (fileImportType === "inventory") {
        await Promise.all(
          csvData.map(async (row) => {
            const { model_id } = await getProductAndModelIdByName(
              row["商品名稱"],
              row["商品規格"]
            );

            await upsertStockRecord(model_id, true, parseInt(row["數量"], 10));
          })
        );
        toast.success("成功更新庫存，共 " + csvData.length + " 筆");
      } else {
        const items = await Promise.all(
          csvData.map(async (row) => {
            const { product_id, model_id } = await getProductAndModelIdByName(
              row["商品名稱"],
              row["商品規格"]
            );
            return {
              product_id,
              model_id,
              quantity: parseInt(row["數量"], 10),
              returned_quantity: 0,
              sold_price: parseFloat(row["單價"]),
              total_price: parseFloat(row["單價"]) * parseInt(row["數量"], 10),
            };
          })
        );

        csvData.forEach(async (row, index) => {
          await createOrder({
            buyer_id: 1,
            product_total_price:
              parseFloat(row["單價"]) * parseInt(row["數量"], 10),
            shipping_fee: 0,
            total_paid: parseFloat(row["單價"]) * parseInt(row["數量"], 10),
            order_status: "pending",
            items: [items[index]],
          });
        });

        toast.success("成功建立訂單，共 " + csvData.length + " 筆");
      }
      setUploadSuccess(true);
      setUploadMessage("匯入成功！");
      resetCsvData();
      if (noteRef.current) {
        noteRef.current.value = "";
      }
    } catch (error) {
      console.error("上傳時發生錯誤:", error);
      setUploadSuccess(false);
      setUploadMessage("上傳過程中發生錯誤，請重試。");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="pt-3">
        <h3 className="text-xl font-medium mb-2">上傳檔案</h3>
        <div className="flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-2">
              <div className="flex items-center">
                <Input
                  type="radio"
                  id="order"
                  name="import-type-left"
                  value="order"
                  className="h-4 w-4"
                  onChange={onFileImportTypeChange}
                  checked={fileImportType === "order"}
                />
                <Label htmlFor="order" className="ml-2">
                  銷售匯入
                </Label>
              </div>
              <div className="flex items-center">
                <Input
                  type="radio"
                  id="inventory"
                  name="import-type-left"
                  value="inventory"
                  className="h-4 w-4"
                  onChange={onFileImportTypeChange}
                  checked={fileImportType === "inventory"}
                />
                <Label htmlFor="inventory" className="ml-2">
                  庫存匯入
                </Label>
              </div>
            </div>
          </div>

          <div
            className={`border border-dashed ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            } rounded-lg flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-gray-50`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center justify-center py-6">
              {!fileName ? (
                <>
                  <UploadIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-center">拖放檔案或點擊上傳</p>
                  <p className="text-xs text-muted-foreground">
                    支援 .xlsx, .csv 檔案格式
                  </p>
                </>
              ) : isProcessing ? (
                <>
                  <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                  <p className="text-sm font-medium text-center">{fileName}</p>
                  <p className="text-xs text-blue-500">正在處理檔案...</p>
                </>
              ) : (
                <div className="text-center">
                  <FileIcon className="h-10 w-10 text-blue-500 mb-2 mx-auto" />
                  <p className="text-sm font-medium">{fileName}</p>
                  <p className="text-xs text-blue-500 mb-2">
                    {csvData.length > 0
                      ? `已解析 ${csvData.length} 筆資料`
                      : "檔案已準備上傳"}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetCsvData();
                    }}
                    className="text-xs text-gray-500 underline hover:text-red-500"
                    type="button"
                  >
                    重新上傳
                  </button>
                </div>
              )}
            </div>
          </div>

          {csvError && (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 p-2 rounded">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{csvError}</p>
            </div>
          )}

          {csvData.length > 0 && (
            <div className="mt-4 border p-4 rounded-lg bg-blue-50">
              <h4 className="text-sm font-medium mb-2">
                資料預覽 ({csvData.length} 筆資料)
              </h4>
              <div className="max-h-60 overflow-auto border rounded bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {csvHeaders.map((header, index) => (
                        <TableHead key={index} className="text-xs">
                          <div>
                            <span className="font-semibold">{header}</span>
                            {columnTypes[header] && (
                              <span
                                className={`ml-1 text-[10px] px-1 py-0.5 rounded-sm ${
                                  columnTypes[header] === "數字"
                                    ? "bg-blue-50 text-blue-600"
                                    : columnTypes[header] === "日期"
                                      ? "bg-green-50 text-green-600"
                                      : "bg-gray-50 text-gray-600"
                                }`}
                              >
                                {columnTypes[header]}
                              </span>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 5).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {csvHeaders.map((header, cellIndex) => (
                          <TableCell
                            key={`${rowIndex}-${cellIndex}`}
                            className="text-xs py-2"
                          >
                            {row[header]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {csvData.length > 5 && (
                  <div className="text-center p-2 text-xs text-gray-500">
                    顯示前 5 筆資料，共 {csvData.length} 筆
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500 mt-4">
            <h4 className="font-medium">備註</h4>
            <Textarea
              ref={noteRef}
              placeholder="請輸入此次匯入的相關資訊..."
              className="w-full h-[184px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground mt-2 min-h-[80px]"
            />
          </div>

          <Button
            className="w-full"
            type="button"
            onClick={handleFileSubmit}
            disabled={
              !fileName ||
              csvError !== null ||
              !fileImportType ||
              csvData.length === 0 ||
              isUploading
            }
          >
            {isUploading ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                上傳中...
              </>
            ) : (
              "確認上傳"
            )}
          </Button>

          {uploadSuccess !== null && (
            <div
              className={`mt-3 p-2 rounded text-center ${
                uploadSuccess
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {uploadMessage}
            </div>
          )}

          {fileName && !csvError && csvData.length === 0 && !isProcessing && (
            <div className="text-center p-4 border rounded bg-gray-50 mt-4">
              <p className="text-sm text-gray-600">
                尚未發現資料或檔案格式可能不正確。
                <br />
                請確保您上傳的是有效的 CSV 檔案。
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
