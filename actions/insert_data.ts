import { createClient } from '@supabase/supabase-js'
import { Database } from '@/database.types'

const db = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type PurchaseBatchInput = {
  supplier_id: number
  expect_date: string
  status: 'draft' | 'confirmed'
  items: Array<{
    model_id: number
    quantity: number
    unit_cost: number
    note?: string
  }>
}

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

export async function createPurchaseBatch(input: PurchaseBatchInput) {
  try {
    // Insert purchase batch
    const { data: batchData, error: batchError } = await db
      .from('purchase_batches')
      .insert({
        supplier_id: input.supplier_id,
        created_at: new Date().toISOString(),
        expect_date: input.expect_date,
        status: input.status
      })
      .select('batch_id')
      .single()

    if (batchError) throw batchError
    if (!batchData) throw new Error('Failed to create purchase batch')

    const batch_id = batchData.batch_id

    // Insert purchase items
    const purchaseItems = input.items.map(item => ({
      batch_id,
      model_id: item.model_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
      note: item.note ?? null
    }))

    const { error: itemsError } = await db.from('purchase_items').insert(purchaseItems)
    if (itemsError) throw itemsError

    return { success: true, batch_id }
  } catch (error) {
    console.error('Error creating purchase batch:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function createOrder(input: OrderInput) {
  try {
    // Insert order - matches your SQL structure exactly
    const { error: orderError } = await db.from('orders').insert({
      order_id: input.order_id,                    // string like 'ORD0019'
      buyer_id: input.buyer_id,                    // number like 1
      product_total_price: input.product_total_price,  // decimal like 100
      shipping_fee: input.shipping_fee,            // decimal like 100
      total_paid: input.total_paid,                // decimal like 190
      order_status: input.order_status,            // enum like 'pending'
      created_at: new Date().toISOString(),        // equivalent to NOW()
      payment_time: input.payment_time ?? null,   // NULL if not provided
      shipped_at: input.shipped_at ?? null,       // NULL if not provided
      completed_at: input.completed_at ?? null    // NULL if not provided
    })
    if (orderError) throw orderError

    // Insert order items
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