"use client"

import * as React from "react"
import { LineChart, Line, XAxis, CartesianGrid, Legend } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

interface ModelSalesData {
  date: string
  amount: number
  quantity: number
}

interface ProductDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  productCategory: string
  vendorCode: string
  models: Array<{
    id: string
    spec: string
    data: ModelSalesData[]
  }>
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

export function ProductDetailDialog({ open, onOpenChange, productName, productCategory, vendorCode, models }: ProductDetailProps): React.ReactNode {
  const [timeRange, setTimeRange] = React.useState("90d")
  const [chartType, setChartType] = React.useState("amount")
  const [selectedModels, setSelectedModels] = React.useState<string[]>([])
  const [customDateRange, setCustomDateRange] = React.useState<{start: string, end: string} | null>(null)

  // 當對話框開啟時，默認選擇所有規格
  React.useEffect(() => {
    if (open) {
      setSelectedModels(models.map(model => model.id))
    }
  }, [open, models])

  // 計算日期範圍
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
        // 所有時間 - 使用最早的日期
        daysToSubtract = 365 * 2 // 假設最多兩年資料
      }
      
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - daysToSubtract)
    }
    
    return { startDate, endDate }
  }, [timeRange, customDateRange])

  const filteredModelsData = React.useMemo(() => {
    if (selectedModels.length === 0) return []
    
    const { startDate, endDate } = getDateRange()
    
    return models
      .filter(model => selectedModels.includes(model.id))
      .map(model => ({
        ...model,
        filteredData: model.data.filter(item => {
          const date = new Date(item.date)
          return date >= startDate && date <= endDate
        })
      }))
  }, [selectedModels, models, getDateRange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{productName} - 各規格銷售表現</DialogTitle>
          <DialogDescription>
            {productCategory} | 廠商代碼: {vendorCode}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 圖表區域 */}
          <Card className="border shadow-sm @container/card">
            <CardHeader>
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <CardTitle>各規格銷售表現</CardTitle>
                  <CardDescription>
                    已選取 {selectedModels.length} 個規格
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
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
                      <div className="flex items-center gap-2 ml-2">
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
                  {filteredModelsData.map((model, index) => {
                    const colors = [
                      "#ff6b6b", "#4ecdc4", "#45b7d8", "#ffa94d", 
                      "#a3a1fb", "#f06595", "#38d9a9", "#748ffc"
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                      <Line
                        key={`${model.id}-${chartType}`}
                        data={model.filteredData}
                        type="monotone"
                        dataKey={chartType}
                        stroke={color}
                        name={model.spec}
                        strokeWidth={2}
                      />
                    );
                  })}
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          {/* 表格區域 */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                  </TableHead>
                  <TableHead>規格名稱</TableHead>
                  <TableHead className="text-right">期間總銷售量</TableHead>
                  <TableHead className="text-right">期間總銷售額</TableHead>
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
                  
                  return (
                    <TableRow key={model.id} className={isSelected ? "bg-muted/50" : ""}>
                      <TableCell>
                        <Checkbox
                          id={`model-table-${model.id}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedModels([...selectedModels, model.id])
                            } else {
                              setSelectedModels(selectedModels.filter(id => id !== model.id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{model.spec}</TableCell>
                      <TableCell className="text-right font-mono">
                        {totalQuantity}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        $ {totalAmount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
