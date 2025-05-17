"use client"

import * as React from "react"
import { LineChart, Line, XAxis, CartesianGrid, Legend } from "recharts"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { getDateRange as getDateRangeUtil } from "@/lib/date-utils"
import { calculateProductModelGrowthRates } from "@/lib/product-utils"
import { ProductSalesModel } from "@/lib/types"

interface ProductDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product_name: string // Changed from productName
  category_name: string // Changed from productCategory
  sku: string // Changed from vendorCode
  models: ProductSalesModel[]
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

export function ProductDetailDialog({ open, onOpenChange, product_name, category_name, sku, models }: ProductDetailProps): React.ReactNode {
  const [timeRange, setTimeRange] = React.useState("90d")
  const [chartType, setChartType] = React.useState("amount")
  const [selectedModels, setSelectedModels] = React.useState<(string | number)[]>([])
  const [customDateRange, setCustomDateRange] = React.useState<{start: string, end: string} | null>(null)
  
  // 每次打開 dialog 時，自動全選所有 models
  React.useEffect(() => {
    if (open && models.length > 0) {
      setSelectedModels(models.map(model => model.id));
    }
  }, [open, models]);

  // 計算日期範圍
  const getDateRange = React.useCallback(() => {
    const now = new Date("2025-05-01");
    return getDateRangeUtil(timeRange, customDateRange, now);
  }, [timeRange, customDateRange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80vw] sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>商品規格詳情 - {product_name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={(value) => {
                setTimeRange(value);
                if (value !== "custom") {
                  setCustomDateRange(null);
                } else if (value === "custom" && !customDateRange) {
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
            <ToggleGroup
              type="single"
              value={chartType}
              onValueChange={setChartType}
              variant="outline"
            >
              <ToggleGroupItem value="amount">銷售額</ToggleGroupItem>
              <ToggleGroupItem value="quantity">銷售量</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="border shadow-sm @container/card">
              <CardContent className="p-4">
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
                    {selectedModels.map((modelId, index) => {
                      const model = models.find(m => m.id === modelId);
                      if (!model) return null;
                      
                      const colors = [
                        "#ff6b6b", "#4ecdc4", "#45b7d8", "#ffa94d", 
                        "#a3a1fb", "#f06595", "#38d9a9", "#748ffc"
                      ];
                      const color = colors[index % colors.length];
                      
                      const { startDate, endDate } = getDateRange();
                      const data = model.data.filter(item => {
                        const date = new Date(item.date);
                        return date >= startDate && date <= endDate;
                      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                      
                      return (
                        <Line
                          key={`${model.id}-${chartType}`}
                          data={data}
                          type="monotone"
                          dataKey={chartType}
                          stroke={color}
                          name={model.model_name}
                          strokeWidth={2}
                        />
                      );
                    })}
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="rounded-lg border h-fit">
              <Table><TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      id="model-table-all"
                      checked={selectedModels.length === models.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedModels(models.map(model => model.id));
                        } else {
                          // 保留至少一個選擇
                          setSelectedModels([models[0].id]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>規格</TableHead>
                  <TableHead className="text-right">期間銷售量 (成長率)</TableHead>
                  <TableHead className="text-right">期間總銷售額 (成長率)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => {
                  const isSelected = selectedModels.includes(model.id);
                  const { startDate, endDate } = getDateRange();
                  
                  // 計算所選時間範圍內的數據總和
                  const periodData = model.data.filter(item => {
                    const date = new Date(item.date);
                    return date >= startDate && date <= endDate;
                  });
                  
                  const totalQuantity = periodData.reduce((sum, item) => sum + item.quantity, 0);
                  const totalAmount = periodData.reduce((sum, item) => sum + item.amount, 0);
                  
                  // 使用工具函數計算成長率
                  const { quantityGrowth, amountGrowth } = calculateProductModelGrowthRates(
                    model, 
                    timeRange, 
                    customDateRange
                  );
                  
                  return (
                    <TableRow key={model.id}>
                      <TableCell>
                        <Checkbox
                          id={`model-table-${model.id}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedModels([...selectedModels, model.id]);
                            } else {
                              // 確保至少保留一個規格
                              if (selectedModels.length > 1) {
                                setSelectedModels(selectedModels.filter(id => id !== model.id));
                              }
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{model.model_name}</TableCell>
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
                })}
              </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground mt-4">
            <p>
              <strong>商品資訊:</strong> {product_name} ({category_name}) - 廠商名稱: {sku}
            </p>
            <p>
              <strong>備註:</strong> 成長率表示相較於前一個相同時間區間的變化率。例如，選擇最近7天時，會比較與前7天的數據。
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
