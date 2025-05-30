"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { InventoryDashboardRow } from "@/lib/types";

const DAYS_30 = 30;
const REMAINING_INFINITY = 9999;

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
    const remaining_days =
      avgDaily > 0
        ? Math.floor(r.stock_quantity / avgDaily)
        : REMAINING_INFINITY;

    return {
      model_id: r.model_id,
      model_name: r.model_name,
      product_name: r.product_name,
      stock_quantity: r.stock_quantity,
      last_updated: r.last_updated,
      supplier_name: r.supplier_name,
      remaining_days,
      is_ordered: r.has_recent_purchase,
    };
  });
}

export async function createInventoryMovement(
  modelId: number,
  orderId: string | null,
  movementType: string,
  quantity: number,
  note?: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("inventory_movements")
    .insert([
      {
        model_id: modelId,
        order_id: orderId,
        movement_type: movementType,
        quantity,
        created_at: new Date().toISOString(),
        note,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // Update stock records
  const { error: updateError } = await supabase.rpc("update_stock_quantity", {
    p_model_id: modelId,
    p_quantity: quantity,
  });

  if (updateError) throw updateError;

  return data;
}

export async function getInventoryMovements() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("inventory_movements")
    .select(
      `
      *,
      product_models (
        *,
        products (*)
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
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
