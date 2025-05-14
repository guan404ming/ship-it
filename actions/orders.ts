"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

import { OrderStatus } from "@/lib/types";

interface OrderUpdateData {
  order_status: OrderStatus;
  shipped_at?: string;
  completed_at?: string;
  cancel_reason?: string;
}

export async function createOrder(
  buyerId: number,
  items: {
    productId: number;
    modelId: number;
    quantity: number;
    soldPrice: number;
  }[],
  shippingFee: number
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const productTotalPrice = items.reduce(
    (sum, item) => sum + item.soldPrice * item.quantity,
    0
  );
  const totalPaid = productTotalPrice + shippingFee;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        buyer_id: buyerId,
        product_total_price: productTotalPrice,
        shipping_fee: shippingFee,
        total_paid: totalPaid,
        order_status: "pending",
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = items.map((item) => ({
    order_id: order.order_id,
    product_id: item.productId,
    model_id: item.modelId,
    quantity: item.quantity,
    sold_price: item.soldPrice,
    total_price: item.soldPrice * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order;
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
    updateData.shipped_at = new Date().toISOString();
  } else if (status === "delivered") {
    updateData.completed_at = new Date().toISOString();
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
