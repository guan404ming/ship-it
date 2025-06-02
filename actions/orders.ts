"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { createClient as createClientBrowser } from '@supabase/supabase-js'
import { Database } from '@/database.types'

import { OrderStatus } from "@/lib/types";

type OrderInput = {
  order_id: string
  buyer_id: number
  product_total_price: number
  shipping_fee: number
  total_paid: number
  order_status: 'pending' | 'shipped' | 'delivered' | 'confirmed' | 'confirmed_in_trial' | 'canceled'
  payment_time?: string
  shipped_at?: string
  completed_at?: string
  items: Array<{
    product_id: number
    model_id: number
    quantity: number
    returned_quantity: number
    sold_price: number
    total_price: number
  }>
}

interface OrderUpdateData {
  order_status: OrderStatus;
  shipped_at?: string;
  completed_at?: string;
  cancel_reason?: string;
}

const db = createClientBrowser<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function createOrderFromInput(input: OrderInput) {
  try {
    const { error: orderError } = await db.from('orders').insert({
      order_id: input.order_id,
      buyer_id: input.buyer_id,
      product_total_price: input.product_total_price,
      shipping_fee: input.shipping_fee,
      total_paid: input.total_paid,
      order_status: input.order_status,
      created_at: new Date().toISOString(),
      payment_time: input.payment_time ?? null,
      shipped_at: input.shipped_at ?? null,
      completed_at: input.completed_at ?? null
    })
    if (orderError) throw orderError

    const orderItems = input.items.map(item => ({
      order_id: input.order_id,
      product_id: item.product_id,
      model_id: item.model_id,
      quantity: item.quantity,
      returned_quantity: item.returned_quantity,
      sold_price: item.sold_price,
      total_price: item.total_price
    }))

    const { error: orderItemsError } = await db.from('order_items').insert(orderItems)
    if (orderItemsError) throw orderItemsError

    return { success: true }
  } catch (error) {
    console.error('Error creating order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
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
