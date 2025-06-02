"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { PurchaseDashboardRow, PurchaseFormData } from "@/lib/types";
import { upsertStockRecord } from "./stock_record";

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

export async function getPurchaseDashboardData(): Promise<
  PurchaseDashboardRow[]
> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("purchase_items").select(`
      *,
      purchase_batches (
        *,
        suppliers (
          supplier_id,
          supplier_name
        )
      ),
      product_models (
        model_id,
        model_name,
        products (
          product_id,
          product_name
        )
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
      batch_id: pb.batch_id,
      supplier_id: s.supplier_id,
      model_id: pm.model_id,
      product_id: p.product_id,
      quantity: i.quantity,
      created_at: pb.created_at,
      expect_date: pb.expect_date,
      status: pb.status,
      supplier_name: s.supplier_name,
      model_name: pm.model_name,
      product_name: p.product_name,
      note: i.note ?? null,
    };
  });
}

export async function updatePurchaseBatchStatus(
  items: { batch_id: number; item_id: number }[],
  status: "pending" | "confirmed" | "draft" = "confirmed"
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Get unique batch_ids
    const batchIds = [...new Set(items.map((item) => item.batch_id))];

    // Update status for each batch
    for (const batchId of batchIds) {
      const { error: batchError } = await supabase
        .from("purchase_batches")
        .update({ status })
        .eq("batch_id", batchId);

      if (status === "confirmed") {
        // get the purchase items
        const { data: purchaseItems, error: purchaseItemsError } =
          await supabase
            .from("purchase_items")
            .select("*")
            .eq("batch_id", batchId);

        if (purchaseItemsError) throw purchaseItemsError;

        // update stock_quantity
        for (const item of purchaseItems) {
          await upsertStockRecord(item.model_id, true, item.quantity);
        }
      }

      if (batchError) {
        console.error("Failed to update batch status:", batchError);
        throw batchError;
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating batch status:", error);
    throw error;
  }
}

export async function updatePurchaseItem(formData: PurchaseFormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  try {
    // 1. Update purchase item
    const { error: itemError } = await supabase
      .from("purchase_items")
      .update({
        quantity: formData.quantity,
        note: formData.note,
        model_id: formData.model_id,
      })
      .eq("item_id", formData.item_id);

    if (itemError) throw itemError + "itemError";

    // 2. Update purchase batch
    const { error: batchError } = await supabase
      .from("purchase_batches")
      .update({
        status: formData.status,
        expect_date: formData.expect_date,
        supplier_id: formData.supplier_id,
      })
      .eq("batch_id", formData.batch_id);

    if (batchError) throw batchError + "batchError";

    // 3. Update supplier if supplier info changed
    if (formData.supplier_name && formData.supplier_id) {
      const { error: supplierError } = await supabase
        .from("suppliers")
        .update({
          supplier_name: formData.supplier_name,
        })
        .eq("supplier_id", formData.supplier_id);

      if (supplierError) throw supplierError + "supplierError";
    }

    // 4. Update product model if model info changed
    if (formData.model_name && formData.model_id) {
      const { error: modelError } = await supabase
        .from("product_models")
        .update({
          model_name: formData.model_name,
          product_id: formData.product_id,
        })
        .eq("model_id", formData.model_id);

      if (modelError) throw modelError + "modelError";
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating purchase item:", error);
    throw error;
  }
}

export async function deletePurchaseItems(
  items: { batch_id: number; item_id: number }[]
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    for (const item of items) {
      const { error: deleteError } = await supabase
        .from("purchase_items")
        .delete()
        .match({
          batch_id: item.batch_id,
          item_id: item.item_id,
        });

      if (deleteError) {
        console.error("Failed to delete purchase item:", deleteError);
        throw deleteError;
      }
    }

    // Get unique batch_ids
    const batchIds = [...new Set(items.map((item) => item.batch_id))];

    // Check if any batches are now empty
    for (const batchId of batchIds) {
      const { data: remainingItems, error: countError } = await supabase
        .from("purchase_items")
        .select("item_id", { count: "exact" })
        .eq("batch_id", batchId);

      if (countError) {
        console.error("Failed to count remaining items:", countError);
        throw countError;
      }

      // If no items left in the batch, delete the batch
      if (remainingItems.length === 0) {
        const { error: batchDeleteError } = await supabase
          .from("purchase_batches")
          .delete()
          .eq("batch_id", batchId);

        if (batchDeleteError) {
          console.error("Failed to delete empty batch:", batchDeleteError);
          throw batchDeleteError;
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting purchase items:", error);
    throw error;
  }
}
