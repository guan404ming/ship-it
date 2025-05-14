"use client"

import * as React from "react"
import { LineChart, Line, XAxis, CartesianGrid, Legend } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

export function ProductDetailDialog({ open, onOpenChange, productName, productCategory, vendorCode, models }: ProductDetailProps) {
  const [timeRange, setTimeRange] = React.useState("90d")
  const [chartType, setChartType] = React.useState("amount")
  const [selectedModels, setSelectedModels] = React.useState<string[]>([])

  // 當對話框開啟時，默認選擇所有規格
  React.useEffect(() => {
    if (open) {
      setSelectedModels(models.map(model => model.id))
    }
  }, [open, models])

  const filteredModelsData = React.useMemo(() => {
    if (selectedModels.length === 0) return []
    
    return models
      .filter(model => selectedModels.includes(model.id))
      .map(model => ({
        ...model,
        filteredData: model.data.filter(item => {
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
  }, [selectedModels, timeRange, models])

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
                      aria-label="選擇時間範圍"
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
                  <TableHead className="text-right">最新銷售量</TableHead>
                  <TableHead className="text-right">最新銷售額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => {
                  const isSelected = selectedModels.includes(model.id);
                  const latestData = model.data[model.data.length - 1];
                  
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
                        {latestData.quantity}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        $ {latestData.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>關閉</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
