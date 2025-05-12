"use client";

import * as React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverallPerformance } from "@/components/history/overall-performance";
import { ProductPerformance } from "@/components/history/product-performance";
import { SalesRankings } from "@/components/history/sales-rankings";

const salesData = [
  { date: "2024-11-01", amount: 6240, quantity: 124 },
  { date: "2024-11-07", amount: 6580, quantity: 131 },
  { date: "2024-11-14", amount: 6750, quantity: 135 },
  { date: "2024-11-21", amount: 7020, quantity: 141 },
  { date: "2024-11-28", amount: 7430, quantity: 148 },
  { date: "2024-12-05", amount: 8120, quantity: 162 },
  { date: "2024-12-12", amount: 8740, quantity: 174 },
  { date: "2024-12-19", amount: 9580, quantity: 192 },
  { date: "2024-12-26", amount: 10240, quantity: 204 },
  { date: "2025-01-02", amount: 8520, quantity: 170 },
  { date: "2025-01-09", amount: 8160, quantity: 163 },
  { date: "2025-01-16", amount: 7820, quantity: 156 },
  { date: "2025-01-23", amount: 8050, quantity: 161 },
  { date: "2025-01-30", amount: 8380, quantity: 167 },
  { date: "2025-02-06", amount: 8960, quantity: 179 },
  { date: "2025-02-13", amount: 9240, quantity: 184 },
  { date: "2025-02-20", amount: 9540, quantity: 190 },
  { date: "2025-02-27", amount: 9870, quantity: 197 },
  { date: "2025-03-06", amount: 10240, quantity: 204 },
  { date: "2025-03-13", amount: 10530, quantity: 210 },
  { date: "2025-03-20", amount: 10860, quantity: 217 },
  { date: "2025-03-27", amount: 11180, quantity: 223 },
  { date: "2025-04-03", amount: 11450, quantity: 229 },
  { date: "2025-04-10", amount: 11680, quantity: 233 },
  { date: "2025-04-17", amount: 11940, quantity: 238 },
  { date: "2025-04-24", amount: 12240, quantity: 244 },
  { date: "2025-05-01", amount: 12480, quantity: 249 },
];

const productRankingData = [
  {
    id: "1",
    vendorCode: "fju3299",
    productName: "拼圖",
    productCategory: "兒童玩具",
    spec: "長頸鹿款",
    sales: 1840,
    growth: 7.2,
    returns: 1.2,
  },
  {
    id: "2",
    vendorCode: "fju3299",
    productName: "拼圖",
    productCategory: "兒童玩具",
    spec: "海豚款",
    sales: 1400,
    growth: 6.1,
    returns: 1.8,
  },
  {
    id: "3",
    vendorCode: "jde2088",
    productName: "兒童外套",
    productCategory: "服飾",
    spec: "粉色",
    sales: 2940,
    growth: 14.2,
    returns: 2.5,
  },
  {
    id: "4",
    vendorCode: "jde2088",
    productName: "兒童外套",
    productCategory: "服飾",
    spec: "黑色",
    sales: 1740,
    growth: 16.0,
    returns: 1.6,
  },
  {
    id: "5",
    vendorCode: "hkl5511",
    productName: "積木",
    productCategory: "兒童玩具",
    spec: "恐龍系列",
    sales: 2100,
    growth: 9.5,
    returns: 1.1,
  },
  {
    id: "6",
    vendorCode: "hkl5511",
    productName: "積木",
    productCategory: "兒童玩具",
    spec: "城市系列",
    sales: 1950,
    growth: 8.4,
    returns: 1.3,
  },
  {
    id: "7",
    vendorCode: "pqr7722",
    productName: "兒童書包",
    productCategory: "配件",
    spec: "藍色",
    sales: 1250,
    growth: -3.2,
    returns: 4.5,
  },
  {
    id: "8",
    vendorCode: "pqr7722",
    productName: "兒童書包",
    productCategory: "配件",
    spec: "粉紅色",
    sales: 1480,
    growth: 2.7,
    returns: 3.8,
  },
  {
    id: "9",
    vendorCode: "xyz9900",
    productName: "兒童水壺",
    productCategory: "生活用品",
    spec: "350ml",
    sales: 950,
    growth: -5.3,
    returns: 5.2,
  },
  {
    id: "10",
    vendorCode: "xyz9900",
    productName: "兒童水壺",
    productCategory: "生活用品",
    spec: "500ml",
    sales: 1050,
    growth: -1.8,
    returns: 4.8,
  },
  {
    id: "11",
    vendorCode: "abc1234",
    productName: "兒童帽子",
    productCategory: "配件",
    spec: "藍色",
    sales: 780,
    growth: -7.5,
    returns: 3.1,
  },
  {
    id: "12",
    vendorCode: "def5678",
    productName: "兒童雨靴",
    productCategory: "鞋類",
    spec: "恐龍圖案",
    sales: 1320,
    growth: 4.9,
    returns: 2.3,
  },
];

