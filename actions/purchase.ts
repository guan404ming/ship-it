"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { PurchaseDashboardRow } from "@/lib/types";

export async function createPurchaseBatch(
  supplierId: number,
  orderDate?: string,
  expectedDeliveryDate?: string,
  items?: {
    model_id: number;
    quantity: number;
    note?: string | null;
  }[]
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error: batchError } = await supabase
    .from("purchase_batches")
    .insert([
      {
        supplier_id: supplierId,
        status: "pending",
        created_at: orderDate || new Date().toISOString(),
        expect_date: expectedDeliveryDate,
      },
    ])
    .select()
    .single();

  if (batchError) {
    console.error("Failed to insert purchase_batch:", batchError);
    throw batchError;
  }

  if (items && items.length > 0) {
    const { error: itemError } = await supabase.from("purchase_items").insert(
      items.map((item) => ({
        batch_id: data.batch_id,
        model_id: item.model_id,
        quantity: item.quantity,
        note: item.note ?? null,
      }))
    );

    if (itemError) {
      console.error("Failed to insert purchase_items:", itemError);
      throw itemError;
    }
  }
  return data;
}

export async function addPurchaseItem(
  batchId: number,
  modelId: number,
  quantity: number,
  note?: string | null
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("purchase_items")
    .insert([
      {
        batch_id: batchId,
        model_id: modelId,
        quantity: quantity,
        note: note ?? null,
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

export async function getPurchaseDashboardData(): Promise<
  PurchaseDashboardRow[]
> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("purchase_items").select(`
      *,
      purchase_batches (
        *,
        suppliers (supplier_name)
      ),
      product_models (
        model_name,
        products(product_name)
      )
    `);

  if (error) throw error;

  return data.map((i): PurchaseDashboardRow => {
    const pb = i.purchase_batches;
    const s = pb.suppliers;
    const pm = i.product_models;
    const p = pm.products;

    return {
      item_id: i.item_id,
      quantity: i.quantity,
      batch_id: pb.batch_id,
      created_at: pb.created_at,
      expect_date: pb.expect_date,
      status: pb.status,
      supplier_name: s.supplier_name,
      model_name: pm.model_name,
      product_name: p.product_name,
      note: i.note ?? null,
      unit_cost: i.unit_cost,
    };
  });
}
