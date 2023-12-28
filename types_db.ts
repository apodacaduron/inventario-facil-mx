export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          stripe_customer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      i_customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          map_url: string | null
          name: string | null
          org_id: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          map_url?: string | null
          name?: string | null
          org_id?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          map_url?: string | null
          name?: string | null
          org_id?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "i_customers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "i_organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      i_organizations: {
        Row: {
          created_at: string
          id: string
          name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "i_organizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      i_products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string | null
          org_id: string | null
          retail_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          org_id?: string | null
          retail_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          org_id?: string | null
          retail_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "i_products_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "i_organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      i_purchases: {
        Row: {
          created_at: string
          id: string
          org_id: string | null
          product_id: string | null
          purchase_date: string | null
          purchase_price: number | null
          qty_purchased: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          org_id?: string | null
          product_id?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          qty_purchased?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string | null
          product_id?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          qty_purchased?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "i_purchases_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "i_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "i_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      i_roles: {
        Row: {
          created_at: string
          id: string
          role_name: Database["public"]["Enums"]["organization_roles"] | null
        }
        Insert: {
          created_at?: string
          id?: string
          role_name?: Database["public"]["Enums"]["organization_roles"] | null
        }
        Update: {
          created_at?: string
          id?: string
          role_name?: Database["public"]["Enums"]["organization_roles"] | null
        }
        Relationships: []
      }
      i_sale_products: {
        Row: {
          created_at: string
          id: string
          price: number | null
          product_id: string | null
          qty: number | null
          sale_id: string | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          price?: number | null
          product_id?: string | null
          qty?: number | null
          sale_id?: string | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          price?: number | null
          product_id?: string | null
          qty?: number | null
          sale_id?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "i_sale_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "i_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "i_sale_products_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "i_sales"
            referencedColumns: ["id"]
          }
        ]
      }
      i_sales: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          org_id: string | null
          sale_date: string | null
          status: Database["public"]["Enums"]["basic_sale_status"] | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          org_id?: string | null
          sale_date?: string | null
          status?: Database["public"]["Enums"]["basic_sale_status"] | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          org_id?: string | null
          sale_date?: string | null
          status?: Database["public"]["Enums"]["basic_sale_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "i_sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "i_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "i_sales_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "i_organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      i_stock: {
        Row: {
          created_at: string
          current_stock: number | null
          id: string
          org_id: string | null
          product_id: string | null
        }
        Insert: {
          created_at?: string
          current_stock?: number | null
          id?: string
          org_id?: string | null
          product_id?: string | null
        }
        Update: {
          created_at?: string
          current_stock?: number | null
          id?: string
          org_id?: string | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "i_stock_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "i_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "i_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "i_products"
            referencedColumns: ["id"]
          }
        ]
      }
      i_user_organization_roles: {
        Row: {
          created_at: string
          id: number
          org_id: string | null
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          org_id?: string | null
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          org_id?: string | null
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "i_user_organization_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "i_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "i_user_organization_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "i_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "i_user_organization_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          full_name: string | null
          id: string
          payment_method: Json | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          full_name?: string | null
          id: string
          payment_method?: Json | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          full_name?: string | null
          id?: string
          payment_method?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      basic_sale_status: "in_progress" | "completed" | "cancelled"
      organization_roles: "admin" | "user"
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      sale_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "returned"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
