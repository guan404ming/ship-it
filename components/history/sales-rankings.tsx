"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { getDateRange as getDateRangeUtil, calculateGrowthRate } from "@/lib/date-utils"

import { RankingProduct } from "@/lib/types"

interface SalesRankingProps {
  productRankingData: RankingProduct[]
}

/**
 * 計算商品在兩個時間段的銷售和數量總和
 */
function calculatePeriodTotals(
  products: RankingProduct[], 
  key: string,  // 唯一商品鍵
  currentPeriodStart: Date, 
  currentPeriodEnd: Date,
  previousPeriodStart: Date,
  previousPeriodEnd: Date
): {
  currentSales: number,
  previousSales: number,
  currentQuantity: number,
  previousQuantity: number
} {
  // 篩選當前期間商品
  const currentProducts = products.filter(p => {
    if (!p.date) return false;
    const date = new Date(p.date);
    return date >= currentPeriodStart && date <= currentPeriodEnd &&
           `${p.sku}-${p.product_name}-${p.category_name}` === key;
  });
  
  // 篩選前一期間商品
  const previousProducts = products.filter(p => {
    if (!p.date) return false;
    const date = new Date(p.date);
    return date >= previousPeriodStart && date <= previousPeriodEnd &&
           `${p.sku}-${p.product_name}-${p.category_name}` === key;
  });
  
  // 計算當前期間總和
  const currentSales = currentProducts.reduce((sum, product) => sum + product.sales, 0);
  const currentQuantity = currentProducts.reduce((sum, product) => sum + (product.quantity || 0), 0);
  
  // 計算前一期間總和
  const previousSales = previousProducts.reduce((sum, product) => sum + product.sales, 0);
  const previousQuantity = previousProducts.reduce((sum, product) => sum + (product.quantity || 0), 0);
  
  return {
    currentSales,
    previousSales,
    currentQuantity,
    previousQuantity
  };
}

