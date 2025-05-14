"use client"

import * as React from "react"
import { LineChart, Line, XAxis, CartesianGrid, Legend } from "recharts"
import { Search, ExternalLink } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useIsMobile } from "@/hooks/use-mobile"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ProductDetailDialog } from "./product-detail-dialog"
import { 
  getDateRange as getDateRangeUtil
} from "@/lib/date-utils"
import { SalesData } from "@/lib/types"
import { getGrowthComparisonPeriods, calculateGrowthRate } from "@/lib/date-utils"

// Local wrapper functions for type compatibility with our utility functions
function getProductDateRangeData(product: GroupedProduct, startDate: Date, endDate: Date): SalesData[] {
  // Only process if models exist
  if (!product.models) return [];
  
  const dateMap = new Map<string, { date: string, amount: number, quantity: number }>();

  product.models.forEach(model => {
    model.data
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      })
      .forEach(item => {
        if (dateMap.has(item.date)) {
          const existing = dateMap.get(item.date)!;
          dateMap.set(item.date, {
            date: item.date,
            amount: existing.amount + item.amount,
            quantity: existing.quantity + item.quantity
          });
        } else {
          dateMap.set(item.date, { ...item });
        }
      });
  });

  return Array.from(dateMap.values()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

function calculateProductGrowthRates(
  product: GroupedProduct,
  timeRange: string,
  customDateRange: { start: string, end: string } | null,
  referenceDate: Date = new Date("2025-05-01")
): { quantityGrowth?: number, amountGrowth?: number } {
  if (!product.models) return {};
  
  // 獲取比較期間
  const {
    currentPeriodStart,
    currentPeriodEnd,
    previousPeriodStart,
    previousPeriodEnd
  } = getGrowthComparisonPeriods(timeRange, customDateRange, referenceDate);
  
  // 獲取所有產品數據
  const allData = product.models.flatMap(model => model.data);
  
  // 將數據分為兩個區間
  const currentPeriodData = allData.filter(item => {
    const date = new Date(item.date);
    return date >= currentPeriodStart && date <= currentPeriodEnd;
  });
  
  const previousPeriodData = allData.filter(item => {
    const date = new Date(item.date);
    return date >= previousPeriodStart && date <= previousPeriodEnd;
  });
  
  // 計算當前區間和前一區間的總量
  const currentQuantity = currentPeriodData.reduce((sum, item) => sum + item.quantity, 0);
  const previousQuantity = previousPeriodData.reduce((sum, item) => sum + item.quantity, 0);
  
  const currentAmount = currentPeriodData.reduce((sum, item) => sum + item.amount, 0);
  const previousAmount = previousPeriodData.reduce((sum, item) => sum + item.amount, 0);
  
  // 計算成長率
  const quantityGrowth = calculateGrowthRate(currentQuantity, previousQuantity);
  const amountGrowth = calculateGrowthRate(currentAmount, previousAmount);
  
  return { quantityGrowth, amountGrowth };
}

// Local interface for how this component uses the data
interface ProductModel {
  id: string;
  model_name: string;
  data: SalesData[];
}

interface GroupedProduct {
  id: string;
  sku: string;
  product_name: string;
  category_name: string;
  models: ProductModel[];
}

interface FlatProduct {
  id: string | number;
  sku: string;
  product_name: string;
  category_name: string;
  model_name?: string;
  data?: SalesData[];
}

interface ProductPerformanceProps {
  productSalesData: FlatProduct[]
}

const chartConfig = {
  amount: {
    label: "銷售額",
    color: "hsl(12, 76%, 61%)",
  },
  quantity: {
    label: "銷售量",
    color: "hsl(173, 58%, 39%)",
  }
} satisfies ChartConfig

export function ProductPerformance({ productSalesData }: ProductPerformanceProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const [chartType, setChartType] = React.useState("amount")
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("所有類別")
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false)
  const [selectedProductForDetail, setSelectedProductForDetail] = React.useState<string | null>(null)
  const [customDateRange, setCustomDateRange] = React.useState<{start: string, end: string} | null>(null)

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30d")
    }
  }, [isMobile])

  const productCategories = React.useMemo(() => {
    const categories = new Set(
      productSalesData.map((item) => item.category_name)
    )
    return ["所有類別", ...Array.from(categories)]
  }, [productSalesData])


  const groupedProductsData = React.useMemo(() => {
    // 1. 按產品名稱進行分組
    const groupedByName = productSalesData.reduce((acc, product) => {
      const key = `${product.product_name}-${product.category_name}-${product.sku}`;
      if (!acc[key]) {
        acc[key] = {
          id: key,
          sku: product.sku, // Changed from vendorCode
          product_name: product.product_name, // Changed from productName
          category_name: product.category_name, // Changed from productCategory
          models: []
        };
      }
      acc[key].models.push({
        id: product.id.toString(),
        model_name: product.model_name || "",
        data: product.data || []
      });
      return acc;
    }, {} as Record<string, GroupedProduct>);

    // 2. 轉換為陣列形式
    return Object.values(groupedByName);
  }, [productSalesData]);

  // 計算日期範圍
  const getDateRange = React.useCallback(() => {
    const now = new Date("2025-05-01");
    return getDateRangeUtil(timeRange, customDateRange, now);
  }, [timeRange, customDateRange]);

  // 合併相同日期的數據
  const selectedProductsData = React.useMemo(() => {
    if (selectedProducts.length === 0) return [];

    const { startDate, endDate } = getDateRange();

    return groupedProductsData
      .filter(product => selectedProducts.includes(product.id))
      .map(product => {
        return {
          ...product,
          filteredData: getProductDateRangeData(product, startDate, endDate)
        }
      });
  }, [selectedProducts, groupedProductsData, getDateRange]);

  return (
    <div className="flex flex-col gap-4">
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
            <Select value={timeRange} onValueChange={(value) => {
              setTimeRange(value);
              if (value !== "custom") {
                setCustomDateRange(null);
              } else if (value === "custom" && !customDateRange) {
                // 如果選擇自訂範圍但尚未設定日期，則設定默認值
                const now = new Date("2025-05-01");
                const startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 30); // 默認為最近30天
                
                setCustomDateRange({
                  start: startDate.toISOString().split('T')[0],
                  end: now.toISOString().split('T')[0]
                });
              }
            }}>
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
                  onChange={(e) => setCustomDateRange(prev => ({
                    start: e.target.value,
                    end: prev?.end || new Date().toISOString().split('T')[0]
                  }))}
                />
                <span>到</span>
                <Input
                  type="date"
                  className="w-[130px]"
                  value={customDateRange?.end || ""}
                  onChange={(e) => setCustomDateRange(prev => ({
                    start: prev?.start || "2024-01-01",
                    end: e.target.value
                  }))}
                />
              </div>
            )}
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger 
              className="w-[150px]"
              size="sm"
              aria-label="Select category"
            >
              <SelectValue placeholder="所有類別" />
            </SelectTrigger>
            <SelectContent>
              {productCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          {(searchQuery || categoryFilter !== "所有類別") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("所有類別");
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
                  checked={selectedProducts.length === groupedProductsData.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedProducts(groupedProductsData.map(product => product.id.toString()));
                    } else {
                      setSelectedProducts([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>廠商代碼</TableHead>
              <TableHead>產品分類</TableHead>
              <TableHead>產品名稱</TableHead>
              <TableHead>規格</TableHead>
              <TableHead className="text-right">期間銷售量 (成長率)</TableHead>
              <TableHead className="text-right">期間銷售額 (成長率)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedProductsData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  無符合條件的商品
                </TableCell>
              </TableRow>
            ) : (
              groupedProductsData.filter(product => {
                if (categoryFilter !== "所有類別" && product.category_name !== categoryFilter) {
                  return false;
                }
                
                if (searchQuery) {
                  return product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.sku.toLowerCase().includes(searchQuery.toLowerCase());
                }
                
                return true;
              }).map((product) => {
                const isSelected = selectedProducts.includes(product.id);
                const { startDate, endDate } = getDateRange();
                
                // 計算所選時間範圍內產品所有規格的數據總和
                const salesData = getProductDateRangeData(product, startDate, endDate);
                
                const totalQuantity = salesData.reduce((sum, item) => sum + item.quantity, 0);
                const totalAmount = salesData.reduce((sum, item) => sum + item.amount, 0);

                // 使用工具函數計算成長率
                const { quantityGrowth, amountGrowth } = calculateProductGrowthRates(
                  product, 
                  timeRange, 
                  customDateRange
                );
                
                const modelsCount = product.models?.length || 0;
                
                return (
                  <TableRow key={product.id} className={isSelected ? "bg-muted/50" : ""}>
                    <TableCell>
                      <Checkbox
                        id={`product-table-${product.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProducts([...selectedProducts, product.id.toString()])
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category_name}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {product.product_name}
                      {modelsCount > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => {
                            setSelectedProductForDetail(product.id.toString());
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
                        <span>{totalQuantity}</span>
                        {quantityGrowth !== undefined && (
                          <span 
                            className={`ml-2 text-xs ${quantityGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {quantityGrowth >= 0 ? '↑' : '↓'} {Math.abs(quantityGrowth)}%
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <div className="flex items-center justify-end">
                        <span>$ {totalAmount.toLocaleString()}</span>
                        {amountGrowth !== undefined && (
                          <span 
                            className={`ml-2 text-xs ${amountGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {amountGrowth >= 0 ? '↑' : '↓'} {Math.abs(amountGrowth)}%
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>        {selectedProducts.length > 0 && (
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
                      const date = new Date(value)
                      return date.toLocaleDateString("zh-TW", {
                        month: "numeric",
                        day: "numeric",
                      })
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
                          })
                        }}
                        indicator="dot"
                      />
                    }
                  />
                  <Legend />
                  {selectedProductsData.map((product, index) => {
                    const colors = [
                      "#ff6b6b", "#4ecdc4", "#45b7d8", "#ffa94d", 
                      "#a3a1fb", "#f06595", "#38d9a9", "#748ffc"
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                      <Line
                        key={`${product.id}-${chartType}`}
                        data={product.filteredData}
                        type="monotone"
                        dataKey={chartType}
                        stroke={color}
                        name={product.product_name}
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
          product_name={groupedProductsData.find(p => p.id === selectedProductForDetail)?.product_name || ""}
          category_name={groupedProductsData.find(p => p.id === selectedProductForDetail)?.category_name || ""}
          sku={groupedProductsData.find(p => p.id === selectedProductForDetail)?.sku || ""}
          models={groupedProductsData.find(p => p.id === selectedProductForDetail)?.models || []}
        />
      )}

      <div className="mt-6">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>商品表現說明與使用指南</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              時間範圍：可選擇預設時間區間（7天、30天、90天、180天），或設定自訂日期範圍<br />
              數據選擇：可選擇顯示銷售額或銷售量<br />
              商品比較：勾選多個商品可同時比較其銷售表現<br />
              規格詳情：點擊「查看 X 種規格」可比較同一產品的不同規格
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
