export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assinaturas: {
        Row: {
          cliente_id: string
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          plano: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          plano: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          plano?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assinaturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      empresarios: {
        Row: {
          created_at: string | null
          documento: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          documento?: string | null
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          documento?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      empresas: {
        Row: {
          active: boolean
          address: string | null
          category: string | null
          city: string | null
          cnpj: string | null
          created_at: string | null
          description: string | null
          email: string | null
          empresario_id: string | null
          id: string
          instagram: string | null
          is_featured: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          state: string | null
          subscription_active: boolean | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          category?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          empresario_id?: string | null
          id?: string
          instagram?: string | null
          is_featured?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          state?: string | null
          subscription_active?: boolean | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          category?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          empresario_id?: string | null
          id?: string
          instagram?: string | null
          is_featured?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          state?: string | null
          subscription_active?: boolean | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empresas_empresario_id_fkey"
            columns: ["empresario_id"]
            isOneToOne: false
            referencedRelation: "empresarios"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_settings: {
        Row: {
          autoplay_delay: number
          autoplay_enabled: boolean
          id: string
          pause_on_hover: boolean
          slides_visible: number
          updated_at: string
        }
        Insert: {
          autoplay_delay?: number
          autoplay_enabled?: boolean
          id?: string
          pause_on_hover?: boolean
          slides_visible?: number
          updated_at?: string
        }
        Update: {
          autoplay_delay?: number
          autoplay_enabled?: boolean
          id?: string
          pause_on_hover?: boolean
          slides_visible?: number
          updated_at?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          active: boolean
          badge: string | null
          created_at: string
          cta_link: string | null
          cta_text: string | null
          id: string
          image_url: string
          mobile_image_url: string | null
          order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          badge?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          id?: string
          image_url: string
          mobile_image_url?: string | null
          order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          badge?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          id?: string
          image_url?: string
          mobile_image_url?: string | null
          order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads_empresas: {
        Row: {
          created_at: string | null
          email: string
          id: string
          instagram: string | null
          nome_empresa: string
          nome_responsavel: string
          origem: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          telefone: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          instagram?: string | null
          nome_empresa: string
          nome_responsavel: string
          origem?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          telefone: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          instagram?: string | null
          nome_empresa?: string
          nome_responsavel?: string
          origem?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          telefone?: string
        }
        Relationships: []
      }
      ofertas: {
        Row: {
          active: boolean
          created_at: string | null
          description: string | null
          discount_percent: number | null
          empresa_id: string | null
          id: string
          image_url: string | null
          price: number | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          empresa_id?: string | null
          id?: string
          image_url?: string | null
          price?: number | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          empresa_id?: string | null
          id?: string
          image_url?: string | null
          price?: number | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ofertas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      parceiros: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          order_index: number | null
          website: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          order_index?: number | null
          website?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          order_index?: number | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          referral_slug: string | null
          referred_by_user_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          subscription_plan: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          referral_slug?: string | null
          referred_by_user_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          subscription_plan?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_slug?: string | null
          referred_by_user_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          subscription_plan?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_user_id_fkey"
            columns: ["referred_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          activated_at: string | null
          commission_status: string | null
          commission_value: number
          created_at: string | null
          id: string
          level: number
          paid_at: string | null
          referred_user_id: string
          referrer_user_id: string
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          commission_status?: string | null
          commission_value: number
          created_at?: string | null
          id?: string
          level: number
          paid_at?: string | null
          referred_user_id: string
          referrer_user_id: string
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          commission_status?: string | null
          commission_value?: number
          created_at?: string | null
          id?: string
          level?: number
          paid_at?: string | null
          referred_user_id?: string
          referrer_user_id?: string
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vouchers: {
        Row: {
          code: string
          company_id: string | null
          created_at: string | null
          economy_value: number | null
          expires_at: string | null
          generated_at: string | null
          id: string
          offer_id: string | null
          qr_code_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          code: string
          company_id?: string | null
          created_at?: string | null
          economy_value?: number | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          offer_id?: string | null
          qr_code_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          code?: string
          company_id?: string | null
          created_at?: string | null
          economy_value?: number | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          offer_id?: string | null
          qr_code_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vouchers_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_referral_commissions: {
        Args: { p_user_id: string }
        Returns: number
      }
      generate_referral_slug:
        | { Args: { full_name: string }; Returns: string }
        | { Args: { p_name: string; p_user_id: string }; Returns: string }
      get_profile_name: { Args: { p_user_id: string }; Returns: string }
      get_referrer_by_slug: { Args: { p_slug: string }; Returns: Json }
      register_referral: {
        Args: {
          p_commission: number
          p_level: number
          p_referred_id: string
          p_referrer_id: string
        }
        Returns: Json
      }
      submit_empresa_lead: {
        Args: {
          p_email: string
          p_empresa_name: string
          p_instagram?: string
          p_nome: string
          p_phone: string
        }
        Returns: Json
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      lead_status: "novo" | "em_contato" | "convertido" | "perdido"
      subscription_status: "ativo" | "inativo" | "pendente" | "cancelado"
      user_role: "admin" | "empresa" | "cliente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      lead_status: ["novo", "em_contato", "convertido", "perdido"],
      subscription_status: ["ativo", "inativo", "pendente", "cancelado"],
      user_role: ["admin", "empresa", "cliente"],
    },
  },
} as const

