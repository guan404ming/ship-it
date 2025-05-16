"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// Direct to /purchase-temp/client.tsx --> (PurchaseOrderItem[])
export async function getPurchaseOrderItems() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("purchase_items")
    .select(`
      item_id,
      quantity,
      unit_cost,
      purchase_batches:batch_id (
        created_at,
        status,
        suppliers:supplier_id (
          supplier_name
        )
      ),
      product_models:model_id (
        model_name,
        products:product_id (
          product_name,
          categories:category_id (
            category_name
          )
        )
      )
    `);

  if (error) throw error;
  return data;
}



export async function createPurchaseBatch(supplierId: number) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("purchase_batches")
    .insert([
      {
        supplier_id: supplierId,
        status: "pending",
        created_at: new Date().toISOString(),
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