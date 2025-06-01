"use client";

import * as React from "react";
import { FileIcon, UploadIcon, AlertCircle } from "lucide-react";
import { IconFileImport } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ImportHistory } from "@/lib/types";
import { importHistory as mockImportHistory } from "@/lib/data/import-data";

// CSV parsing types
interface CSVRow {
  [key: string]: string;
}

// Create a client component that uses useSearchParams
function UploadContent() {
  const searchParams = useSearchParams();
  const [fileImportType, setFileImportType] = React.useState<string | null>(
    null
  );
  const [manualImportType, setManualImportType] = React.useState<string | null>(
    null
  );

  // Add validation state
  const [price, setPrice] = React.useState<string>("");
  const [productCode, setProductCode] = React.useState<string>("");
  const [productName, setProductName] = React.useState<string>("");
  const [modelName, setModelName] = React.useState<string>("");
  const [priceError, setPriceError] = React.useState<string | null>(null);
  const [modelNameError, setModelNameError] = React.useState<string | null>(
    null
  );

  // 新增的商品規格列表
  const [models, setModels] = React.useState<
    Array<{
      id: string;
      modelName: string;
      quantity: string;
      error: string | null;
    }>
  >([]);

  // CSV 相關狀態
  const [file, setFile] = React.useState<File | null>(null);
  const [fileName, setFileName] = React.useState<string>("");
  // csvHeaders 和 csvData 用於存儲 CSV 檔案的標頭和資料
  const [csvHeaders, setCsvHeaders] = React.useState<string[]>([]);
  const [csvData, setCsvData] = React.useState<CSVRow[]>([]);
  const [columnTypes, setColumnTypes] = React.useState<Record<string, string>>({});
  const [csvError, setCsvError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 檢查 URL 參數，自動選擇「庫存匯入」
  React.useEffect(() => {
    const type = searchParams.get("type");
    if (type === "inventory") {
      setFileImportType("single"); // 設定檔案上傳為「庫存匯入」
      setManualImportType("single"); // 設定手動輸入為「庫存匯入」
    }
  }, [searchParams]);

  // 處理檔案匯入類型選擇
  const handleFileImportTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFileImportType(event.target.value);
  };

  // CSV 處理相關功能
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
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      processCSVFile(droppedFile);
    } else {
      setCsvError('請上傳 .csv 或 .xlsx 格式檔案');
    }
  };

  const processCSVFile = (file: File) => {
    setFile(file);
    setFileName(file.name);
    setCsvError(null);
    setIsProcessing(true);
    setCsvData([]);
    setCsvHeaders([]);

    if (file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          parseCSV(text);
        } catch (err) {
          console.error('File reading error:', err);
          setCsvError('無法讀取檔案內容');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        console.error('FileReader error');
        setCsvError('讀取檔案時發生錯誤');
        setIsProcessing(false);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx')) {
      setCsvError('暫時不支援 Excel 檔案格式，請轉為 CSV 格式後再上傳');
      setIsProcessing(false);
    } else {
      setCsvError('不支援的檔案格式');
      setIsProcessing(false);
    }
  };

  // Reset CSV data
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

  // Helper to detect delimiter in CSV
  const detectDelimiter = (text: string): string => {
    const firstLine = text.split(/\r?\n/)[0];
    const delimiters = [',', ';', '\t'];
    let bestDelimiter = ',';
    let maxCount = 0;

    delimiters.forEach(delimiter => {
      const count = (firstLine.split(delimiter).length - 1);
      if (count > maxCount) {
        maxCount = count;
        bestDelimiter = delimiter;
      }
    });

    console.log('Detected delimiter:', bestDelimiter, 'with count:', maxCount);
    return bestDelimiter;
  };

  // Function signature kept for reference (implementation is below)
  // const cleanValue = (value: string): string => { ... };

  // Helper to detect column data type
  const detectColumnType = (values: string[]): string => {
    let hasNumbers = 0;
    let hasNonNumbers = 0;
    let hasDate = 0;
    
    for (const value of values) {
      if (!value.trim()) continue; // Skip empty cells
      
      // Check if it's a date (matches common date formats)
      if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(value) || 
          /^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/.test(value) ||
          /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2}$/.test(value)) {
        hasDate++;
        continue;
      }
      
      // Check if it's a number
      if (!isNaN(Number(value))) {
        hasNumbers++;
      } else {
        hasNonNumbers++;
      }
    }
    
    // Determine most likely type
    if (hasDate > Math.max(hasNumbers, hasNonNumbers)) {
      return '日期';
    } else if (hasNumbers > 0 && hasNonNumbers === 0) {
      return '數字';
    } else {
      return '文字';
    }
  };

  // 解析單行CSV，正確處理引號和逗號
  const parseCSVLine = (line: string, delimiter: string): string[] => {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = i + 1 < line.length ? line[i + 1] : '';
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // 處理連續兩個引號 - 表示轉義的引號
          currentValue += '"';
          i++; // 跳過下一個引號
        } else {
          // 切換引號狀態
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // 只有在不在引號內時才視為分隔符
        values.push(cleanValue(currentValue));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // 添加最後一個值
    values.push(cleanValue(currentValue));
    
    return values;
  };

  // Helper to clean CSV values - 升級版，處理更複雜的情況
  const cleanValue = (value: string): string => {
    // 移除前後空格
    let cleaned = value.trim();
    
    // 移除開頭和結尾的引號（只有當它們成對出現時）
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    
    // 處理轉義的引號 ("") -> (")
    cleaned = cleaned.replace(/""/g, '"');
    
    // 移除值開頭和末尾的多餘逗號
    cleaned = cleaned.replace(/^,+/, ''); // 移除開頭的逗號
    cleaned = cleaned.replace(/,+$/, ''); // 移除末尾的逗號
    
    return cleaned;
  };

  const parseCSV = (csvText: string) => {
    try {
      console.log('CSV Text to parse:', csvText.substring(0, 200) + '...');
      
      // 移除 UTF-8 BOM (Byte Order Mark)，這在從 Excel 導出的 CSV 中很常見
      let cleanedText = csvText;
      if (csvText.charCodeAt(0) === 0xFEFF) {
        cleanedText = csvText.substring(1);
        console.log('BOM detected and removed');
      }
      
      // 預處理文本，解決一些常見的CSV問題
      cleanedText = cleanedText
        .replace(/\r\n?/g, '\n')          // 統一換行符號為 \n
        .replace(/,,+/g, ',')             // 替換連續多個逗號為單一逗號
        .replace(/^,|,$/gm, '');          // 移除每行開頭和結尾的逗號
      
      // 檢測分隔符
      const delimiter = detectDelimiter(cleanedText);
      console.log('Detected delimiter:', delimiter);
      
      // 分割行 - 必須考慮引號內換行的情況
      const lines: string[] = [];
      let currentLine = '';
      let inQuotes = false;
      
      // 逐字符處理文本，處理引號內的換行符
      for (let i = 0; i < cleanedText.length; i++) {
        const char = cleanedText[i];
        const nextChar = i + 1 < cleanedText.length ? cleanedText[i + 1] : '';
        
        if (char === '"') {
          // 檢查是否為轉義的引號 ("")
          if (nextChar === '"') {
            currentLine += '"'; // 添加一個引號並跳過下一個
            i++;
          } else {
            inQuotes = !inQuotes; // 切換引號狀態
            currentLine += char;
          }
        } else if (char === '\n' && !inQuotes) {
          // 只有在不在引號內時才將當前行添加到行列表中
          if (currentLine.trim()) {
            lines.push(currentLine);
          }
          currentLine = '';
        } else {
          currentLine += char;
        }
      }
      
      // 添加最後一行
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      
      console.log('Number of lines after processing:', lines.length);
      
      if (lines.length === 0) {
        setCsvError('CSV 檔案沒有內容');
        return;
      }

      // 解析標頭 - 需要正確處理帶引號的標頭
      const headers = parseCSVLine(lines[0], delimiter);
      console.log('Headers found:', headers);
      setCsvHeaders(headers);

      // 解析資料行
      const parsedData: CSVRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i], delimiter);
        
        console.log(`Values for row ${i}:`, values);
        
        if (values.length !== headers.length) {
          console.warn(`Skipping row ${i} due to column count mismatch: expected ${headers.length}, got ${values.length}`, values);
          continue; // 跳過不符合標頭長度的行
        }
        
        const dataRow: CSVRow = {};
        headers.forEach((header, index) => {
          dataRow[header] = values[index];
        });
        parsedData.push(dataRow);
      }

      console.log('Parsed data count:', parsedData.length);
      if (parsedData.length > 0) {
        console.log('First row sample:', parsedData[0]);
      }

      setCsvData(parsedData);
      setCsvError(null);

      // 檢查解析的數據是否合理
      if (parsedData.length === 0) {
        setCsvError('解析後沒有有效資料行');
        return;
      }

      // 檢測並存儲每列的數據類型
      const columnTypes: {[key: string]: string} = {};
      headers.forEach(header => {
        const columnValues = parsedData.map(row => row[header]);
        columnTypes[header] = detectColumnType(columnValues);
      });
      setColumnTypes(columnTypes);
      
      console.log('Column types detected:', columnTypes);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setCsvError(`解析 CSV 時發生錯誤: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Handler for manual import type selection
  const handleManualImportTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setManualImportType(event.target.value);
  };

  // Import history data from centralized location
  // TODO: [前後端溝通] 前端需要從後端獲取匯入歷史資料，目前使用假資料
  const [importHistory] = React.useState<ImportHistory[]>(mockImportHistory);

  // Validation handlers

  const validateModelQuantity = (id: string, value: string) => {
    const updatedModels = models.map((model) => {
      if (model.id === id) {
        let error: string | null = null;
        if (value) {
          const numberValue = parseInt(value, 10);
          if (
            isNaN(numberValue) ||
            !Number.isInteger(numberValue) ||
            numberValue <= 0 ||
            value.includes(".")
          ) {
            error = "請輸入正整數";
          }
        }
        return { ...model, quantity: value, error };
      }
      return model;
    });
    setModels(updatedModels);
  };

  const validatePrice = (value: string) => {
    setPrice(value);

    if (!value) {
      setPriceError(null);
      return;
    }

    const numberValue = parseFloat(value);
    if (isNaN(numberValue) || numberValue <= 0) {
      setPriceError("請輸入大於0的數字");
    } else {
      setPriceError(null);
    }
  };

  // 新增規格
  const addModel = () => {
    if (!modelName.trim()) return;

    // 檢查是否有重複的規格名稱
    const trimmedModelName = modelName.trim();
    const isDuplicate = models.some(
      (model) =>
        model.modelName.toLowerCase() === trimmedModelName.toLowerCase()
    );

    if (isDuplicate) {
      setModelNameError("此規格名稱已存在");
      return;
    }

    const newId = `model-${Date.now()}`;
    setModels([
      ...models,
      { id: newId, modelName: trimmedModelName, quantity: "", error: null },
    ]);
    setModelName("");
    setModelNameError(null);
  };

  // 刪除規格
  const removeModel = (id: string) => {
    setModels(models.filter((model) => model.id !== id));
  };

  // 上傳狀態追蹤
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = React.useState<boolean | null>(null);
  const [uploadMessage, setUploadMessage] = React.useState<string | null>(null);
  const noteRef = React.useRef<HTMLTextAreaElement>(null);

  // 檔案上傳處理
  const handleFileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!file || !fileImportType) {
      return;
    }
    
    // 開始上傳
    setIsUploading(true);
    setUploadSuccess(null);
    setUploadMessage(null);
    
    try {
      // 準備 FormData 進行上傳
      const formData = new FormData();
      formData.append('file', file);
      formData.append('importType', fileImportType);
      formData.append('parsedData', JSON.stringify(csvData));
      
      // 加入備註資訊（如果有的話）
      if (noteRef.current?.value) {
        formData.append('note', noteRef.current.value);
      }
      
      // 發送請求到後端 API
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 處理成功
        setUploadSuccess(true);
        setUploadMessage(result.message || "匯入成功！");
        
        // 成功後重置表單，讓使用者可以進行下一次上傳
        setTimeout(() => {
          resetCsvData();
          if (noteRef.current) {
            noteRef.current.value = "";
          }
        }, 3000);
        
      } else {
        // 處理失敗
        setUploadSuccess(false);
        setUploadMessage(result.message || "匯入失敗，請重試。");
      }
    } catch (error) {
      console.error('上傳時發生錯誤:', error);
      setUploadSuccess(false);
      setUploadMessage("上傳過程中發生錯誤，請重試。");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Main Content */}
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-semibold mb-4">資料匯入</h1>

          <Tabs defaultValue="import" className="w-full">
            <TabsList className="w-fit mb-4">
              <TabsTrigger value="import">匯入資料</TabsTrigger>
              <TabsTrigger value="history">匯入歷史</TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* File Upload Section */}
                <Card className="border shadow-sm">
                  <CardContent className="pt-3">
                    <h3 className="text-xl font-medium mb-2">上傳檔案</h3>
                    <div className="flex flex-col justify-between gap-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-2">
                          <div className="flex items-center">
                            <Input
                              type="radio"
                              id="batch-import"
                              name="import-type-left"
                              value="batch"
                              className="h-4 w-4"
                              onChange={handleFileImportTypeChange}
                              checked={fileImportType === "batch"}
                            />
                            <Label htmlFor="batch-import" className="ml-2">
                              銷售匯入
                            </Label>
                          </div>
                          <div className="flex items-center">
                            <Input
                              type="radio"
                              id="single-import"
                              name="import-type-left"
                              value="single"
                              className="h-4 w-4"
                              onChange={handleFileImportTypeChange}
                              checked={fileImportType === "single"}
                            />
                            <Label htmlFor="single-import" className="ml-2">
                              庫存匯入
                            </Label>
                          </div>
                        </div>
                        
                      </div>

                      <div 
                        className={`border border-dashed ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-gray-50`}
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
                              <p className="text-sm text-center">
                                拖放檔案或點擊上傳
                              </p>
                              <p className="text-xs text-muted-foreground">
                                支援 .xlsx, .csv 檔案格式
                              </p>
                            </>
                          ) : isProcessing ? (
                            <>
                              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                              <p className="text-sm font-medium text-center">{fileName}</p>
                              <p className="text-xs text-blue-500">
                                正在處理檔案...
                              </p>
                            </>
                          ) : (
                            <div className="text-center">
                              <FileIcon className="h-10 w-10 text-blue-500 mb-2 mx-auto" />
                              <p className="text-sm font-medium">{fileName}</p>
                              <p className="text-xs text-blue-500 mb-2">
                                {csvData.length > 0 ? `已解析 ${csvData.length} 筆資料` : '檔案已準備上傳'}
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

                      {/* CSV 預覽區 - 增強可見度 */}
                      {csvData.length > 0 && (
                        <div className="mt-4 border p-4 rounded-lg bg-blue-50">
                          <h4 className="text-sm font-medium mb-2">資料預覽 ({csvData.length} 筆資料)</h4>
                          <div className="max-h-60 overflow-auto border rounded bg-white">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {csvHeaders.map((header, index) => (
                                    <TableHead key={index} className="text-xs">
                                      <div>
                                        <span className="font-semibold">{header}</span>
                                        {columnTypes[header] && (
                                          <span className={`ml-1 text-[10px] px-1 py-0.5 rounded-sm ${
                                            columnTypes[header] === '數字' 
                                              ? 'bg-blue-50 text-blue-600' 
                                              : columnTypes[header] === '日期' 
                                                ? 'bg-green-50 text-green-600' 
                                                : 'bg-gray-50 text-gray-600'
                                          }`}>
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
                        disabled={!fileName || csvError !== null || !fileImportType || csvData.length === 0 || isUploading}
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
                        <div className={`mt-3 p-2 rounded text-center ${uploadSuccess ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
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

                {/* Manual Input Section */}
                <Card className="border shadow-sm">
                  <CardContent className="pt-3">
                    <h3 className="text-xl font-medium mb-2">手動輸入</h3>
                    <div className="flex flex-col justify-between gap-4">
                      <div className="flex gap-2 mb-2">
                        <div className="flex items-center">
                          <Input
                            type="radio"
                            id="batch-manual"
                            name="import-type-right"
                            value="batch"
                            className="h-4 w-4"
                            onChange={handleManualImportTypeChange}
                            checked={manualImportType === "batch"}
                          />
                          <Label htmlFor="batch-manual" className="ml-2">
                            銷售匯入
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Input
                            type="radio"
                            id="single-manual"
                            name="import-type-right"
                            value="single"
                            className="h-4 w-4"
                            onChange={handleManualImportTypeChange}
                            checked={manualImportType === "single"}
                          />
                          <Label htmlFor="single-manual" className="ml-2">
                            庫存匯入
                          </Label>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <div className="grid gap-1.5">
                          <Label htmlFor="product-code">貨品編號</Label>
                          <Input
                            id="product-code"
                            placeholder="請輸入貨品編號"
                            value={productCode}
                            onChange={(e) => setProductCode(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="item-name">商品名稱</Label>
                          <Input
                            id="item-name"
                            placeholder="請輸入商品名稱"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="item-name">商品規格</Label>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                placeholder="請輸入規格名稱"
                                value={modelName}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setModelName(value);

                                  // 當使用者輸入時，檢查是否有重複的規格名稱
                                  const trimmedValue = value.trim();
                                  if (trimmedValue) {
                                    const isDuplicate = models.some(
                                      (model) =>
                                        model.modelName.toLowerCase() ===
                                        trimmedValue.toLowerCase()
                                    );
                                    setModelNameError(
                                      isDuplicate ? "此規格名稱已存在" : null
                                    );
                                  } else {
                                    setModelNameError(null);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    modelName.trim() &&
                                    !modelNameError
                                  ) {
                                    e.preventDefault();
                                    addModel();
                                  }
                                }}
                                className={
                                  modelNameError ? "border-red-500" : ""
                                }
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={addModel}
                              disabled={
                                !modelName.trim() || modelNameError !== null
                              }
                            >
                              新增規格
                            </Button>
                          </div>
                          {modelNameError && (
                            <p className="text-sm text-red-500">
                              {modelNameError}
                            </p>
                          )}
                        </div>

                        {/* 規格輸入區 */}
                        <div className="rounded-lg border p-4">
                          {models.length > 0 && (
                            <div className="space-y-3 mt-2">
                              <div className="grid grid-cols-5 gap-2 text-sm text-muted-foreground font-medium">
                                <div className="col-span-3">規格名稱</div>
                                <div className="col-span-1">數量</div>
                                <div className="col-span-1"></div>
                              </div>

                              {models.map((model) => (
                                <div
                                  key={model.id}
                                  className="grid grid-cols-5 gap-2 items-center"
                                >
                                  <div className="col-span-3 text-sm">
                                    {model.modelName}
                                  </div>
                                  <div className="col-span-1">
                                    <Input
                                      type="number"
                                      min="1"
                                      placeholder="數量"
                                      value={model.quantity}
                                      onChange={(e) =>
                                        validateModelQuantity(
                                          model.id,
                                          e.target.value
                                        )
                                      }
                                      className={
                                        model.error ? "border-red-500" : ""
                                      }
                                    />
                                    {model.error && (
                                      <p className="text-sm text-red-500 mt-1">
                                        {model.error}
                                      </p>
                                    )}
                                  </div>
                                  <div className="col-span-1 flex justify-end">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeModel(model.id)}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M3 6h18"></path>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                      </svg>
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {models.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-3">
                              尚未新增任何規格
                            </p>
                          )}
                        </div>

                        {manualImportType !== "single" && (
                          <div className="grid gap-1.5">
                            <Label htmlFor="price">價格</Label>
                            <Input
                              id="price"
                              placeholder="請輸入價格"
                              className={priceError ? "border-red-500" : ""}
                              value={price}
                              onChange={(e) => validatePrice(e.target.value)}
                            />
                            {priceError && (
                              <p className="text-sm text-red-500">
                                {priceError}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-gray-500">
                        <h4 className="font-medium">備註</h4>
                        <Textarea
                          placeholder="請輸入此次匯入的相關資訊..."
                          className="mt-2"
                        />
                      </div>

                      <Button className="w-full" type="submit">
                        {/* TODO: 前端需要將手動輸入的商品資料送到後端 */}
                        確認輸入
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Import Guidelines */}
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
                        所需欄位包含: 商品編號、規格資訊、數量、批號。
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
            </TabsContent>

            <TabsContent value="history">
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
                              className={`px-2 py-1 rounded-md  font-medium ${
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps the client component in a Suspense boundary
export default function InventoryClient() {
  return (
    <div className="flex flex-1 flex-col h-full w-full">
      <React.Suspense fallback={<div className="p-4">Loading...</div>}>
        <UploadContent />
      </React.Suspense>
    </div>
  );
}
