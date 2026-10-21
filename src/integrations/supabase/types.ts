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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      empreendimentos: {
        Row: {
          atualizacoes: string
          cidade: string
          cliente: Json
          created_at: string
          custos: Json
          dados: Json
          endereco: string
          etapa: string
          ficha_publica: string
          foto_capa: string | null
          fotos: string[]
          id: string
          prazo: string | null
          publicado: boolean
          senha_hash: string | null
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          atualizacoes?: string
          cidade?: string
          cliente?: Json
          created_at?: string
          custos?: Json
          dados?: Json
          endereco?: string
          etapa?: string
          ficha_publica?: string
          foto_capa?: string | null
          fotos?: string[]
          id?: string
          prazo?: string | null
          publicado?: boolean
          senha_hash?: string | null
          status?: string
          titulo?: string
          updated_at?: string
        }
        Update: {
          atualizacoes?: string
          cidade?: string
          cliente?: Json
          created_at?: string
          custos?: Json
          dados?: Json
          endereco?: string
          etapa?: string
          ficha_publica?: string
          foto_capa?: string | null
          fotos?: string[]
          id?: string
          prazo?: string | null
          publicado?: boolean
          senha_hash?: string | null
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      orcamentos: {
        Row: {
          created_at: string
          custos: Json
          empreendimento_id: string
          id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custos?: Json
          empreendimento_id: string
          id?: string
          titulo?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custos?: Json
          empreendimento_id?: string
          id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_tentativas: {
        Row: {
          chave: string
          created_at: string
          id: number
        }
        Insert: {
          chave: string
          created_at?: string
          id?: number
        }
        Update: {
          chave?: string
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      produtos: {
        Row: {
          created_at: string
          id: string
          nome: string
          preco: number
          quantidade: number
          unidade: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome?: string
          preco?: number
          quantidade?: number
          unidade?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          preco?: number
          quantidade?: number
          unidade?: string
          updated_at?: string
        }
        Relationships: []
      }
      unidades: {
        Row: {
          atualizacoes: string
          conclusao: string | null
          created_at: string
          empreendimento_id: string
          fotos: string[]
          id: string
          identificador: string
          inicio: string | null
          senha_hash: string | null
          servicos: string
          updated_at: string
        }
        Insert: {
          atualizacoes?: string
          conclusao?: string | null
          created_at?: string
          empreendimento_id: string
          fotos?: string[]
          id?: string
          identificador?: string
          inicio?: string | null
          senha_hash?: string | null
          servicos?: string
          updated_at?: string
        }
        Update: {
          atualizacoes?: string
          conclusao?: string | null
          created_at?: string
          empreendimento_id?: string
          fotos?: string[]
          id?: string
          identificador?: string
          inicio?: string | null
          senha_hash?: string | null
          servicos?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unidades_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      definir_senha_obra: {
        Args: { _id: string; _senha: string }
        Returns: undefined
      }
      definir_senha_unidade: {
        Args: { _id: string; _senha: string }
        Returns: undefined
      }
      foto_publicada: { Args: { _path: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      obras_publicas: {
        Args: never
        Returns: {
          cidade: string
          endereco: string
          etapa: string
          fotos: string[]
          id: string
          prazo: string
          status: string
          titulo: string
        }[]
      }
      portal_obra: {
        Args: { _id: string; _ip: string; _senha: string }
        Returns: Json
      }
      portal_unidade: {
        Args: { _ip: string; _obra: string; _senha: string; _unidade: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
    },
  },
} as const
