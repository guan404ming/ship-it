"use server";

import { createClient } from "@/lib/supabase/server";
import dayjs from "dayjs";
import { cookies } from "next/headers";

export async function upsertStockRecord(
  model_id: number,
  isIncrease: boolean,
  quantity_delta: number
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: stock_record } = await supabase
    .from("stock_records")
    .select("stock_quantity")
    .eq("model_id", model_id)
    .single();

  if (!stock_record?.stock_quantity) {
    const { error: new_stock_record_error } = await supabase
      .from("stock_records")
      .insert({
        model_id,
        stock_quantity: 0 + quantity_delta * (isIncrease ? 1 : -1),
        last_updated: dayjs().toISOString(),
      })
      .select("stock_quantity")
      .single();

    if (new_stock_record_error) throw new_stock_record_error;
  } else {
    const { error: update_error } = await supabase
      .from("stock_records")
      .update({
        stock_quantity:
          stock_record.stock_quantity + quantity_delta * (isIncrease ? 1 : -1),
        last_updated: dayjs().toISOString(),
      })
      .eq("model_id", model_id);

    if (update_error) throw update_error;
  }
}
