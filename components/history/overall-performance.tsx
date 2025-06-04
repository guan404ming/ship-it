"use client";

import { useEffect, useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { getDateRange as getDateRangeUtil } from "@/lib/date-utils";

import { SalesData } from "@/lib/types";
import dayjs from "dayjs";

interface OverallPerformanceProps {
  salesData: SalesData[];
}

const chartConfig = {
  amount: {
    label: "銷售額",
    color: "hsl(12, 76%, 61%)",
  },
  quantity: {
    label: "銷售量",
    color: "hsl(173, 58%, 39%)",
  },
} satisfies ChartConfig;

export function OverallPerformance({ salesData }: OverallPerformanceProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState("90d");
  const [chartType, setChartType] = useState("amount");
  const [customDateRange, setCustomDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  useEffect(() => {
    if (isMobile) {
      setTimeRange("30d");
    }
  }, [isMobile]);

  // Calculate monthly totals from the 30-day dataset
  const monthlyData = useMemo(() => {
    // Since salesData now contains the last 30 days, sum all of it
    const currentAmount = salesData.reduce((sum, item) => sum + item.amount, 0);
    const currentQuantity = salesData.reduce((sum, item) => sum + item.quantity, 0);

    // For comparison, use the first half vs second half of the 30-day period
    const midPoint = Math.floor(salesData.length / 2);
    const firstHalf = salesData.slice(0, midPoint);
    const secondHalf = salesData.slice(midPoint);

    const firstHalfAmount = firstHalf.reduce((sum, item) => sum + item.amount, 0);
    const firstHalfQuantity = firstHalf.reduce((sum, item) => sum + item.quantity, 0);
    const secondHalfAmount = secondHalf.reduce((sum, item) => sum + item.amount, 0);
    const secondHalfQuantity = secondHalf.reduce((sum, item) => sum + item.quantity, 0);

    // Calculate growth rates (second half vs first half)
    const amountGrowthRate = firstHalfAmount > 0 
      ? Math.round(((secondHalfAmount - firstHalfAmount) / firstHalfAmount) * 100 * 10) / 10
      : 0;
    
    const quantityGrowthRate = firstHalfQuantity > 0 
      ? Math.round(((secondHalfQuantity - firstHalfQuantity) / firstHalfQuantity) * 100 * 10) / 10
      : 0;

    return {
      currentAmount,
      currentQuantity,
      amountGrowthRate,
      quantityGrowthRate,
    };
  }, [salesData]);

  const filteredData = useMemo(() => {
    const now = dayjs().toDate();
    const { startDate, endDate } = getDateRangeUtil(
      timeRange,
      customDateRange,
      now
    );

    return salesData.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate && date <= endDate;
    });
  }, [timeRange, customDateRange, salesData]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">月銷售額</div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-bold text-[#08678C]">
                $ {monthlyData.currentAmount.toLocaleString()}
              </h2>
              <span className={`text-sm ${monthlyData.amountGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthlyData.amountGrowthRate >= 0 ? '↑' : '↓'} {Math.abs(monthlyData.amountGrowthRate)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">月銷量</div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-bold text-[#08678C]">
                {monthlyData.currentQuantity.toLocaleString()} 件
              </h2>
              <span className={`text-sm ${monthlyData.quantityGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthlyData.quantityGrowthRate >= 0 ? '↑' : '↓'} {Math.abs(monthlyData.quantityGrowthRate)}%
              </span>
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
                <CardDescription>折線圖</CardDescription>
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
                <Select
                  value={timeRange}
                  onValueChange={(value) => {
                    setTimeRange(value);
                    if (value !== "custom") {
                      setCustomDateRange(null);
                    } else if (value === "custom" && !customDateRange) {
                      const now = dayjs().toDate();
                      const startDate = dayjs().subtract(30, "day").toDate();
                      setCustomDateRange({
                        start: startDate.toISOString().split("T")[0],
                        end: now.toISOString().split("T")[0],
                      });
                    }
                  }}
                >
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
                  onChange={(e) =>
                    setCustomDateRange({
                      start: e.target.value,
                      end:
                        customDateRange?.end ||
                        dayjs().toISOString().split("T")[0],
                    })
                  }
                  className="w-[130px]"
                />
                <span className="self-center">到</span>
                <Input
                  type="date"
                  value={customDateRange?.end || ""}
                  onChange={(e) =>
                    setCustomDateRange({
                      start: customDateRange?.start || "",
                      end: e.target.value,
                    })
                  }
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
                    <stop
                      offset="5%"
                      stopColor="hsl(12, 76%, 61%)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(12, 76%, 61%)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillQuantity" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(173, 58%, 39%)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(173, 58%, 39%)"
                      stopOpacity={0.1}
                    />
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
                    const date = new Date(value);
                    return date.toLocaleDateString("zh-TW", {
                      month: "numeric",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  label={{
                    value: chartType === "amount" ? "銷售額" : "銷售量",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                  tickFormatter={(value) => {
                    if (chartType === "amount") {
                      if (value >= 10000) {
                        return `$${(value / 1000).toFixed(0)}k`;
                      }
                      return `$${value}`;
                    }
                    return value.toString();
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
                        });
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
              x 軸：表示時間（月、日），可選擇不同的時間區間
              <br />y 軸：顯示銷售額（$）或銷售量（件）
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
