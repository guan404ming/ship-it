"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getInventoryStatus() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("stock_records").select(`
      *,
      product_models (
        *,
        products (*)
      )
    `);

  if (error) throw error;
  return data;
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
