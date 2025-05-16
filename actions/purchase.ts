"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// Direct to /purchase-temp/client.tsx --> (PurchaseOrderItem[])
/** 前端要的 shape */
export type PurchaseOrderItem = {
  id: string;
  orderNumber: string;
  vendorCode: string;
  productCategory: string;
  productName: string;
  spec: string;
  quantity: number;
  totalPrice: number;
  orderDate: string;
  expectedArrivalDate: string;
  note?: string;
};


export async function getPurchaseOrderItems(): Promise<PurchaseOrderItem[]> {
  const supabase = createClient(cookies());

  const { data, error } = await supabase
    .from("purchase_items")
    .select(`
      item_id,
      quantity,
      unit_cost,
      purchase_batches:batch_id (
        created_at,
        status,
        suppliers:supplier_id ( supplier_name )
      ),
      product_models:model_id (
        model_name,
        products:product_id (
          product_name,
          categories:category_id ( category_name )
        )
      )
    `);

  if (error) throw error;

  return (data as any[]).map((row) => ({
    id: row.item_id.toString(),
    orderNumber: row.purchase_batches?.status ?? "N/A",
    vendorCode: row.purchase_batches?.suppliers?.supplier_name ?? "未知廠商",
    productCategory:
      row.product_models?.products?.categories?.category_name ?? "未分類",
    productName: row.product_models?.products?.product_name ?? "未命名商品",
    spec: row.product_models?.model_name ?? "無規格",
    quantity: row.quantity ?? 0,
    totalPrice: (Number(row.unit_cost) || 0) * (row.quantity ?? 0),
    orderDate: row.purchase_batches?.created_at ?? "",
    expectedArrivalDate: "-", // 目前沒有欄位
    note: "-",
  }));
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