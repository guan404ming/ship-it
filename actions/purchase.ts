"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function createPurchaseBatch(supplierId: number, orderDate?: string, expectedDeliveryDate?: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("purchase_batches")
    .insert([
      {
        supplier_id: supplierId,
        status: "pending",
        created_at: orderDate || new Date().toISOString(),
        expected_delivery_date: expectedDeliveryDate,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addPurchaseItem(
  batchId: number,
  modelId: number,
  quantity: number,
  unitCost: number
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("purchase_items")
    .insert([
      {
        batch_id: batchId,
        model_id: modelId,
        quantity,
        unit_cost: unitCost,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPurchaseBatches() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("purchase_batches").select(`
      *,
      suppliers (*),
      purchase_items (
        *,
        product_models (*)
      )
    `);

  if (error) throw error;
  return data;
}
