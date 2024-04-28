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
      i_customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          map_url: string | null
          name: string | null
          notes: string | null
          org_id: string | null
          phone: string | null
          trust_status: Database["public"]["Enums"]["trust_status"] | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          map_url?: string | null
          name?: string | null
          notes?: string | null
          org_id?: string | null
          phone?: string | null
          trust_status?: Database["public"]["Enums"]["trust_status"] | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          map_url?: string | null
          name?: string | null
          notes?: string | null
          org_id?: string | null
          phone?: string | null
          trust_status?: Database["public"]["Enums"]["trust_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "i_customers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "i_organizations"
            referencedColumns: ["id"]
          },
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
        }
        Relationships: [
          {
            foreignKeyName: "i_products_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "i_organizations"
            referencedColumns: ["id"]
          },
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
        ]
      }
      i_sales: {
        Row: {
          cancellation_notes: string | null
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          org_id: string | null
          sale_date: string | null
          shipping_cost: number | null
          status: Database["public"]["Enums"]["basic_sale_status"] | null
          updated_at: string | null
        }
        Insert: {
          cancellation_notes?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          org_id?: string | null
          sale_date?: string | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["basic_sale_status"] | null
          updated_at?: string | null
        }
        Update: {
          cancellation_notes?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          org_id?: string | null
          sale_date?: string | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["basic_sale_status"] | null
          updated_at?: string | null
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
          max_products: number | null
          name: string | null
          price: number | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          max_customers?: number | null
          max_products?: number | null
          name?: string | null
          price?: number | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          max_customers?: number | null
          max_products?: number | null
          name?: string | null
          price?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          month_amount: string | null
          plan_id: string | null
          start_date: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          month_amount?: string | null
          plan_id?: string | null
          start_date?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          month_amount?: string | null
          plan_id?: string | null
          start_date?: string | null
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
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
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
          customer_id: string
          notes: string
          cancellation_notes: string
          shipping_cost: number
          products: Json[]
        }
        Returns: string
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