export function SalesRankings({ productRankingData }: SalesRankingProps) {
  const [timeRange, setTimeRange] = React.useState("90d")
  const [rankingMetric, setRankingMetric] = React.useState<"sales" | "quantity">("sales")
  const [customDateRange, setCustomDateRange] = React.useState<{start: string, end: string} | null>(null)

  // 計算日期範圍
  const getDateRange = React.useCallback(() => {
    const now = new Date("2025-05-01");
    return getDateRangeUtil(timeRange, customDateRange, now);
  }, [timeRange, customDateRange]);

  // 計算比較期間
  const getComparisonPeriods = React.useCallback(() => {
    const now = new Date("2025-05-01");
    
    // 獲取基本天數
    let days = timeRange === "7d" ? 7 : 
               timeRange === "30d" ? 30 : 
               timeRange === "90d" ? 90 : 
               timeRange === "180d" ? 180 : 
               timeRange === "all" ? 365 * 2 : 90;
    
    // 如果是自定義區間，計算天數
    if (timeRange === "custom" && customDateRange) {
      const start = new Date(customDateRange.start);
      const end = new Date(customDateRange.end);
      days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    // 當前區間
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - days);
    const currentPeriodEnd = new Date(now);
    
    // 前一個區間
    const previousPeriodEnd = new Date(currentPeriodStart);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);
    
    return {
      currentPeriodStart,
      currentPeriodEnd,
      previousPeriodStart,
      previousPeriodEnd
    };
  }, [timeRange, customDateRange]);

  // 過濾數據並按商品聚合
  const filteredAndAggregatedData = React.useMemo(() => {
    const { startDate, endDate } = getDateRange();
    const {
      currentPeriodStart,
      currentPeriodEnd,
      previousPeriodStart,
      previousPeriodEnd
    } = getComparisonPeriods();
    
    // 依日期篩選數據
    const filteredData = productRankingData.filter(product => {
      if (!product.date) return true; // 包含沒有日期的商品
      const productDate = new Date(product.date);
      return productDate >= startDate && productDate <= endDate;
    });

    // 按商品聚合
    const aggregatedMap = new Map<string, {
      id: string,
      sku: string,
      product_name: string,
      category_name: string,
      sales: number,
      quantity: number,
      salesGrowth?: number,
      quantityGrowth?: number,
      specifications: number
    }>();

    filteredData.forEach(product => {
      // 創建唯一鍵，忽略規格
      const key = `${product.sku}-${product.product_name}-${product.category_name}`;
      
      // 計算兩個時間段的總和
      const totals = calculatePeriodTotals(
        productRankingData,
        key,
        currentPeriodStart,
        currentPeriodEnd,
        previousPeriodStart,
        previousPeriodEnd
      );
      
      // 計算成長率
      const salesGrowth = calculateGrowthRate(totals.currentSales, totals.previousSales);
      const quantityGrowth = calculateGrowthRate(totals.currentQuantity, totals.previousQuantity);
      
      if (aggregatedMap.has(key)) {
        const existing = aggregatedMap.get(key)!;
        aggregatedMap.set(key, {
          ...existing,
          sales: existing.sales + product.sales,
          quantity: existing.quantity + (product.quantity || 0),
          specifications: existing.specifications + 1,
          salesGrowth,
          quantityGrowth
        });
      } else {
        aggregatedMap.set(key, {
          id: key,
          sku: product.sku,
          product_name: product.product_name,
          category_name: product.category_name,
          sales: product.sales,
          quantity: product.quantity || 0,
          specifications: 1,
          salesGrowth,
          quantityGrowth
        });
      }
    });

    return Array.from(aggregatedMap.values());
  }, [productRankingData, getDateRange, getComparisonPeriods]);

  // 依選擇的指標排序
  const topSalesList = React.useMemo(() => {
    return [...filteredAndAggregatedData]
      .sort((a, b) => rankingMetric === 'sales' 
        ? b.sales - a.sales 
        : b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredAndAggregatedData, rankingMetric]);
  
  const bottomSalesList = React.useMemo(() => {
    return [...filteredAndAggregatedData]
      .sort((a, b) => rankingMetric === 'sales' 
        ? a.sales - b.sales 
        : a.quantity - b.quantity)
      .slice(0, 5);
  }, [filteredAndAggregatedData, rankingMetric]);
  
  // 依成長率排序
  const topGrowthList = React.useMemo(() => {
    return [...filteredAndAggregatedData]
      .filter(product => {
        const growth = rankingMetric === 'sales' 
          ? product.salesGrowth 
          : product.quantityGrowth;
        return growth !== undefined;
      })
      .sort((a, b) => {
        const growthA = rankingMetric === 'sales' 
          ? a.salesGrowth || 0 
          : a.quantityGrowth || 0;
        const growthB = rankingMetric === 'sales' 
          ? b.salesGrowth || 0 
          : b.quantityGrowth || 0;
        return growthB - growthA;
      })
      .slice(0, 5);
  }, [filteredAndAggregatedData, rankingMetric]);
  
  const bottomGrowthList = React.useMemo(() => {
    return [...filteredAndAggregatedData]
      .filter(product => {
        const growth = rankingMetric === 'sales' 
          ? product.salesGrowth 
          : product.quantityGrowth;
        return growth !== undefined;
      })
      .sort((a, b) => {
        const growthA = rankingMetric === 'sales' 
          ? a.salesGrowth || 0 
          : a.quantityGrowth || 0;
        const growthB = rankingMetric === 'sales' 
          ? b.salesGrowth || 0 
          : b.quantityGrowth || 0;
        return growthA - growthB;
      })
      .slice(0, 5);
  }, [filteredAndAggregatedData, rankingMetric]);

  return (
    <>
      {/* 時間範圍和指標選擇器 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
        <div className="flex flex-1 items-center">
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(value) => {
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
              <TableHead>廠商名稱</TableHead>
              <TableHead>商品</TableHead>
              <TableHead>商品分類</TableHead>
              <TableHead>規格數</TableHead>
              <TableHead>{rankingMetric === "sales" ? "銷售額" : "銷售量"}</TableHead>
              <TableHead>成長率</TableHead>
            </TableRow></TableHeader><TableBody>
              {topSalesList.map((product) => {
                const growth = rankingMetric === "sales" 
                  ? product.salesGrowth 
                  : product.quantityGrowth;
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.product_name}</TableCell>
                    <TableCell>{product.category_name}</TableCell>
                    <TableCell>{product.specifications}</TableCell>
                    <TableCell>
                      {rankingMetric === "sales" 
                        ? `$${product.sales.toLocaleString()}` 
                        : product.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {growth !== undefined && (
                        <span className={growth >= 0 ? "text-green-600" : "text-red-600"}>
                          {growth >= 0 ? "↑" : "↓"} {Math.abs(growth)}%
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody></Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>{rankingMetric === "sales" ? "銷售額" : "銷售量"}最低前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow>
              <TableHead>廠商名稱</TableHead>
              <TableHead>品名</TableHead>
              <TableHead>商品分類</TableHead>
              <TableHead>規格數</TableHead>
              <TableHead>{rankingMetric === "sales" ? "銷售額" : "銷售量"}</TableHead>
              <TableHead>成長率</TableHead>
            </TableRow></TableHeader><TableBody>
              {bottomSalesList.map((product) => {
                const growth = rankingMetric === "sales" 
                  ? product.salesGrowth 
                  : product.quantityGrowth;
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.product_name}</TableCell>
                    <TableCell>{product.category_name}</TableCell>
                    <TableCell>{product.specifications}</TableCell>
                    <TableCell>
                      {rankingMetric === "sales" 
                        ? `$${product.sales.toLocaleString()}` 
                        : product.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {growth !== undefined && (
                        <span className={growth >= 0 ? "text-green-600" : "text-red-600"}>
                          {growth >= 0 ? "↑" : "↓"} {Math.abs(growth)}%
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody></Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>成長率最高前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow>
              <TableHead>廠商名稱</TableHead>
              <TableHead>品名</TableHead>
              <TableHead>商品分類</TableHead>
              <TableHead>規格數</TableHead>
              <TableHead>{rankingMetric === "sales" ? "銷售額" : "銷售量"}</TableHead>
              <TableHead>成長率</TableHead>
            </TableRow></TableHeader><TableBody>
              {topGrowthList.map((product) => {
                const growth = rankingMetric === "sales" 
                  ? product.salesGrowth 
                  : product.quantityGrowth;
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.product_name}</TableCell>
                    <TableCell>{product.category_name}</TableCell>
                    <TableCell>{product.specifications}</TableCell>
                    <TableCell>
                      {rankingMetric === "sales" 
                        ? `$${product.sales.toLocaleString()}` 
                        : product.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-green-600">
                      ↑ {Math.abs(growth || 0)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody></Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>成長率最低前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow>
              <TableHead>廠商名稱</TableHead>
              <TableHead>品名</TableHead>
              <TableHead>商品分類</TableHead>
              <TableHead>規格數</TableHead>
              <TableHead>{rankingMetric === "sales" ? "銷售額" : "銷售量"}</TableHead>
              <TableHead>成長率</TableHead>
            </TableRow></TableHeader><TableBody>
              {bottomGrowthList.map((product) => {
                const growth = rankingMetric === "sales" 
                  ? product.salesGrowth 
                  : product.quantityGrowth;
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.product_name}</TableCell>
                    <TableCell>{product.category_name}</TableCell>
                    <TableCell>{product.specifications}</TableCell>
                    <TableCell>
                      {rankingMetric === "sales" 
                        ? `$${product.sales.toLocaleString()}` 
                        : product.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-red-600">
                      ↓ {Math.abs(growth || 0)}%
                    </TableCell>
                  </TableRow>
                );
              })}
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
