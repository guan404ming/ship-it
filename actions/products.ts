"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { createModel } from "./models";

export async function getProducts() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    throw error;
  }

  return data;
}

export async function createProduct(productName: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: newProduct, error: createProductError } = await supabase
    .from("products")
    .insert([
      {
        product_name: productName,
        listed_date: new Date().toISOString(),
        status: "active",
      },
    ])
    .select("product_id")
    .single();

  if (createProductError || !newProduct) {
    throw new Error(
      `Failed to create product, error: ${createProductError?.message}`
    );
  }

  return newProduct;
}

export async function getProductAndModelIdByName(
  productName: string,
  modelName: string
): Promise<{ product_id: number; model_id: number }> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // get or create product_id
  let { data: product } = await supabase
    .from("products")
    .select("product_id")
    .eq("product_name", productName)
    .single();

  if (!product) {
    product = await createProduct(productName);
  }

  // get or create model_id
  let { data: model } = await supabase
    .from("product_models")
    .select("model_id")
    .eq("model_name", modelName)
    .eq("product_id", product.product_id)
    .single();

  if (!model) {
    model = await createModel(modelName, product.product_id);
  }

  if (!model) {
    throw new Error("Failed to get or create model");
  }

  return {
    product_id: product.product_id,
    model_id: model.model_id,
  };
}
