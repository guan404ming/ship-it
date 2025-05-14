"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>銷售額最高前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow>
              <TableHead>廠商</TableHead>
              <TableHead>品名</TableHead>
              <TableHead>規格</TableHead>
              <TableHead>銷售額</TableHead>
            </TableRow></TableHeader><TableBody>
              {topSalesList.map((product) => (
                <TableRow key={`${product.id}-${product.spec}`}>
                  <TableCell>{product.vendorCode}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.spec}</TableCell>
                  <TableCell>${product.sales.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>銷售額最低前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow>
              <TableHead>廠商</TableHead>
              <TableHead>品名</TableHead>
              <TableHead>規格</TableHead>
              <TableHead>銷售額</TableHead>
            </TableRow></TableHeader><TableBody>
              {bottomSalesList.map((product) => (
                <TableRow key={`${product.id}-${product.spec}`}>
                  <TableCell>{product.vendorCode}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.spec}</TableCell>
                  <TableCell>${product.sales.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>月成長最高前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow>
              <TableHead>廠商</TableHead>
              <TableHead>品名</TableHead>
              <TableHead>規格</TableHead>
              <TableHead>成長率</TableHead>
            </TableRow></TableHeader><TableBody>
              {topGrowthList.map((product) => (
                <TableRow key={`${product.id}-${product.spec}`}>
                  <TableCell>{product.vendorCode}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.spec}</TableCell>
                  <TableCell className="text-green-600">↑ {product.growth}%</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>月成長最低前五名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow>
              <TableHead>廠商</TableHead>
              <TableHead>品名</TableHead>
              <TableHead>規格</TableHead>
              <TableHead>成長率</TableHead>
            </TableRow></TableHeader><TableBody>
              {bottomGrowthList.map((product) => (
                <TableRow key={`${product.id}-${product.spec}`}>
                  <TableCell>{product.vendorCode}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.spec}</TableCell>
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
