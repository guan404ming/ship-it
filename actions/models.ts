"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function createModel(modelName: string, productId: number) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: newModel, error: createModelError } = await supabase
    .from("product_models")
    .insert([
      {
        model_name: modelName,
        product_id: productId,
        created_at: new Date().toISOString(),
        original_price: 0,
        promo_price: 0,
      },
    ])
    .select("model_id")
    .single();

  if (createModelError || !newModel) {
    throw new Error("Failed to create model");
  }

  return newModel;
}

export async function deleteProductModels(modelIds: number[]) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const tablesToDelete = [
    "purchase_items",
    "order_items",
    "stock_records",
    "product_models",
  ] as const;

  try {
    for (const table of tablesToDelete) {
      const { error } = await supabase
        .from(table)
        .delete()
        .in("model_id", modelIds);

      if (error) {
        throw new Error(`Failed to delete from ${table}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error("Error deleting product models:", error);
    throw error;
  }
}
