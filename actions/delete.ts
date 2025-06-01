import { createClient } from '@supabase/supabase-js'
import { Database } from '@/database.types'

const db = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Output = {
    success: boolean
    error?: string
}


// Delete product models and related data
export async function deleteProductModels(modelIds: number[]): Promise<Output> {
    try {
      // Delete purchase_items
      let { error } = await db
        .from('purchase_items')
        .delete()
        .in('model_id', modelIds)
      if (error) throw error
  
      // Delete order_items
      ;({ error } = await db
        .from('order_items')
        .delete()
        .in('model_id', modelIds))
      if (error) throw error
  
      // Delete stock_records
      ;({ error } = await db
        .from('stock_records')
        .delete()
        .in('model_id', modelIds))
      if (error) throw error
  
      // Delete product_models
      ;({ error } = await db
        .from('product_models')
        .delete()
        .in('model_id', modelIds))
      if (error) throw error
  
      return { success: true }
    } catch (error) {
      console.error('Error deleting product models:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }
    }
  }
