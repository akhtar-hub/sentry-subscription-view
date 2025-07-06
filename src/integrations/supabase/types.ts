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
      email_scan_logs: {
        Row: {
          completed_at: string | null
          emails_processed: number | null
          error_message: string | null
          id: string
          scan_type: string | null
          started_at: string | null
          status: string | null
          subscriptions_found: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          emails_processed?: number | null
          error_message?: string | null
          id?: string
          scan_type?: string | null
          started_at?: string | null
          status?: string | null
          subscriptions_found?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          emails_processed?: number | null
          error_message?: string | null
          id?: string
          scan_type?: string | null
          started_at?: string | null
          status?: string | null
          subscriptions_found?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          gmail_access_token: string | null
          gmail_refresh_token: string | null
          id: string
          last_scan_at: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gmail_access_token?: string | null
          gmail_refresh_token?: string | null
          id: string
          last_scan_at?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gmail_access_token?: string | null
          gmail_refresh_token?: string | null
          id?: string
          last_scan_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_organizations: {
        Row: {
          category: Database["public"]["Enums"]["subscription_category"] | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          logo_url: string | null
          name: string
          pricing_plans: Json | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["subscription_category"] | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          pricing_plans?: Json | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["subscription_category"] | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          pricing_plans?: Json | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_frequency:
            | Database["public"]["Enums"]["billing_frequency"]
            | null
          category: Database["public"]["Enums"]["subscription_category"] | null
          cost: number | null
          created_at: string | null
          email_source: string | null
          id: string
          is_manual: boolean | null
          is_pending_review: boolean | null
          name: string
          next_billing_date: string | null
          organization_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_frequency?:
            | Database["public"]["Enums"]["billing_frequency"]
            | null
          category?: Database["public"]["Enums"]["subscription_category"] | null
          cost?: number | null
          created_at?: string | null
          email_source?: string | null
          id?: string
          is_manual?: boolean | null
          is_pending_review?: boolean | null
          name: string
          next_billing_date?: string | null
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_frequency?:
            | Database["public"]["Enums"]["billing_frequency"]
            | null
          category?: Database["public"]["Enums"]["subscription_category"] | null
          cost?: number | null
          created_at?: string | null
          email_source?: string | null
          id?: string
          is_manual?: boolean | null
          is_pending_review?: boolean | null
          name?: string
          next_billing_date?: string | null
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "subscription_organizations"
            referencedColumns: ["id"]
          },
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
      billing_frequency: "monthly" | "yearly" | "quarterly" | "weekly" | "daily"
      subscription_category:
        | "entertainment"
        | "productivity"
        | "news"
        | "utility"
        | "health"
        | "finance"
        | "education"
        | "shopping"
        | "other"
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
      billing_frequency: ["monthly", "yearly", "quarterly", "weekly", "daily"],
      subscription_category: [
        "entertainment",
        "productivity",
        "news",
        "utility",
        "health",
        "finance",
        "education",
        "shopping",
        "other",
      ],
    },
  },
} as const
