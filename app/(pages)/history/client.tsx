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
    sku: "fju3299", // Changed from vendorCode
    product_name: "拼圖", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "長頸鹿款", // Changed from spec
    sales: 1840,
    quantity: 46,
    growth: 7.0,  // (1840-1720)/1720 ≈ 7.0%
    date: "2025-05-01",
  },
  {
    id: "2",
    sku: "fju3299", // Changed from vendorCode
    product_name: "拼圖", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "海豚款", // Changed from spec
    sales: 1400,
    quantity: 35,
    growth: 6.1,  // (1400-1320)/1320 ≈ 6.1%
    date: "2025-05-01",
  },
  {
    id: "3",
    sku: "jde2088", // Changed from vendorCode
    product_name: "兒童外套", // Changed from productName
    category_name: "服飾", // Changed from productCategory
    model_name: "粉色", // Changed from spec
    sales: 2940,
    quantity: 49,
    growth: 14.0, // (2940-2580)/2580 ≈ 14.0%
    date: "2025-05-01",
  },
  {
    id: "4",
    sku: "jde2088", // Changed from vendorCode
    product_name: "兒童外套", // Changed from productName
    category_name: "服飾", // Changed from productCategory
    model_name: "黑色", // Changed from spec
    sales: 1740,
    quantity: 29,
    growth: 16.0, // (1740-1500)/1500 = 16.0%
    date: "2025-05-01",
  },
  {
    id: "5",
    sku: "hkl5511", // Changed from vendorCode
    product_name: "積木", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "恐龍系列", // Changed from spec
    sales: 2100,
    quantity: 42,
    growth: 8.2,  // (2100-1940)/1940 ≈ 8.2%
    date: "2025-05-01",
  },
  {
    id: "6",
    sku: "hkl5511", // Changed from vendorCode
    product_name: "積木", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "城市系列", // Changed from spec
    sales: 1950,
    quantity: 39,
    growth: 8.3,  // (1950-1800)/1800 ≈ 8.3%
    date: "2025-05-01",
  },
  {
    id: "7",
    sku: "pqr7722", // Changed from vendorCode
    product_name: "兒童書包", // Changed from productName
    category_name: "配件", // Changed from productCategory
    model_name: "藍色", // Changed from spec
    sales: 1250,
    quantity: 25,
    growth: 0.8,  // (1250-1240)/1240 ≈ 0.8%
    date: "2025-05-01",
  },
  {
    id: "8",
    sku: "pqr7722", // Changed from vendorCode
    product_name: "兒童書包", // Changed from productName
    category_name: "配件", // Changed from productCategory
    model_name: "粉紅色", // Changed from spec
    sales: 1480,
    quantity: 29,
    growth: 2.1,  // (1480-1450)/1450 ≈ 2.1%
    date: "2025-05-01",
  },
  {
    id: "9",
    sku: "xyz9900", // Changed from vendorCode
    product_name: "兒童水壺", // Changed from productName
    category_name: "生活用品", // Changed from productCategory
    model_name: "350ml", // Changed from spec
    sales: 950,
    quantity: 19,
    growth: -3.5, // Estimated based on trend
    date: "2025-05-01",
  },
  {
    id: "10",
    sku: "xyz9900", // Changed from vendorCode
    product_name: "兒童水壺", // Changed from productName
    category_name: "生活用品", // Changed from productCategory
    model_name: "500ml", // Changed from spec
    sales: 1050,
    quantity: 21,
    growth: -1.0, // Estimated based on trend
    date: "2025-05-01",
  },
  {
    id: "11",
    sku: "abc1234", // Changed from vendorCode
    product_name: "兒童帽子", // Changed from productName
    category_name: "配件", // Changed from productCategory
    model_name: "藍色", // Changed from spec
    sales: 780,
    quantity: 39,
    growth: -5.1, // Estimated based on trend
    date: "2025-05-01",
  },
  {
    id: "12",
    sku: "def5678", // Changed from vendorCode
    product_name: "兒童雨靴", // Changed from productName
    category_name: "鞋類", // Changed from productCategory
    model_name: "恐龍圖案", // Changed from spec
    sales: 1320,
    quantity: 22,
    growth: 3.9, // Estimated based on trend
    date: "2025-05-01",
  },
  // Adding historical data points for time range filtering
  {
    id: "1-apr",
    sku: "fju3299", // Changed from vendorCode
    product_name: "拼圖", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "長頸鹿款", // Changed from spec
    sales: 1720,
    quantity: 43,
    growth: 4.9,  // (1720-1640)/1640 ≈ 4.9%
    date: "2025-04-01",
  },
  {
    id: "2-apr",
    sku: "fju3299", // Changed from vendorCode
    product_name: "拼圖", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "海豚款", // Changed from spec
    sales: 1320,
    quantity: 33,
    growth: 6.5,  // (1320-1240)/1240 ≈ 6.5%
    date: "2025-04-01",
  },
  {
    id: "1-mar",
    sku: "fju3299", // Changed from vendorCode
    product_name: "拼圖", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "長頸鹿款", // Changed from spec
    sales: 1640,
    quantity: 41,
    growth: 12.3, // (1640-1460)/1460 ≈ 12.3%
    date: "2025-03-01",
  },
  {
    id: "2-mar",
    sku: "fju3299", // Changed from vendorCode
    product_name: "拼圖", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "海豚款", // Changed from spec
    sales: 1240,
    quantity: 31,
    growth: 14.8, // (1240-1080)/1080 ≈ 14.8%
    date: "2025-03-01",
  },
  {
    id: "1-feb",
    sku: "fju3299", // Changed from vendorCode
    product_name: "拼圖", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "長頸鹿款", // Changed from spec
    sales: 1460,
    quantity: 36,
    growth: 10.6, // (1460-1320)/1320 ≈ 10.6%
    date: "2025-02-01",
  },
  {
    id: "2-feb",
    sku: "fju3299", // Changed from vendorCode
    product_name: "拼圖", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "海豚款", // Changed from spec
    sales: 1080,
    quantity: 27,
    growth: 20.0, // (1080-900)/900 = 20.0%
    date: "2025-02-01",
  },
  // Adding historical data for other products
  {
    id: "3-apr",
    sku: "jde2088", // Changed from vendorCode
    product_name: "兒童外套", // Changed from productName
    category_name: "服飾", // Changed from productCategory
    model_name: "粉色", // Changed from spec
    sales: 2580,
    quantity: 43,
    growth: 16.2, // (2580-2220)/2220 ≈ 16.2%
    date: "2025-04-01",
  },
  {
    id: "3-mar",
    sku: "jde2088", // Changed from vendorCode
    product_name: "兒童外套", // Changed from productName
    category_name: "服飾", // Changed from productCategory
    model_name: "粉色", // Changed from spec
    sales: 2220,
    quantity: 37,
    growth: 12.1, // (2220-1980)/1980 ≈ 12.1%
    date: "2025-03-01",
  },
  {
    id: "4-apr",
    sku: "jde2088", // Changed from vendorCode
    product_name: "兒童外套", // Changed from productName
    category_name: "服飾", // Changed from productCategory
    model_name: "黑色", // Changed from spec
    sales: 1500,
    quantity: 25,
    growth: 13.6, // (1500-1320)/1320 ≈ 13.6%
    date: "2025-04-01",
  },
  {
    id: "5-apr",
    sku: "hkl5511", // Changed from vendorCode
    product_name: "積木", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "恐龍系列", // Changed from spec
    sales: 1940,
    quantity: 39,
    growth: 10.9, // (1940-1750)/1750 ≈ 10.9%
    date: "2025-04-01",
  },
  {
    id: "6-apr",
    sku: "hkl5511", // Changed from vendorCode
    product_name: "積木", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "城市系列", // Changed from spec
    sales: 1800,
    quantity: 36,
    growth: 9.1, // (1800-1650)/1650 ≈ 9.1%
    date: "2025-04-01",
  },
  {
    id: "7-apr",
    sku: "pqr7722", // Changed from vendorCode
    product_name: "兒童書包", // Changed from productName
    category_name: "配件", // Changed from productCategory
    model_name: "藍色", // Changed from spec
    sales: 1240,
    quantity: 25,
    growth: -1.6, // (1240-1260)/1260 ≈ -1.6%
    date: "2025-04-01",
  },
  {
    id: "8-apr",
    sku: "pqr7722", // Changed from vendorCode
    product_name: "兒童書包", // Changed from productName
    category_name: "配件", // Changed from productCategory
    model_name: "粉紅色", // Changed from spec
    sales: 1450,
    quantity: 29,
    growth: 1.4, // (1450-1430)/1430 ≈ 1.4%
    date: "2025-04-01",
  },
];

