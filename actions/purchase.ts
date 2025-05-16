"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getPurchaseItemsForClient() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("purchase_items")
    .select(`
      item_id,
      quantity,
      unit_cost,
      purchase_batches:batch_id (
        created_at,
        status,
        suppliers:supplier_id (
          supplier_name
        )
      ),
      product_models:model_id (
        model_name,
        products:product_id (
          product_name,
          categories:category_id (
            category_name
          )
        )
      )
    `);

  if (error) throw error;

  const formatted = data.map((item: any) => ({
    id: item.item_id.toString(),
    orderNumber: item.purchase_batches.status ?? "N/A", // 若無 order_number，暫用 status 或顯示 "N/A"
    vendorCode: item.purchase_batches.suppliers?.supplier_name ?? "未知廠商",
    productCategory: item.product_models.products.categories?.category_name ?? "未分類",
    productName: item.product_models.products?.product_name ?? "未命名商品",
    spec: item.product_models?.model_name ?? "無規格",
    quantity: item.quantity ?? 0,
    totalPrice: (parseFloat(item.unit_cost) || 0) * (item.quantity ?? 0),
    orderDate: item.purchase_batches?.created_at ?? "未知日期",
    expectedArrivalDate: "-", // 目前 select() 中無此欄位，填預設值
    note: "-",
  }));

  return formatted;
}