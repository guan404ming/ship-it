"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getProducts() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    throw error;
  }

  return data;
}

export async function getProductAndModelIdByNames(
  productName: string,
  modelName: string
): Promise<{ product_id: number; model_id: number } | null> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // get product_id
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("product_id")
    .eq("product_name", productName)
    .single();

  if (productError || !product) return null;

  // get model_id
  const { data: model, error: modelError } = await supabase
    .from("product_models")
    .select("model_id")
    .eq("model_name", modelName)
    .eq("product_id", product.product_id)
    .single();

  if (modelError || !model) return null;

  return {
    product_id: product.product_id,
    model_id: model.model_id,
  };
}