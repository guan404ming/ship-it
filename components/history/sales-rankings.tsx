"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface SalesRankingProps {
  productRankingData: {
    id: string
    vendorCode: string
    productName: string
    productCategory: string
    spec: string
    sales: number
    growth?: number
    returns?: number
  }[]
}

const orderFailureData = [
  { name: '付款失敗', value: 35 },
  { name: '庫存不足', value: 25 },
  { name: '配送問題', value: 20 },
  { name: '顧客取消', value: 15 },
  { name: '其他原因', value: 5 },
];

const COLORS = ['#0891b2', '#2dd4bf', '#84cc16', '#eab308', '#6366f1'];

export function SalesRankings({ productRankingData }: SalesRankingProps) {

  const topSalesList = [...productRankingData].sort((a, b) => b.sales - a.sales).slice(0, 5)
  const bottomSalesList = [...productRankingData].sort((a, b) => a.sales - b.sales).slice(0, 5)
  

  const topGrowthList = [...productRankingData]
    .filter(product => product.growth !== undefined)
    .sort((a, b) => (b.growth || 0) - (a.growth || 0))
    .slice(0, 5)
  
  const bottomGrowthList = [...productRankingData]
    .filter(product => product.growth !== undefined)
    .sort((a, b) => (a.growth || 0) - (b.growth || 0))
    .slice(0, 5)
  
  const highestReturnsList = [...productRankingData]
    .filter(product => product.returns !== undefined)
    .sort((a, b) => (b.returns || 0) - (a.returns || 0))
    .slice(0, 5)

  const chartConfig = orderFailureData.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>銷售額最高前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>廠商</TableHead>
                  <TableHead>品名</TableHead>
                  <TableHead>規格</TableHead>
                  <TableHead>銷售額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSalesList.map((product) => (
                  <TableRow key={`${product.id}-${product.spec}`}>
                    <TableCell>{product.vendorCode}</TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.spec}</TableCell>
                    <TableCell>${product.sales.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>銷售額最低前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>廠商</TableHead>
                  <TableHead>品名</TableHead>
                  <TableHead>規格</TableHead>
                  <TableHead>銷售額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bottomSalesList.map((product) => (
                  <TableRow key={`${product.id}-${product.spec}`}>
                    <TableCell>{product.vendorCode}</TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.spec}</TableCell>
                    <TableCell>${product.sales.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>月成長最高前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>廠商</TableHead>
                  <TableHead>品名</TableHead>
                  <TableHead>規格</TableHead>
                  <TableHead>成長率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topGrowthList.map((product) => (
                  <TableRow key={`${product.id}-${product.spec}`}>
                    <TableCell>{product.vendorCode}</TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.spec}</TableCell>
                    <TableCell className="text-green-600">↑ {product.growth}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>月成長最低前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>廠商</TableHead>
                  <TableHead>品名</TableHead>
                  <TableHead>規格</TableHead>
                  <TableHead>成長率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bottomGrowthList.map((product) => (
                  <TableRow key={`${product.id}-${product.spec}`}>
                    <TableCell>{product.vendorCode}</TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.spec}</TableCell>
                    <TableCell className="text-red-600">↓ {Math.abs(product.growth || 0)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>退貨率最高前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>廠商</TableHead>
                  <TableHead>品名</TableHead>
                  <TableHead>規格</TableHead>
                  <TableHead>退貨率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highestReturnsList.map((product) => (
                  <TableRow key={`${product.id}-${product.spec}`}>
                    <TableCell>{product.vendorCode}</TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.spec}</TableCell>
                    <TableCell>{product.returns}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>訂單不成立原因</CardTitle>
            <CardDescription>2025年1月 - 4月</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ChartContainer className="h-full w-full" config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                    <Pie
                      data={orderFailureData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {orderFailureData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          className="opacity-80 hover:opacity-100 transition-opacity" 
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="border-solid border-gray-200"
                          indicator="dot"
                        />
                      }
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ fontSize: '16px', paddingLeft: '12px', lineHeight: '24px' }}
                      iconSize={10}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
