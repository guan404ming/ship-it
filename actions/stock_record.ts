import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function updateStockRecord(
  model_id: number,
  isIncrease: boolean,
  quantity_delta: number
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  // get current stock_quantity
  const { data: stock_record, error: stock_record_error } = await supabase
    .from("stock_records")
    .select("stock_quantity")
    .eq("model_id", model_id)
    .single();

  if (stock_record_error) throw stock_record_error;

  let stock_quantity = stock_record.stock_quantity;

  if (isIncrease) {
    stock_quantity = stock_quantity + quantity_delta;
  } else {
    stock_quantity = stock_quantity - quantity_delta;
  }

  const { error: update_error } = await supabase
    .from("stock_records")
    .update({ stock_quantity })
    .eq("model_id", model_id);

  if (update_error) throw update_error;
  return { success: true, stock_quantity: stock_quantity };
}