const productSalesData = [
  {
    id: "1",
    sku: "fju3299", // Changed from vendorCode
    product_name: "拼圖", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "長頸鹿款", // Changed from spec
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
    sku: "fju3299", // Changed from vendorCode
    product_name: "拼圖", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "海豚款", // Changed from spec
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
    id: "3",
    sku: "jde2088", // Changed from vendorCode
    product_name: "兒童外套", // Changed from productName
    category_name: "服飾", // Changed from productCategory
    model_name: "粉色", // Changed from spec
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
  {
    id: "4",
    sku: "jde2088", // Changed from vendorCode
    product_name: "兒童外套", // Changed from productName
    category_name: "服飾", // Changed from productCategory
    model_name: "黑色", // Changed from spec
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
    sku: "hkl5511", // Changed from vendorCode
    product_name: "積木", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "恐龍系列", // Changed from spec
    data: [
      { date: "2024-11-01", amount: 1060, quantity: 21 },
      { date: "2024-12-01", amount: 1250, quantity: 25 },
      { date: "2025-01-01", amount: 1380, quantity: 28 },
      { date: "2025-02-01", amount: 1600, quantity: 32 },
      { date: "2025-03-01", amount: 1750, quantity: 35 },
      { date: "2025-04-01", amount: 1940, quantity: 39 },
      { date: "2025-05-01", amount: 2100, quantity: 42 },
    ],
  },
  {
    id: "6",
    sku: "hkl5511", // Changed from vendorCode
    product_name: "積木", // Changed from productName
    category_name: "兒童玩具", // Changed from productCategory
    model_name: "城市系列", // Changed from spec
    data: [
      { date: "2024-11-01", amount: 980, quantity: 20 },
      { date: "2024-12-01", amount: 1150, quantity: 23 },
      { date: "2025-01-01", amount: 1280, quantity: 26 },
      { date: "2025-02-01", amount: 1480, quantity: 30 },
      { date: "2025-03-01", amount: 1650, quantity: 33 },
      { date: "2025-04-01", amount: 1800, quantity: 36 },
      { date: "2025-05-01", amount: 1950, quantity: 39 },
    ],
  },
  {
    id: "7",
    sku: "pqr7722", // Changed from vendorCode
    product_name: "兒童書包", // Changed from productName
    category_name: "配件", // Changed from productCategory
    model_name: "藍色", // Changed from spec
    data: [
      { date: "2024-11-01", amount: 1350, quantity: 27 },
      { date: "2024-12-01", amount: 1320, quantity: 26 },
      { date: "2025-01-01", amount: 1300, quantity: 26 },
      { date: "2025-02-01", amount: 1280, quantity: 25 },
      { date: "2025-03-01", amount: 1260, quantity: 25 },
      { date: "2025-04-01", amount: 1240, quantity: 25 },
      { date: "2025-05-01", amount: 1250, quantity: 25 },
    ],
  },
  {
    id: "8",
    sku: "pqr7722", // Changed from vendorCode
    product_name: "兒童書包", // Changed from productName
    category_name: "配件", // Changed from productCategory
    model_name: "粉紅色", // Changed from spec
    data: [
      { date: "2024-11-01", amount: 1280, quantity: 25 },
      { date: "2024-12-01", amount: 1320, quantity: 26 },
      { date: "2025-01-01", amount: 1350, quantity: 27 },
      { date: "2025-02-01", amount: 1400, quantity: 28 },
      { date: "2025-03-01", amount: 1430, quantity: 28 },
      { date: "2025-04-01", amount: 1450, quantity: 29 },
      { date: "2025-05-01", amount: 1480, quantity: 29 },
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
