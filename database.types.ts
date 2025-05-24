export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      buyers: {
        Row: {
          buyer_account: string | null
          buyer_id: number
        }
        Insert: {
          buyer_account?: string | null
          buyer_id?: number
        }
        Update: {
          buyer_account?: string | null
          buyer_id?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          item_id: number
          model_id: number | null
          order_id: string | null
          product_id: number | null
          quantity: number | null
          returned_quantity: number | null
          sold_price: number | null
          total_price: number | null
        }
        Insert: {
          item_id?: number
          model_id?: number | null
          order_id?: string | null
          product_id?: number | null
          quantity?: number | null
          returned_quantity?: number | null
          sold_price?: number | null
          total_price?: number | null
        }
        Update: {
          item_id?: number
          model_id?: number | null
          order_id?: string | null
          product_id?: number | null
          quantity?: number | null
          returned_quantity?: number | null
          sold_price?: number | null
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "product_models"
            referencedColumns: ["model_id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: number | null
          completed_at: string | null
          created_at: string | null
          order_id: string
          order_status: Database["public"]["Enums"]["order_status"] | null
          payment_time: string | null
          product_total_price: number | null
          shipped_at: string | null
          shipping_fee: number | null
          total_paid: number | null
        }
        Insert: {
          buyer_id?: number | null
          completed_at?: string | null
          created_at?: string | null
          order_id: string
          order_status?: Database["public"]["Enums"]["order_status"] | null
          payment_time?: string | null
          product_total_price?: number | null
          shipped_at?: string | null
          shipping_fee?: number | null
          total_paid?: number | null
        }
        Update: {
          buyer_id?: number | null
          completed_at?: string | null
          created_at?: string | null
          order_id?: string
          order_status?: Database["public"]["Enums"]["order_status"] | null
          payment_time?: string | null
          product_total_price?: number | null
          shipped_at?: string | null
          shipping_fee?: number | null
          total_paid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["buyer_id"]
          },
        ]
      }
      product_models: {
        Row: {
          created_at: string | null
          model_id: number
          model_name: string | null
          original_price: number | null
          product_id: number | null
          promo_price: number | null
        }
        Insert: {
          created_at?: string | null
          model_id?: number
          model_name?: string | null
          original_price?: number | null
          product_id?: number | null
          promo_price?: number | null
        }
        Update: {
          created_at?: string | null
          model_id?: number
          model_name?: string | null
          original_price?: number | null
          product_id?: number | null
          promo_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_models_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      products: {
        Row: {
          listed_date: string | null
          product_id: number
          product_name: string | null
          status: string | null
        }
        Insert: {
          listed_date?: string | null
          product_id?: number
          product_name?: string | null
          status?: string | null
        }
        Update: {
          listed_date?: string | null
          product_id?: number
          product_name?: string | null
          status?: string | null
        }
        Relationships: []
      }
      purchase_batches: {
        Row: {
          batch_id: number
          created_at: string | null
          expect_date: string | null
          status: string | null
          supplier_id: number | null
        }
        Insert: {
          batch_id?: number
          created_at?: string | null
          expect_date?: string | null
          status?: string | null
          supplier_id?: number | null
        }
        Update: {
          batch_id?: number
          created_at?: string | null
          expect_date?: string | null
          status?: string | null
          supplier_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_batches_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["supplier_id"]
          },
        ]
      }
      purchase_items: {
        Row: {
          batch_id: number | null
          item_id: number
          model_id: number | null
          note: string | null
          quantity: number | null
          unit_cost: number | null
        }
        Insert: {
          batch_id?: number | null
          item_id?: number
          model_id?: number | null
          note?: string | null
          quantity?: number | null
          unit_cost?: number | null
        }
        Update: {
          batch_id?: number | null
          item_id?: number
          model_id?: number | null
          note?: string | null
          quantity?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "purchase_batches"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "purchase_items_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "product_models"
            referencedColumns: ["model_id"]
          },
        ]
      }
      stock_records: {
        Row: {
          last_updated: string | null
          model_id: number
          stock_quantity: number | null
        }
        Insert: {
          last_updated?: string | null
          model_id: number
          stock_quantity?: number | null
        }
        Update: {
          last_updated?: string | null
          model_id?: number
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_records_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: true
            referencedRelation: "product_models"
            referencedColumns: ["model_id"]
          },
        ]
      }
      suppliers: {
        Row: {
          contact_info: string | null
          created_at: string | null
          supplier_id: number
          supplier_name: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          supplier_id?: number
          supplier_name?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          supplier_id?: number
          supplier_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status:
        | "pending"
        | "shipped"
        | "delivered"
        | "confirmed"
        | "confirmed_in_trial"
        | "canceled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: [
        "pending",
        "shipped",
        "delivered",
        "confirmed",
        "confirmed_in_trial",
        "canceled",
      ],
    },
  },
} as const
