"use client"

import * as React from "react"
import { AreaChart, Area, XAxis, CartesianGrid } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"

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

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30d")
    }
  }, [isMobile])

  const currentMonthData = salesData[salesData.length - 1]
  const previousMonthData = salesData[salesData.length - 5]
  const changePercentage = Math.round((currentMonthData.amount - previousMonthData.amount) / previousMonthData.amount * 100 * 10) / 10

  const filteredData = React.useMemo(() => {
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
    
    return salesData.filter(item => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [timeRange, salesData])

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
              x 軸可選時間區間、顆粒度(月、日)<br />
              y 軸可選銷售額、銷售量
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