const productSalesData = [
  {
    id: "1",
    vendorCode: "fju3299",
    productName: "拼圖",
    productCategory: "兒童玩具",
    spec: "長頸鹿款",
    data: [
      { date: "2024-11-01", amount: 1240, quantity: 31 },
      { date: "2024-12-01", amount: 1580, quantity: 38 },
      { date: "2025-01-01", amount: 1320, quantity: 33 },
      { date: "2025-02-01", amount: 1460, quantity: 36 },
      { date: "2025-03-01", amount: 1640, quantity: 41 },
      { date: "2025-04-01", amount: 1720, quantity: 43 },
      { date: "2025-05-01", amount: 1840, quantity: 46 },
    ],
  },
  {
    id: "2",
    vendorCode: "fju3299",
    productName: "拼圖",
    productCategory: "兒童玩具",
    spec: "海豚款",
    data: [
      { date: "2024-11-01", amount: 1000, quantity: 25 },
      { date: "2024-12-01", amount: 1200, quantity: 30 },
      { date: "2025-01-01", amount: 900, quantity: 22 },
      { date: "2025-02-01", amount: 1080, quantity: 27 },
      { date: "2025-03-01", amount: 1240, quantity: 31 },
      { date: "2025-04-01", amount: 1320, quantity: 33 },
      { date: "2025-05-01", amount: 1400, quantity: 35 },
    ],
  },
  {
    id: "4",
    vendorCode: "jde2088",
    productName: "兒童外套",
    productCategory: "服飾",
    spec: "黑色",
    data: [
      { date: "2024-11-01", amount: 600, quantity: 10 },
      { date: "2024-12-01", amount: 720, quantity: 12 },
      { date: "2025-01-01", amount: 900, quantity: 15 },
      { date: "2025-02-01", amount: 1080, quantity: 18 },
      { date: "2025-03-01", amount: 1320, quantity: 22 },
      { date: "2025-04-01", amount: 1500, quantity: 25 },
      { date: "2025-05-01", amount: 1740, quantity: 29 },
    ],
  },
  {
    id: "5",
    vendorCode: "jde2088",
    productName: "兒童外套",
    productCategory: "服飾",
    spec: "粉色",
    data: [
      { date: "2024-11-01", amount: 1200, quantity: 20 },
      { date: "2024-12-01", amount: 1440, quantity: 24 },
      { date: "2025-01-01", amount: 1680, quantity: 28 },
      { date: "2025-02-01", amount: 1980, quantity: 33 },
      { date: "2025-03-01", amount: 2220, quantity: 37 },
      { date: "2025-04-01", amount: 2580, quantity: 43 },
      { date: "2025-05-01", amount: 2940, quantity: 49 },
    ],
  },
];

export default function HistoryClient() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex items-center justify-between px-4 lg:px-6">
                <h1 className="text-3xl font-semibold">歷史數據</h1>
              </div>

              <div className="px-4 lg:px-6">
                <Tabs defaultValue="overall">
                  <TabsList>
                    <TabsTrigger value="overall">賣場整體表現</TabsTrigger>
                    <TabsTrigger value="products">各項商品表現</TabsTrigger>
                    <TabsTrigger value="rankings">銷售排行</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overall" className="mt-4">
                    <OverallPerformance salesData={salesData} />
                  </TabsContent>

                  <TabsContent value="products" className="mt-4">
                    <ProductPerformance productSalesData={productSalesData} />
                  </TabsContent>

                  <TabsContent value="rankings" className="mt-4">
                    <SalesRankings productRankingData={productRankingData} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
