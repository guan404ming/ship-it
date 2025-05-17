"use client"

import * as React from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { getDateRange as getDateRangeUtil } from "@/lib/date-utils"

import { SalesData } from "@/lib/types"

interface OverallPerformanceProps {
  salesData: SalesData[]
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

export function OverallPerformance({ salesData }: OverallPerformanceProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const [chartType, setChartType] = React.useState("amount")
  const [customDateRange, setCustomDateRange] = React.useState<{ start: string, end: string } | null>(null)

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30d")
    }
  }, [isMobile])

  const currentMonthData = salesData[salesData.length - 1]
  const previousMonthData = salesData[salesData.length - 5]
  const changePercentage = Math.round((currentMonthData.amount - previousMonthData.amount) / previousMonthData.amount * 100 * 10) / 10

  const filteredData = React.useMemo(() => {
    const now = new Date("2025-05-01");
    const { startDate, endDate } = getDateRangeUtil(timeRange, customDateRange, now);
    
    return salesData.filter(item => {
      const date = new Date(item.date);
      return date >= startDate && date <= endDate;
    });
  }, [timeRange, customDateRange, salesData])

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">月銷售額</div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-bold text-[#08678C]">$ {currentMonthData.amount.toLocaleString()}</h2>
              <span className="text-sm text-green-600">↑ {changePercentage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">月銷量</div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-bold text-[#08678C]">{currentMonthData.quantity.toLocaleString()} 件</h2>
              <span className="text-sm text-green-600">↑ {changePercentage}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="border shadow-sm @container/card">
          <CardHeader>
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <CardTitle>整體銷售表現</CardTitle>
                <CardDescription>
                  折線圖
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
                    <SelectItem value="all">全部時間</SelectItem>
                    <SelectItem value="custom">自訂時間範圍</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {timeRange === "custom" && (
              <div className="mt-4 flex items-center gap-2">
                <Input
                  type="date"
                  value={customDateRange?.start || ""}
                  onChange={(e) => setCustomDateRange({
                    start: e.target.value,
                    end: customDateRange?.end || new Date("2025-05-01").toISOString().split('T')[0]
                  })}
                  className="w-[130px]"
                />
                <span className="self-center">到</span>
                <Input
                  type="date"
                  value={customDateRange?.end || ""}
                  onChange={(e) => setCustomDateRange({
                    start: customDateRange?.start || "",
                    end: e.target.value
                  })}
                  className="w-[130px]"
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">

            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[300px] w-full"
            >
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(12, 76%, 61%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(12, 76%, 61%)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillQuantity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString("zh-TW", {
                        month: "numeric",
                        day: "numeric",
                      })
                    }}
                  />
                  <YAxis
                    label={{ 
                      value: chartType === "amount" ? "銷售額" : "銷售量", 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                    tickFormatter={(value) => {
                      if (chartType === "amount") {
                        if (value >= 10000) {
                          return `$${(value / 1000).toFixed(0)}k`
                        }
                        return `$${value}`
                      }
                      return value.toString()
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
                  {(chartType === "amount" || chartType === "both") && (
                    <Area
                      dataKey="amount"
                      type="monotone"
                      fill="url(#fillAmount)"
                      stroke="hsl(12, 76%, 61%)"
                      strokeWidth={2}
                    />
                  )}
                  {(chartType === "quantity" || chartType === "both") && (
                    <Area
                      dataKey="quantity"
                      type="monotone"
                      fill="url(#fillQuantity)"
                      stroke="hsl(173, 58%, 39%)"
                      strokeWidth={2}
                    />
                  )}
                </AreaChart>
              </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>銷售表現說明</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              x 軸：表示時間（月、日），可選擇不同的時間區間<br />
              y 軸：顯示銷售額（$）或銷售量（件）
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
