"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { InventoryDashboardRow } from "@/lib/types";

const DAYS_30 = 30;
const MIN_DAILY_SALES = 1;

export async function getInventoryDashboardData(): Promise<
  InventoryDashboardRow[]
> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("inventory_dashboard")
    .select("*");

  if (error) throw error;

  return data.map((r): InventoryDashboardRow => {
    const avgDaily = r.sales_30d / DAYS_30;
    const effectiveDailySales = Math.max(avgDaily, MIN_DAILY_SALES);
    const remaining_days = Math.floor(r.stock_quantity / effectiveDailySales);

    return {
      ...r,
      remaining_days,
    };
  });
}

export async function removeInventoryDashboardData({
  inventoryDashboardData,
}: {
  inventoryDashboardData: { supplierName: string; modelId: number }[];
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("inventory_dashboard")
    .delete()
    .in(
      "supplier_name",
      inventoryDashboardData.map((item) => item.supplierName)
    )
    .in(
      "model_id",
      inventoryDashboardData.map((item) => item.modelId)
    )
    .select();

  if (error) {
    console.error("Error removing inventory dashboard data:", error);
    throw error;
  }

  return data;
}
