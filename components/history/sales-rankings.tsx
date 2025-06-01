"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import { RankingProduct } from "@/lib/types"

interface SalesRankingProps {
  productRankingData: RankingProduct[]
}

interface AggregatedProduct {
  id: string;
  product_id: number;
  product_name: string;
  model_name: string;
  sales: number;
  quantity: number;
  growth?: number;
  specifications: number;
}

export function SalesRankings({ productRankingData }: SalesRankingProps) {
  const [timeRange, setTimeRange] = React.useState("90d")
  const [rankingMetric, setRankingMetric] = React.useState<"sales" | "quantity">("sales")
  const [customDateRange, setCustomDateRange] = React.useState<{start: string, end: string} | null>(null)

  // 聚合相同產品的不同型號
  const aggregatedData = React.useMemo(() => {
    const aggregatedMap = new Map<string, AggregatedProduct>();

    productRankingData.forEach(product => {
      // 使用 product_name 作為聚合鍵，如果為 null 則跳過
      if (!product.product_name) return;
      
      const key = product.product_name;
      
      if (aggregatedMap.has(key)) {
        const existing = aggregatedMap.get(key)!;
        aggregatedMap.set(key, {
          ...existing,
          sales: existing.sales + product.sales,
          quantity: existing.quantity + product.quantity,
          specifications: existing.specifications + 1,
          // 保持最高的成長率
          growth: Math.max(existing.growth || 0, product.growth || 0)
        });
      } else {
        aggregatedMap.set(key, {
          id: `${product.product_id}-${product.product_name}`,
          product_id: product.product_id,
          product_name: product.product_name,
          model_name: product.model_name || "未知型號",
          sales: product.sales,
          quantity: product.quantity,
          growth: product.growth,
          specifications: 1
        });
      }
    });

    return Array.from(aggregatedMap.values());
  }, [productRankingData]);

  // 依選擇的指標排序
  const topSalesList = React.useMemo(() => {
    return [...aggregatedData]
      .sort((a, b) => rankingMetric === 'sales' 
        ? b.sales - a.sales 
        : b.quantity - a.quantity)
      .slice(0, 5);
  }, [aggregatedData, rankingMetric]);
  
  const bottomSalesList = React.useMemo(() => {
    return [...aggregatedData]
      .sort((a, b) => rankingMetric === 'sales' 
        ? a.sales - b.sales 
        : a.quantity - b.quantity)
      .slice(0, 5);
  }, [aggregatedData, rankingMetric]);
  
  // 依成長率排序
  const topGrowthList = React.useMemo(() => {
    return [...aggregatedData]
      .filter(product => product.growth !== undefined && product.growth !== null)
      .sort((a, b) => (b.growth || 0) - (a.growth || 0))
      .slice(0, 5);
  }, [aggregatedData]);
  
  const bottomGrowthList = React.useMemo(() => {
    return [...aggregatedData]
      .filter(product => product.growth !== undefined && product.growth !== null)
      .sort((a, b) => (a.growth || 0) - (b.growth || 0))
      .slice(0, 5);
  }, [aggregatedData]);

  return (
    <>
      {/* 時間範圍和指標選擇器 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
        <div className="flex flex-1 items-center">
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(value: string) => {
              setTimeRange(value);
              if (value !== "custom") {
                setCustomDateRange(null);
              } else if (value === "custom" && !customDateRange) {
                // 設定自定義範圍的默認值
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
              <TableHead>商品ID</TableHead>
              <TableHead>商品名稱</TableHead>
              <TableHead>型號</TableHead>
              <TableHead>規格數</TableHead>
              <TableHead>{rankingMetric === "sales" ? "銷售額" : "銷售量"}</TableHead>
              <TableHead>成長率</TableHead>
            </TableRow></TableHeader><TableBody>
              {topSalesList.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.product_id}</TableCell>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{product.model_name}</TableCell>
                  <TableCell>{product.specifications}</TableCell>
                  <TableCell>
                    {rankingMetric === "sales" 
                      ? `$${product.sales.toLocaleString()}` 
                      : product.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {product.growth !== undefined && product.growth !== null && (
                      <span className={product.growth >= 0 ? "text-green-600" : "text-red-600"}>
                        {product.growth >= 0 ? "↑" : "↓"} {Math.abs(product.growth)}%
                      </span>
                    )}
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
              <TableHead>商品ID</TableHead>
              <TableHead>商品名稱</TableHead>
              <TableHead>型號</TableHead>
              <TableHead>規格數</TableHead>
              <TableHead>{rankingMetric === "sales" ? "銷售額" : "銷售量"}</TableHead>
              <TableHead>成長率</TableHead>
            </TableRow></TableHeader><TableBody>
              {bottomSalesList.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.product_id}</TableCell>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{product.model_name}</TableCell>
                  <TableCell>{product.specifications}</TableCell>
                  <TableCell>
                    {rankingMetric === "sales" 
                      ? `$${product.sales.toLocaleString()}` 
                      : product.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {product.growth !== undefined && product.growth !== null && (
                      <span className={product.growth >= 0 ? "text-green-600" : "text-red-600"}>
                        {product.growth >= 0 ? "↑" : "↓"} {Math.abs(product.growth)}%
                      </span>
                    )}
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
              <TableHead>商品ID</TableHead>
              <TableHead>商品名稱</TableHead>
              <TableHead>型號</TableHead>
              <TableHead>規格數</TableHead>
              <TableHead>{rankingMetric === "sales" ? "銷售額" : "銷售量"}</TableHead>
              <TableHead>成長率</TableHead>
            </TableRow></TableHeader><TableBody>
              {topGrowthList.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.product_id}</TableCell>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{product.model_name}</TableCell>
                  <TableCell>{product.specifications}</TableCell>
                  <TableCell>
                    {rankingMetric === "sales" 
                      ? `$${product.sales.toLocaleString()}` 
                      : product.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-green-600">
                    ↑ {Math.abs(product.growth || 0)}%
                  </TableCell>
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
              <TableHead>商品ID</TableHead>
              <TableHead>商品名稱</TableHead>
              <TableHead>型號</TableHead>
              <TableHead>規格數</TableHead>
              <TableHead>{rankingMetric === "sales" ? "銷售額" : "銷售量"}</TableHead>
              <TableHead>成長率</TableHead>
            </TableRow></TableHeader><TableBody>
              {bottomGrowthList.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.product_id}</TableCell>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{product.model_name}</TableCell>
                  <TableCell>{product.specifications}</TableCell>
                  <TableCell>
                    {rankingMetric === "sales" 
                      ? `$${product.sales.toLocaleString()}` 
                      : product.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-red-600">
                    ↓ {Math.abs(product.growth || 0)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>銷售排名說明</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              時間範圍：可選擇預設時間區間（7天、30天、90天、180天），或設定自訂日期範圍<br />
              數據選擇：可切換銷售額或銷售量來檢視不同指標的排名<br />
              成長率計算：成長率表示該商品在所選時間區間與前一個相同長度時間區間相比的變化率<br />
              規格數：表示同一商品下不同規格的數量
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
