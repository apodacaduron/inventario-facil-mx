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
      assets: {
        Row: {
          created_at: string
          file_type: string | null
          filename: string | null
          id: string
          is_external: boolean | null
          org_id: string | null
          path: string | null
          related_id: string | null
          updated_at: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_type?: string | null
          filename?: string | null
          id?: string
          is_external?: boolean | null
          org_id?: string | null
          path?: string | null
          related_id?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_type?: string | null
          filename?: string | null
          id?: string
          is_external?: boolean | null
          org_id?: string | null
          path?: string | null
          related_id?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "i_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      i_customers: {
        Row: {
          address: string | null
          cashback_balance: number | null
          created_at: string
          email: string | null
          id: string
          map_url: string | null
          name: string | null
          notes: string | null
          org_id: string | null
          phone: string | null
          trust_status: Database["public"]["Enums"]["trust_status"] | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          cashback_balance?: number | null
          created_at?: string
          email?: string | null
          id?: string
          map_url?: string | null
          name?: string | null
          notes?: string | null
          org_id?: string | null
          phone?: string | null
          trust_status?: Database["public"]["Enums"]["trust_status"] | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          cashback_balance?: number | null
          created_at?: string
          email?: string | null
          id?: string
          map_url?: string | null
          name?: string | null
          notes?: string | null
          org_id?: string | null
          phone?: string | null
          trust_status?: Database["public"]["Enums"]["trust_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "i_customers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "i_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "i_customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      i_organizations: {
        Row: {
          cashback_percent: number | null
          created_at: string
          current_customers: number
          current_members: number
          current_products: number
          id: string
          is_cashback_enabled: boolean | null
          is_public_products_page_enabled: boolean
          name: string | null
          plan_id: string | null
          theme_color: string | null
          user_id: string | null
        }
        Insert: {
          cashback_percent?: number | null
          created_at?: string
          current_customers?: number
          current_members?: number
          current_products?: number
          id?: string
          is_cashback_enabled?: boolean | null
          is_public_products_page_enabled?: boolean
          name?: string | null
          plan_id?: string | null
          theme_color?: string | null
          user_id?: string | null
        }
        Update: {
          cashback_percent?: number | null
          created_at?: string
          current_customers?: number
          current_members?: number
          current_products?: number
          id?: string
          is_cashback_enabled?: boolean | null
          is_public_products_page_enabled?: boolean
          name?: string | null
          plan_id?: string | null
          theme_color?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "i_organizations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "i_organizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      i_products: {
        Row: {
          created_at: string
          current_stock: number | null
          description: string | null
          id: string
          image_url: string | null
          name: string | null
          org_id: string | null
          retail_price: number | null
          unit_price: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_stock?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          org_id?: string | null
          retail_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_stock?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          org_id?: string | null
          retail_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "i_products_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "i_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "i_products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
          image_url: string | null
          name: string | null
          org_id: string | null
          price: number | null
          product_id: string | null
          qty: number | null
          sale_id: string | null
          unit_price: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string | null
          org_id?: string | null
          price?: number | null
          product_id?: string | null
          qty?: number | null
          sale_id?: string | null
          unit_price?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string | null
          org_id?: string | null
          price?: number | null
          product_id?: string | null
          qty?: number | null
          sale_id?: string | null
          unit_price?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "i_sale_products_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "i_organizations"
            referencedColumns: ["id"]
          },
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
          },
          {
            foreignKeyName: "i_sale_products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      i_sales: {
        Row: {
          cancellation_notes: string | null
          cancelled_at: string | null
          cashback_redeemed: number | null
          cashback_to_redeem: number | null
          completed_at: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_date: string | null
          id: string
          notes: string | null
          org_id: string | null
          redeem_cashback: boolean | null
          sale_date: string | null
          shipping_cost: number | null
          status: Database["public"]["Enums"]["basic_sale_status"] | null
          total: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancellation_notes?: string | null
          cancelled_at?: string | null
          cashback_redeemed?: number | null
          cashback_to_redeem?: number | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          org_id?: string | null
          redeem_cashback?: boolean | null
          sale_date?: string | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["basic_sale_status"] | null
          total?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancellation_notes?: string | null
          cancelled_at?: string | null
          cashback_redeemed?: number | null
          cashback_to_redeem?: number | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          org_id?: string | null
          redeem_cashback?: boolean | null
          sale_date?: string | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["basic_sale_status"] | null
          total?: number | null
          updated_at?: string | null
          user_id?: string | null
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
          },
          {
            foreignKeyName: "i_sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          id: string
          max_customers: number | null
          max_members: number | null
          max_organizations: number | null
          max_products: number | null
          name: string | null
          price: number | null
          stripe_price_id: string | null
          stripe_product_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          max_customers?: number | null
          max_members?: number | null
          max_organizations?: number | null
          max_products?: number | null
          name?: string | null
          price?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          max_customers?: number | null
          max_members?: number | null
          max_organizations?: number | null
          max_products?: number | null
          name?: string | null
          price?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
        }
        Relationships: []
      }
      products_stock_history: {
        Row: {
          created_at: string
          id: number
          new_stock: number | null
          old_stock: number | null
          org_id: string | null
          product_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          new_stock?: number | null
          old_stock?: number | null
          org_id?: string | null
          product_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          new_stock?: number | null
          old_stock?: number | null
          org_id?: string | null
          product_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_stock_history_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "i_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_stock_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "i_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_stock_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          plan_id: string | null
          start_date: string | null
          status: string | null
          stripe_invoice_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id?: string | null
          start_date?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id?: string | null
          start_date?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "i_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_organizations: number | null
          email: string | null
          full_name: string | null
          id: string
          stripe_customer_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_organizations?: number | null
          email?: string | null
          full_name?: string | null
          id: string
          stripe_customer_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_organizations?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          stripe_customer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_sale: {
        Args: {
          organization_id: string
          sale_date: string
          status: string
          notes: string
          shipping_cost: number
          products: Json[]
          redeem_cashback?: boolean
          customer_id?: string
          cancellation_notes?: string
        }
        Returns: string
      }
      get_authed_user_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          full_name: string
          email: string
          stripe_customer_id: string
          role_name: Database["public"]["Enums"]["organization_roles"]
          start_date: string
          end_date: string
          plan_id: string
          plan_name: string
          price: number
          currency: string
          max_products: number
          max_customers: number
          max_organizations: number
          max_members: number
          stripe_price_id: string
          stripe_product_id: string
          current_organizations: number
        }[]
      }
      get_best_customers: {
        Args: {
          organization_id_input: string
          start_date_input?: string
          end_date_input?: string
        }
        Returns: {
          customer_id: string
          name: string
          qty: number
        }[]
      }
      get_customers_count:
        | {
            Args: {
              organization_id: string
            }
            Returns: number
          }
        | {
            Args: {
              organization_id_input: string
              start_date_input?: string
              end_date_input?: string
            }
            Returns: number
          }
      get_most_sold_products: {
        Args: {
          organization_id_input: string
          start_date_input?: string
          end_date_input?: string
        }
        Returns: {
          product_id: string
          name: string
          image_url: string
          qty: number
        }[]
      }
      get_products_count:
        | {
            Args: Record<PropertyKey, never>
            Returns: number
          }
        | {
            Args: {
              organization_id: string
            }
            Returns: number
          }
        | {
            Args: {
              organization_id_input: string
              start_date_input?: string
              end_date_input?: string
            }
            Returns: number
          }
      get_products_in_stock_count: {
        Args: {
          organization_id_input: string
          start_date_input?: string
          end_date_input?: string
        }
        Returns: number
      }
      get_sales_count: {
        Args: {
          organization_id_input: string
          start_date_input?: string
          end_date_input?: string
        }
        Returns: number
      }
      get_sales_income_count: {
        Args: {
          organization_id_input: string
          start_date_input?: string
          end_date_input?: string
        }
        Returns: number
      }
      get_sales_total_income: {
        Args: {
          organization_id_input: string
          start_date_input?: string
          end_date_input?: string
        }
        Returns: number
      }
      get_sales_total_profit: {
        Args: {
          organization_id_input: string
          start_date_input?: string
          end_date_input?: string
        }
        Returns: number
      }
      get_year_monthly_sales: {
        Args: {
          organization_id_input: string
        }
        Returns: {
          month_number: number
          total_sales: number
        }[]
      }
      handle_customer_cashback: {
        Args: {
          p_sale_id: string
        }
        Returns: undefined
      }
      update_sale: {
        Args: {
          organization_id_input: string
          sale_id_input: string
          sale_date_input: string
          status_input: string
          notes_input: string
          shipping_cost_input: number
          products_input: Json[]
          customer_id_input?: string
          cancellation_notes_input?: string
        }
        Returns: string
      }
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
      subscription_status: "active" | "inactive"
      trust_status: "trusted" | "not_trusted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
