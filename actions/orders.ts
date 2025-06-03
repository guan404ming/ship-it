"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

import { OrderStatus } from "@/lib/types";
import dayjs from "dayjs";
import { upsertStockRecord } from "./stock_record";

// Type for order input (extends the base Order type with custom fields)
type OrderInput = {
  order_id?: string;
  buyer_id: number;
  product_total_price: number;
  shipping_fee: number;
  total_paid: number;
  order_status: OrderStatus;
  payment_time?: string;
  shipped_at?: string;
  completed_at?: string;
  items: Array<{
    product_id: number;
    model_id: number;
    quantity: number;
    returned_quantity: number;
    sold_price: number;
    total_price: number;
  }>;
};

interface OrderUpdateData {
  order_status: OrderStatus;
  shipped_at?: string;
  completed_at?: string;
  cancel_reason?: string;
}

export async function upsertOrder(input: OrderInput) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Destructure to separate items from order data
    const { items, ...orderData } = input;

    // Generate a unique order_id (e.g., 'ORD' + YYYYMMDDHHMMSS + random 4 digits)
    if (!input.order_id) {
      const dateStr = dayjs().format("YYYYMMDDHHmmss");
      const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
      input.order_id = `ORD${dateStr}${randomStr}`;
    }

    // Upsert order by order_id
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .upsert(
        {
          order_id: input.order_id,
          ...orderData,
          created_at: dayjs().toISOString(),
          payment_time: orderData.payment_time ?? null,
          shipped_at: orderData.shipped_at ?? null,
          completed_at: orderData.completed_at ?? null,
        },
        { onConflict: "order_id" }
      )
      .select()
      .single();
    if (orderError || !order) throw orderError;

    // Delete old order_items for this order_id
    const { error: deleteItemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", order.order_id);
    if (deleteItemsError) throw deleteItemsError;

    // Insert order items using spread syntax
    const orderItems = items.map((item) => ({
      ...item,
      order_id: order.order_id,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);
    if (orderItemsError) throw orderItemsError;

    if (orderData.order_status === "delivered") {
      await Promise.all(
        items.map(async (item) => {
          await upsertStockRecord(item.model_id, false, item.quantity);
        })
      );
    }

    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  cancelReason?: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const updateData: OrderUpdateData = {
    order_status: status,
  };

  if (status === "shipped") {
    updateData.shipped_at = dayjs().toISOString();
  } else if (status === "delivered") {
    updateData.completed_at = dayjs().toISOString();
  }

  if (status === "canceled" && cancelReason) {
    updateData.cancel_reason = cancelReason;
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("order_id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOrders() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      buyers (*),
      order_items (
        *,
        products (*),
        product_models (*)
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
