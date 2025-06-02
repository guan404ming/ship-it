"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

import { OrderStatus } from "@/lib/types";

// Type for order input (extends the base Order type with custom fields)
type OrderInput = {
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

export async function createOrderFromInput(input: OrderInput) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Destructure to separate items from order data
    const { items, ...orderData } = input;

    // Insert order using spread syntax for cleaner code
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        ...orderData,
        created_at: new Date().toISOString(),
        payment_time: orderData.payment_time ?? null,
        shipped_at: orderData.shipped_at ?? null,
        completed_at: orderData.completed_at ?? null,
      })
      .select()
      .single();
    if (orderError || !order) throw orderError;

    // Insert order items using spread syntax
    const orderItems = items.map((item) => ({
      ...item,
      order_id: order.order_id,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);
    if (orderItemsError) throw orderItemsError;

    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
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

  // Use spread syntax for cleaner mapping
  const orderItems = items.map((item) => ({
    order_id: order.order_id,
    product_id: item.productId,
    model_id: item.modelId,
    quantity: item.quantity,
    sold_price: item.soldPrice,
    total_price: item.soldPrice * item.quantity,
    returned_quantity: 0,
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
