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
