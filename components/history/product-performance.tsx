"use client"

import * as React from "react"
import { LineChart, Line, XAxis, CartesianGrid, Legend } from "recharts"
import { Search } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useIsMobile } from "@/hooks/use-mobile"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

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

  const filteredProducts = React.useMemo(() => {
    return productSalesData.filter(product => {
      if (categoryFilter !== "所有類別" && product.productCategory !== categoryFilter) {
        return false
      }
      
      if (searchQuery) {
        return product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.productCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.spec.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.vendorCode.toLowerCase().includes(searchQuery.toLowerCase())
      }
      
      return true
    })
  }, [searchQuery, categoryFilter, productSalesData])

  const selectedProductsData = React.useMemo(() => {
    if (selectedProducts.length === 0) return []
    
    return productSalesData
      .filter(product => selectedProducts.includes(product.id))
      .map(product => ({
        ...product,
        filteredData: product.data.filter(item => {
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
          
          const date = new Date(item.date)
          return date >= startDate
        })
      }))
  }, [selectedProducts, timeRange, productSalesData])

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
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  無符合條件的商品
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = selectedProducts.includes(product.id);
                const latestData = product.data[product.data.length - 1];
                
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
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.spec}</TableCell>
                    <TableCell className="text-right font-mono">
                      {latestData.quantity}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      $ {latestData.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedProducts.length > 0 && (
        <div className="mt-6">
          <Card className="border shadow-sm @container/card">
            <CardHeader>
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <CardTitle>商品銷售表現</CardTitle>
                  <CardDescription>
                    已選取 {selectedProducts.length} 個商品
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
                        name={`${product.productName} (${product.spec})`}
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
