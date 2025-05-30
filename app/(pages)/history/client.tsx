"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverallPerformance } from "@/components/history/overall-performance";
import { ProductPerformance } from "@/components/history/product-performance";
import { SalesRankings } from "@/components/history/sales-rankings";

// TODO: 前端需要根據使用者輸入的時間範圍從後端獲取銷售歷史資料，目前使用假資料
import {
  salesData,
  productRankingData,
  productSalesData,
} from "@/lib/data/sales-data";

export default function HistoryClient() {
  return (
    <div className="flex flex-1 flex-col h-full w-full">
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
  );
}
