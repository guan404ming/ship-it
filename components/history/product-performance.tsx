"use client";

import * as React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  Search,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProductDetailDialog } from "./product-detail-dialog";
import { getDateRange as getDateRangeUtil } from "@/lib/date-utils";
import { GroupedProductSales } from "@/lib/types";
import {
  getProductDateRangeData,
  calculateProductGrowthRates,
} from "@/lib/product-utils";
import dayjs from "dayjs";

interface ProductPerformanceProps {
  productSalesData: GroupedProductSales[];
}

// 定義排序類型
type SortField = "quantity" | "quantityGrowth" | "amount" | "amountGrowth";
type SortDirection = "asc" | "desc";

interface SortableProduct extends GroupedProductSales {
  totalQuantity: number;
  totalAmount: number;
  quantityGrowth?: number;
  amountGrowth?: number;
}

const chartConfig = {
  amount: {
    label: "銷售額",
    color: "hsl(12, 76%, 61%)",
  },
  quantity: {
    label: "銷售量",
    color: "hsl(173, 58%, 39%)",
  },
} satisfies ChartConfig;

export function ProductPerformance({
  productSalesData,
}: ProductPerformanceProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [chartType, setChartType] = React.useState("amount");
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] =
    React.useState<string | null>(null);
  const [customDateRange, setCustomDateRange] = React.useState<{
    start: string;
    end: string;
  } | null>(null);

  // 排序狀態
  const [sortField, setSortField] = React.useState<SortField>("quantity");
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection>("desc");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30d");
    }
  }, [isMobile]);

  const groupedProductsData = React.useMemo(() => {
    // The data is already properly grouped by product with models
    return productSalesData;
  }, [productSalesData]);

  // 計算日期範圍
  const getDateRange = React.useCallback(() => {
    const now = dayjs();
    return getDateRangeUtil(timeRange, customDateRange, now.toDate());
  }, [timeRange, customDateRange]);

  // 合併相同日期的數據
  const selectedProductsData = React.useMemo(() => {
    if (selectedProducts.length === 0) return [];

    const { startDate, endDate } = getDateRange();
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    return groupedProductsData
      .filter((product) =>
        selectedProducts.includes(product.product_id.toString())
      )
      .map((product) => {
        // 用 dayjs 處理日期過濾
        const filteredData = getProductDateRangeData(
          product,
          start.toDate(),
          end.toDate()
        );
        return {
          ...product,
          filteredData,
        };
      });
  }, [selectedProducts, groupedProductsData, getDateRange]);

  // 排序處理函數
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      // 如果點擊相同欄位，切換排序方向
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // 如果點擊不同欄位，設定新欄位並預設為降序
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // 產生排序圖標
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  // 處理和排序產品數據
  const processedAndSortedProducts = React.useMemo(() => {
    const { startDate, endDate } = getDateRange();
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    // 處理數據並計算總和和成長率
    const processedProducts = groupedProductsData
      .filter((model) => model.models?.length > 0)
      .filter((product) => {
        if (searchQuery) {
          return product.product_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
        }
        return true;
      })
      .map((product) => {
        // 用 dayjs 處理日期過濾
        const salesData = getProductDateRangeData(
          product,
          start.toDate(),
          end.toDate()
        );
        const totalQuantity = salesData.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const totalAmount = salesData.reduce(
          (sum, item) => sum + item.amount,
          0
        );

        // 使用工具函數計算成長率，referenceDate 用 endDate
        const { quantityGrowth, amountGrowth } = calculateProductGrowthRates(
          product,
          timeRange,
          customDateRange,
          end.toDate()
        );

        return {
          ...product,
          totalQuantity,
          totalAmount,
          quantityGrowth,
          amountGrowth,
        } as SortableProduct;
      });

    // 根據選定欄位和方向排序
    return [...processedProducts].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "quantity":
          comparison = a.totalQuantity - b.totalQuantity;
          break;
        case "amount":
          comparison = a.totalAmount - b.totalAmount;
          break;
        case "quantityGrowth":
          // 處理 undefined 情況
          const growthA = a.quantityGrowth ?? -Infinity;
          const growthB = b.quantityGrowth ?? -Infinity;
          comparison = growthA - growthB;
          break;
        case "amountGrowth":
          const amountGrowthA = a.amountGrowth ?? -Infinity;
          const amountGrowthB = b.amountGrowth ?? -Infinity;
          comparison = amountGrowthA - amountGrowthB;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [
    groupedProductsData,
    getDateRange,
    searchQuery,
    sortField,
    sortDirection,
    timeRange,
    customDateRange,
  ]);

  return (
    <div className="flex flex-col gap-4">
      {/* 搜尋與篩選器 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center flex-1">
          <Search className="mr-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋商品..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-sm h-10"
          />
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2">
            <Select
              value={timeRange}
              onValueChange={(value) => {
                setTimeRange(value);
                if (value !== "custom") {
                  setCustomDateRange(null);
                } else if (value === "custom" && !customDateRange) {
                  // 如果選擇自訂範圍但尚未設定日期，則設定默認值
                  const now = dayjs().toDate();
                  const startDate = dayjs().subtract(30, "day").toDate();

                  setCustomDateRange({
                    start: startDate.toISOString().split("T")[0],
                    end: now.toISOString().split("T")[0],
                  });
                }
              }}
            >
              <SelectTrigger
                className="w-[150px]"
                size="sm"
                aria-label="選擇時間範圍"
              >
                <SelectValue placeholder="最近90天" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">最近7天</SelectItem>
                <SelectItem value="30d">最近30天</SelectItem>
                <SelectItem value="90d">最近90天</SelectItem>
                <SelectItem value="180d">最近180天</SelectItem>
                <SelectItem value="all">全部時間</SelectItem>
                <SelectItem value="custom">自訂時間範圍</SelectItem>
              </SelectContent>
            </Select>

            {timeRange === "custom" && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="w-[130px]"
                  value={customDateRange?.start || ""}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({
                      start: e.target.value,
                      end: prev?.end || new Date().toISOString().split("T")[0],
                    }))
                  }
                />
                <span>到</span>
                <Input
                  type="date"
                  className="w-[130px]"
                  value={customDateRange?.end || ""}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({
                      start: prev?.start || "2024-01-01",
                      end: e.target.value,
                    }))
                  }
                />
              </div>
            )}
          </div>

          {selectedProducts.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedProducts([])}
              className="h-10"
            >
              取消選取 ({selectedProducts.length})
            </Button>
          )}
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
              }}
              className="h-10"
            >
              清除篩選
            </Button>
          )}
        </div>
      </div>

      {/* 商品數據表格 */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  id="product-table-all"
                  checked={
                    selectedProducts.length === groupedProductsData.length
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedProducts(
                        groupedProductsData.map((product) =>
                          product.product_id.toString()
                        )
                      );
                    } else {
                      setSelectedProducts([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>商品名稱</TableHead>
              <TableHead>規格</TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSortChange("quantity")}
              >
                <div className="flex items-center justify-end">
                  期間銷售量
                  {getSortIcon("quantity")}
                </div>
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSortChange("quantityGrowth")}
              >
                <div className="flex items-center justify-end">
                  成長率
                  {getSortIcon("quantityGrowth")}
                </div>
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSortChange("amount")}
              >
                <div className="flex items-center justify-end">
                  期間銷售額
                  {getSortIcon("amount")}
                </div>
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSortChange("amountGrowth")}
              >
                <div className="flex items-center justify-end">
                  成長率
                  {getSortIcon("amountGrowth")}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedAndSortedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  無符合條件的商品
                </TableCell>
              </TableRow>
            ) : (
              processedAndSortedProducts.map((product) => {
                const isSelected = selectedProducts.includes(
                  product.product_id.toString()
                );
                const modelsCount = product.models?.length || 0;

                return (
                  <TableRow
                    key={product.product_id}
                    className={isSelected ? "bg-muted/50" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        id={`product-table-${product.product_id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProducts([
                              ...selectedProducts,
                              product.product_id.toString(),
                            ]);
                          } else {
                            setSelectedProducts(
                              selectedProducts.filter(
                                (id) => id !== product.product_id.toString()
                              )
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{product.product_id}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {product.product_name}
                      {modelsCount > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => {
                            setSelectedProductForDetail(
                              product.product_id.toString()
                            );
                            setDetailDialogOpen(true);
                          }}
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          查看 {modelsCount} 種規格
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>{modelsCount} 種規格</TableCell>
                    <TableCell className="text-right font-mono">
                      <div className="flex items-center justify-end">
                        <span>{product.totalQuantity}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {product.quantityGrowth !== undefined && (
                        <span
                          className={`ml-2 text-xs ${product.quantityGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {product.quantityGrowth >= 0 ? "↑" : "↓"}{" "}
                          {Math.abs(product.quantityGrowth)}%
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <div className="flex items-center justify-end">
                        <span>$ {product.totalAmount.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {product.amountGrowth !== undefined && (
                        <span
                          className={`ml-2 text-xs ${product.amountGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {product.amountGrowth >= 0 ? "↑" : "↓"}{" "}
                          {Math.abs(product.amountGrowth)}%
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 已選取商品的圖表 */}
      {selectedProducts.length > 0 && (
        <div className="mt-6">
          <Card className="border shadow-sm @container/card">
            <CardHeader>
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <CardTitle>商品銷售表現</CardTitle>
                  <CardDescription>
                    已選取 {selectedProducts.length} 個商品（所有規格加總）
                  </CardDescription>
                </div>
                <div className="flex items-center">
                  <ToggleGroup
                    type="single"
                    value={chartType}
                    onValueChange={setChartType}
                    variant="outline"
                    className="hidden @[767px]/card:flex"
                  >
                    <ToggleGroupItem value="amount">銷售額</ToggleGroupItem>
                    <ToggleGroupItem value="quantity">銷售量</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[300px] w-full"
              >
                <LineChart>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    allowDuplicatedCategory={false}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("zh-TW", {
                        month: "numeric",
                        day: "numeric",
                      });
                    }}
                  />
                  <YAxis
                    label={{
                      value: chartType === "amount" ? "銷售額" : "銷售量",
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle" },
                    }}
                    tickFormatter={(value) => {
                      if (chartType === "amount") {
                        if (value >= 10000) {
                          return `$${(value / 1000).toFixed(0)}k`;
                        }
                        return `$${value}`;
                      }
                      return value.toString();
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("zh-TW", {
                            month: "long",
                            day: "numeric",
                          });
                        }}
                        indicator="dot"
                      />
                    }
                  />
                  <Legend />
                  {selectedProductsData.map((product, index) => {
                    const colors = [
                      "#ff6b6b",
                      "#4ecdc4",
                      "#45b7d8",
                      "#ffa94d",
                      "#a3a1fb",
                      "#f06595",
                      "#38d9a9",
                      "#748ffc",
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <Line
                        key={`${product.product_id}-${chartType}`}
                        data={product.filteredData}
                        type="monotone"
                        dataKey={chartType}
                        stroke={color}
                        name={product.product_name || "未知商品"}
                        strokeWidth={2}
                      />
                    );
                  })}
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 詳細規格比較對話框 */}
      {selectedProductForDetail && (
        <ProductDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          product_name={
            groupedProductsData.find(
              (p) => p.product_id.toString() === selectedProductForDetail
            )?.product_name || ""
          }
          category_name={""}
          sku={selectedProductForDetail || ""}
          models={
            groupedProductsData.find(
              (p) => p.product_id.toString() === selectedProductForDetail
            )?.models || []
          }
        />
      )}

      <div className="mt-6">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>商品表現說明與使用指南</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              時間範圍：可選擇預設時間區間（7天、30天、90天、180天），或設定自訂日期範圍
              <br />
              數據選擇：可選擇顯示銷售額或銷售量
              <br />
              排序功能：點擊表格標題可按期間銷售量、期間銷售額或各自的成長率進行排序
              <br />
              商品比較：勾選多個商品可同時比較其銷售表現
              <br />
              規格詳情：點擊「查看 X 種規格」可比較同一商品的不同規格
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
