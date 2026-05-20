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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      complaint_attachments: {
        Row: {
          complaint_id: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          uploaded_by: string | null
        }
        Insert: {
          complaint_id: string
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          complaint_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_attachments_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_timeline: {
        Row: {
          action: string
          complaint_id: string
          created_at: string
          details: string | null
          id: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          action: string
          complaint_id: string
          created_at?: string
          details?: string | null
          id?: string
          user_id?: string | null
          user_name?: string
        }
        Update: {
          action?: string
          complaint_id?: string
          created_at?: string
          details?: string | null
          id?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_timeline_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_tracking: {
        Row: {
          complaint_id: string
          created_at: string
          email: string | null
          id: string
          tracking_code: string
        }
        Insert: {
          complaint_id: string
          created_at?: string
          email?: string | null
          id?: string
          tracking_code: string
        }
        Update: {
          complaint_id?: string
          created_at?: string
          email?: string | null
          id?: string
          tracking_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_tracking_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          anonymous: boolean
          assigned_to: string | null
          coordinates: string | null
          created_at: string
          description: string
          id: string
          location: string
          priority: Database["public"]["Enums"]["complaint_priority"]
          protocol: string
          reporter_email: string | null
          reporter_name: string | null
          reporter_phone: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          type: Database["public"]["Enums"]["complaint_type"]
          updated_at: string
        }
        Insert: {
          anonymous?: boolean
          assigned_to?: string | null
          coordinates?: string | null
          created_at?: string
          description?: string
          id?: string
          location: string
          priority?: Database["public"]["Enums"]["complaint_priority"]
          protocol: string
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          type?: Database["public"]["Enums"]["complaint_type"]
          updated_at?: string
        }
        Update: {
          anonymous?: boolean
          assigned_to?: string | null
          coordinates?: string | null
          created_at?: string
          description?: string
          id?: string
          location?: string
          priority?: Database["public"]["Enums"]["complaint_priority"]
          protocol?: string
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          type?: Database["public"]["Enums"]["complaint_type"]
          updated_at?: string
        }
        Relationships: []
      }
      license_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          license_id: string
          uploaded_by: string | null
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          license_id: string
          uploaded_by?: string | null
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          license_id?: string
          uploaded_by?: string | null
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "license_documents_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      license_timeline: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          license_id: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          license_id: string
          user_id?: string | null
          user_name?: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          license_id?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "license_timeline_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          applicant_document: string
          applicant_email: string
          applicant_name: string
          applicant_phone: string | null
          approved_at: string | null
          area_size: number | null
          assigned_to: string | null
          created_at: string
          description: string | null
          enterprise_activity: string
          enterprise_address: string
          enterprise_coordinates: string | null
          enterprise_name: string
          expires_at: string | null
          id: string
          protocol: string
          status: Database["public"]["Enums"]["license_status"]
          submitted_at: string | null
          type: Database["public"]["Enums"]["license_type"]
          updated_at: string
        }
        Insert: {
          applicant_document: string
          applicant_email: string
          applicant_name: string
          applicant_phone?: string | null
          approved_at?: string | null
          area_size?: number | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          enterprise_activity: string
          enterprise_address: string
          enterprise_coordinates?: string | null
          enterprise_name: string
          expires_at?: string | null
          id?: string
          protocol: string
          status?: Database["public"]["Enums"]["license_status"]
          submitted_at?: string | null
          type?: Database["public"]["Enums"]["license_type"]
          updated_at?: string
        }
        Update: {
          applicant_document?: string
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string | null
          approved_at?: string | null
          area_size?: number | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          enterprise_activity?: string
          enterprise_address?: string
          enterprise_coordinates?: string | null
          enterprise_name?: string
          expires_at?: string | null
          id?: string
          protocol?: string
          status?: Database["public"]["Enums"]["license_status"]
          submitted_at?: string | null
          type?: Database["public"]["Enums"]["license_type"]
          updated_at?: string
        }
        Relationships: []
      }
      performance_goals: {
        Row: {
          category: string
          created_at: string
          current_value: number | null
          description: string | null
          id: string
          period_end: string
          period_start: string
          status: string
          target_value: number | null
          title: string
          unit: string | null
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          period_end: string
          period_start: string
          status?: string
          target_value?: number | null
          title: string
          unit?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          period_end?: string
          period_start?: string
          status?: string
          target_value?: number | null
          title?: string
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          position: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_participants: {
        Row: {
          certificate_url: string | null
          completed_at: string | null
          enrolled_at: string
          id: string
          score: number | null
          status: string
          training_id: string
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          completed_at?: string | null
          enrolled_at?: string
          id?: string
          score?: number | null
          status?: string
          training_id: string
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          completed_at?: string | null
          enrolled_at?: string
          id?: string
          score?: number | null
          status?: string
          training_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_participants_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          created_at: string
          description: string | null
          duration_hours: number | null
          end_date: string | null
          id: string
          instructor: string | null
          max_participants: number | null
          start_date: string | null
          status: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          end_date?: string | null
          id?: string
          instructor?: string | null
          max_participants?: number | null
          start_date?: string | null
          status?: string
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          end_date?: string | null
          id?: string
          instructor?: string | null
          max_participants?: number | null
          start_date?: string | null
          status?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_protocol: { Args: { prefix: string }; Returns: string }
      generate_tracking_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      complaint_priority: "low" | "medium" | "high"
      complaint_status:
        | "pending"
        | "under_analysis"
        | "in_progress"
        | "resolved"
        | "archived"
      complaint_type:
        | "desmatamento"
        | "queimada"
        | "poluicao_hidrica"
        | "poluicao_ar"
        | "descarte_irregular"
        | "caca_ilegal"
        | "mineracao_ilegal"
        | "outros"
      license_status:
        | "draft"
        | "submitted"
        | "documentation"
        | "technical_analysis"
        | "approved"
        | "rejected"
        | "expired"
      license_type:
        | "previa"
        | "instalacao"
        | "operacao"
        | "simplificada"
        | "autorizacao"
      user_role: "admin" | "analyst" | "inspector" | "viewer"
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
      complaint_priority: ["low", "medium", "high"],
      complaint_status: [
        "pending",
        "under_analysis",
        "in_progress",
        "resolved",
        "archived",
      ],
      complaint_type: [
        "desmatamento",
        "queimada",
        "poluicao_hidrica",
        "poluicao_ar",
        "descarte_irregular",
        "caca_ilegal",
        "mineracao_ilegal",
        "outros",
      ],
      license_status: [
        "draft",
        "submitted",
        "documentation",
        "technical_analysis",
        "approved",
        "rejected",
        "expired",
      ],
      license_type: [
        "previa",
        "instalacao",
        "operacao",
        "simplificada",
        "autorizacao",
      ],
      user_role: ["admin", "analyst", "inspector", "viewer"],
    },
  },
} as const
