"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface SalesRankingProps {
  productRankingData: {
    id: string
    vendorCode: string
    productName: string
    productCategory: string
    spec: string
    sales: number
    quantity?: number
    growth?: number
    returns?: number
    date?: string
  }[]
}

export function SalesRankings({ productRankingData }: SalesRankingProps) {
  const [timeRange, setTimeRange] = React.useState("90d")
  const [rankingMetric, setRankingMetric] = React.useState<"sales" | "quantity">("sales")
  const [customDateRange, setCustomDateRange] = React.useState<{start: string, end: string} | null>(null)

  // Calculate date range based on selected time range
  const getDateRange = React.useCallback(() => {
    const now = new Date("2025-05-01")
    let startDate: Date
    let endDate = new Date(now)
    
    if (customDateRange) {
      startDate = new Date(customDateRange.start)
      endDate = new Date(customDateRange.end)
    } else {
      let daysToSubtract = 90
      if (timeRange === "30d") {
        daysToSubtract = 30
      } else if (timeRange === "7d") {
        daysToSubtract = 7
      } else if (timeRange === "180d") {
        daysToSubtract = 180
      } else if (timeRange === "all") {
        daysToSubtract = 365 * 2 // Assume max 2 years of data
      }
      
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - daysToSubtract)
    }
    
    return { startDate, endDate }
  }, [timeRange, customDateRange])

  // Filter data by time range and aggregate across specifications
  const filteredAndAggregatedData = React.useMemo(() => {
    const { startDate, endDate } = getDateRange()
    
    // Filter by date if date property is available
    const filteredData = productRankingData.filter(product => {
      if (!product.date) return true // Include products with no date
      const productDate = new Date(product.date)
      return productDate >= startDate && productDate <= endDate
    })

    // Aggregate data across specifications
    const aggregatedMap = new Map<string, {
      id: string,
      vendorCode: string,
      productName: string,
      productCategory: string,
      sales: number,
      quantity: number,
      growth?: number,
      specifications: number
    }>()

    filteredData.forEach(product => {
      // Create a unique key for products ignoring specification
      const key = `${product.vendorCode}-${product.productName}-${product.productCategory}`
      
      if (aggregatedMap.has(key)) {
        const existing = aggregatedMap.get(key)!
        aggregatedMap.set(key, {
          ...existing,
          sales: existing.sales + product.sales,
          quantity: existing.quantity + (product.quantity || 0),
          specifications: existing.specifications + 1,
          // Use highest growth for the aggregated product
          growth: Math.max(existing.growth || 0, product.growth || 0)
        })
      } else {
        aggregatedMap.set(key, {
          id: key,
          vendorCode: product.vendorCode,
          productName: product.productName,
          productCategory: product.productCategory,
          sales: product.sales,
          quantity: product.quantity || 0,
          growth: product.growth,
          specifications: 1
        })
      }
    })

    return Array.from(aggregatedMap.values())
  }, [productRankingData, getDateRange])

  // Sorted lists based on selected metric
  const topSalesList = React.useMemo(() => {
    return [...filteredAndAggregatedData]
      .sort((a, b) => rankingMetric === 'sales' 
        ? b.sales - a.sales 
        : b.quantity - a.quantity)
      .slice(0, 5)
  }, [filteredAndAggregatedData, rankingMetric])
  
  const bottomSalesList = React.useMemo(() => {
    return [...filteredAndAggregatedData]
      .sort((a, b) => rankingMetric === 'sales' 
        ? a.sales - b.sales 
        : a.quantity - b.quantity)
      .slice(0, 5)
  }, [filteredAndAggregatedData, rankingMetric])
  
  const topGrowthList = React.useMemo(() => {
    return [...filteredAndAggregatedData]
      .filter(product => product.growth !== undefined)
      .sort((a, b) => (b.growth || 0) - (a.growth || 0))
      .slice(0, 5)
  }, [filteredAndAggregatedData])
  
  const bottomGrowthList = React.useMemo(() => {
    return [...filteredAndAggregatedData]
      .filter(product => product.growth !== undefined)
      .sort((a, b) => (a.growth || 0) - (b.growth || 0))
      .slice(0, 5)
  }, [filteredAndAggregatedData])

  return (
    <>
      {/* Time Range and Metric Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
        <div className="flex flex-1 items-center">
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(value) => {
              setTimeRange(value);
              if (value !== "custom") {
                setCustomDateRange(null);
              } else if (value === "custom" && !customDateRange) {
                // Set default values for custom range
                const now = new Date("2025-05-01");
                const startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 30);
                
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
        </div>
        
        <div className="flex items-center">
          <ToggleGroup
            type="single"
            value={rankingMetric}
            onValueChange={(value) => value && setRankingMetric(value as "sales" | "quantity")}
            variant="outline"
          >
            <ToggleGroupItem value="sales">銷售額</ToggleGroupItem>
            <ToggleGroupItem value="quantity">銷售量</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>{rankingMetric === "sales" ? "銷售額" : "銷售量"}最高前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow>
              <TableHead>廠商</TableHead>
              <TableHead>品名</TableHead>
              <TableHead>產品分類</TableHead>
              <TableHead>規格數</TableHead>
              <TableHead>{rankingMetric === "sales" ? "銷售額" : "銷售量"}</TableHead>
            </TableRow></TableHeader><TableBody>
              {topSalesList.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.vendorCode}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.productCategory}</TableCell>
                  <TableCell>{product.specifications}</TableCell>
                  <TableCell>
                    {rankingMetric === "sales" 
                      ? `$${product.sales.toLocaleString()}` 
                      : product.quantity.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>{rankingMetric === "sales" ? "銷售額" : "銷售量"}最低前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow>
              <TableHead>廠商</TableHead>
              <TableHead>品名</TableHead>
              <TableHead>產品分類</TableHead>
              <TableHead>規格數</TableHead>
              <TableHead>{rankingMetric === "sales" ? "銷售額" : "銷售量"}</TableHead>
            </TableRow></TableHeader><TableBody>
              {bottomSalesList.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.vendorCode}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.productCategory}</TableCell>
                  <TableCell>{product.specifications}</TableCell>
                  <TableCell>
                    {rankingMetric === "sales" 
                      ? `$${product.sales.toLocaleString()}` 
                      : product.quantity.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>成長率最高前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow>
              <TableHead>廠商</TableHead>
              <TableHead>品名</TableHead>
              <TableHead>產品分類</TableHead>
              <TableHead>規格數</TableHead>
              <TableHead>成長率</TableHead>
            </TableRow></TableHeader><TableBody>
              {topGrowthList.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.vendorCode}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.productCategory}</TableCell>
                  <TableCell>{product.specifications}</TableCell>
                  <TableCell className="text-green-600">↑ {product.growth}%</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>成長率最低前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow>
              <TableHead>廠商</TableHead>
              <TableHead>品名</TableHead>
              <TableHead>產品分類</TableHead>
              <TableHead>規格數</TableHead>
              <TableHead>成長率</TableHead>
            </TableRow></TableHeader><TableBody>
              {bottomGrowthList.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.vendorCode}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.productCategory}</TableCell>
                  <TableCell>{product.specifications}</TableCell>
                  <TableCell className="text-red-600">↓ {Math.abs(product.growth || 0)}%</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
