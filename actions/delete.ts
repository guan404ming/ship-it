import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type Output = {
  success: boolean;
  error?: string;
};

// Delete product models and related data
export async function deleteProductModels(modelIds: number[]): Promise<Output> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Delete purchase_items
    let { error } = await supabase
      .from("purchase_items")
      .delete()
      .in("model_id", modelIds);
    if (error) throw error;

    // Delete order_items
    ({ error } = await supabase
      .from("order_items")
      .delete()
      .in("model_id", modelIds));
    if (error) throw error;

    // Delete stock_records
    ({ error } = await supabase
      .from("stock_records")
      .delete()
      .in("model_id", modelIds));
    if (error) throw error;

    // Delete product_models
    ({ error } = await supabase
      .from("product_models")
      .delete()
      .in("model_id", modelIds));
    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error deleting product models:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
