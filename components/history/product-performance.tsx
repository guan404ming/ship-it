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

interface ProductSalesData {
  id: string
  vendorCode: string
  productName: string
  productCategory: string
  spec: string
  data: Array<{
    date: string
    amount: number
    quantity: number
  }>
}

interface ProductPerformanceProps {
  productSalesData: ProductSalesData[]
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

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30d")
    }
  }, [isMobile])

  const productCategories = React.useMemo(() => {
    const categories = new Set(
      productSalesData.map((item) => item.productCategory)
    )
    return ["所有類別", ...Array.from(categories)]
  }, [productSalesData])

  // 過濾商品的邏輯已經移至表格渲染部分，這裡不再需要單獨的 filteredProducts

  // 將商品數據按productName分組
  const groupedProductsData = React.useMemo(() => {
    // 1. 按產品名稱進行分組
    const groupedByName = productSalesData.reduce((acc, product) => {
      const key = `${product.productName}-${product.productCategory}-${product.vendorCode}`;
      if (!acc[key]) {
        acc[key] = {
          id: key,
          vendorCode: product.vendorCode,
          productName: product.productName,
          productCategory: product.productCategory,
          models: []
        };
      }
      acc[key].models.push({
        id: product.id,
        spec: product.spec,
        data: product.data
      });
      return acc;
    }, {} as Record<string, {
      id: string;
      vendorCode: string;
      productName: string;
      productCategory: string;
      models: Array<{
        id: string;
        spec: string;
        data: Array<{
          date: string;
          amount: number;
          quantity: number;
        }>;
      }>;
    }>);

    // 2. 轉換為陣列形式
    return Object.values(groupedByName);
  }, [productSalesData]);

  // 合併相同日期的數據
  const selectedProductsData = React.useMemo(() => {
    if (selectedProducts.length === 0) return []

    const now = new Date("2025-05-01")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    } else if (timeRange === "180d") {
      daysToSubtract = 180
    }
    
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return groupedProductsData
      .filter(product => selectedProducts.includes(product.id))
      .map(product => {
        // 收集所有型號的數據並按日期合併
        const dateMap = new Map<string, { date: string, amount: number, quantity: number }>()

        product.models.forEach(model => {
          model.data
            .filter(item => new Date(item.date) >= startDate)
            .forEach(item => {
              if (dateMap.has(item.date)) {
                const existing = dateMap.get(item.date)!
                dateMap.set(item.date, {
                  date: item.date,
                  amount: existing.amount + item.amount,
                  quantity: existing.quantity + item.quantity
                })
              } else {
                dateMap.set(item.date, { ...item })
              }
            })
        })

        // 將合併後的數據轉為陣列
        return {
          ...product,
          filteredData: Array.from(dateMap.values()).sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        }
      })
  }, [selectedProducts, timeRange, groupedProductsData])

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
            
              </TableHead>
              <TableHead>廠商代碼</TableHead>
              <TableHead>產品分類</TableHead>
              <TableHead>產品名稱</TableHead>
              <TableHead>規格</TableHead>
              <TableHead className="text-right">最新銷售量</TableHead>
              <TableHead className="text-right">最新銷售額</TableHead>
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
                if (categoryFilter !== "所有類別" && product.productCategory !== categoryFilter) {
                  return false;
                }
                
                if (searchQuery) {
                  return product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.productCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.vendorCode.toLowerCase().includes(searchQuery.toLowerCase());
                }
                
                return true;
              }).map((product) => {
                const isSelected = selectedProducts.includes(product.id);
                // 計算產品所有規格的數據總和
                const totalLatestQuantity = product.models.reduce((sum, model) => {
                  const modelLatestData = model.data[model.data.length - 1];
                  return sum + modelLatestData.quantity;
                }, 0);
                
                const totalLatestAmount = product.models.reduce((sum, model) => {
                  const modelLatestData = model.data[model.data.length - 1];
                  return sum + modelLatestData.amount;
                }, 0);
                
                const modelsCount = product.models.length;
                
                return (
                  <TableRow key={product.id} className={isSelected ? "bg-muted/50" : ""}>
                    <TableCell>
                      <Checkbox
                        id={`product-table-${product.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProducts([...selectedProducts, product.id])
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{product.vendorCode}</TableCell>
                    <TableCell>{product.productCategory}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {product.productName}
                      {modelsCount > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => {
                            setSelectedProductForDetail(product.id);
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
                      {totalLatestQuantity}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      $ {totalLatestAmount.toLocaleString()}
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
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger 
                      className="ml-2 w-[150px]"
                      size="sm"
                      aria-label="Select time range"
                    >
                      <SelectValue placeholder="最近90天" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">最近7天</SelectItem>
                      <SelectItem value="30d">最近30天</SelectItem>
                      <SelectItem value="90d">最近90天</SelectItem>
                      <SelectItem value="180d">最近180天</SelectItem>
                    </SelectContent>
                  </Select>
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
                        name={product.productName}
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
          productName={groupedProductsData.find(p => p.id === selectedProductForDetail)?.productName || ""}
          productCategory={groupedProductsData.find(p => p.id === selectedProductForDetail)?.productCategory || ""}
          vendorCode={groupedProductsData.find(p => p.id === selectedProductForDetail)?.vendorCode || ""}
          models={groupedProductsData.find(p => p.id === selectedProductForDetail)?.models || []}
        />
      )}

      <div className="mt-6">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>商品表現說明</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              x 軸可選時間區間、顆粒度(月、日)<br />
              y 軸可選銷售額、銷售量<br />
              勾選商品可查看多個商品的銷售表現
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
