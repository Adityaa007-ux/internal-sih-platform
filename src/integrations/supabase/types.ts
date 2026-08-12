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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_allowlist: {
        Row: {
          created_at: string
          email: string
          note: string | null
        }
        Insert: {
          created_at?: string
          email: string
          note?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          note?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          archived: boolean
          body: string
          created_at: string
          id: string
          published: boolean
          tag: string
          title: string
        }
        Insert: {
          archived?: boolean
          body?: string
          created_at?: string
          id?: string
          published?: boolean
          tag?: string
          title: string
        }
        Update: {
          archived?: boolean
          body?: string
          created_at?: string
          id?: string
          published?: boolean
          tag?: string
          title?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor: string | null
          actor_label: string
          created_at: string
          detail: string
          id: string
        }
        Insert: {
          action: string
          actor?: string | null
          actor_label?: string
          created_at?: string
          detail?: string
          id?: string
        }
        Update: {
          action?: string
          actor?: string | null
          actor_label?: string
          created_at?: string
          detail?: string
          id?: string
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          created_at: string
          description: string
          due_at: string
          id: string
          label: string
          published: boolean
        }
        Insert: {
          created_at?: string
          description?: string
          due_at: string
          id?: string
          label: string
          published?: boolean
        }
        Update: {
          created_at?: string
          description?: string
          due_at?: string
          id?: string
          label?: string
          published?: boolean
        }
        Relationships: []
      }
      mentors: {
        Row: {
          active: boolean
          assigned_team: string | null
          created_at: string
          department: string
          email: string | null
          expertise: string
          id: string
          kind: string
          name: string
        }
        Insert: {
          active?: boolean
          assigned_team?: string | null
          created_at?: string
          department?: string
          email?: string | null
          expertise?: string
          id?: string
          kind?: string
          name: string
        }
        Update: {
          active?: boolean
          assigned_team?: string | null
          created_at?: string
          department?: string
          email?: string | null
          expertise?: string
          id?: string
          kind?: string
          name?: string
        }
        Relationships: []
      }
      otp_challenges: {
        Row: {
          attempts: number
          channel: string
          code_hash: string
          consumed: boolean
          contact: string
          created_at: string
          expires_at: string
          full_name: string | null
          id: string
          prn: string | null
          purpose: string
        }
        Insert: {
          attempts?: number
          channel: string
          code_hash: string
          consumed?: boolean
          contact: string
          created_at?: string
          expires_at: string
          full_name?: string | null
          id?: string
          prn?: string | null
          purpose?: string
        }
        Update: {
          attempts?: number
          channel?: string
          code_hash?: string
          consumed?: boolean
          contact?: string
          created_at?: string
          expires_at?: string
          full_name?: string | null
          id?: string
          prn?: string | null
          purpose?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          campus: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          id: string
          mobile: string | null
          prn: string
          status: string
          updated_at: string
          verified_channel: string
        }
        Insert: {
          campus?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id: string
          mobile?: string | null
          prn: string
          status?: string
          updated_at?: string
          verified_channel?: string
        }
        Update: {
          campus?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          mobile?: string | null
          prn?: string
          status?: string
          updated_at?: string
          verified_channel?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          created_at: string
          final_score: number | null
          id: string
          published: boolean
          published_at: string | null
          remarks: string
          status: string
          team_name: string
          team_ref: string
        }
        Insert: {
          created_at?: string
          final_score?: number | null
          id?: string
          published?: boolean
          published_at?: string | null
          remarks?: string
          status?: string
          team_name?: string
          team_ref: string
        }
        Update: {
          created_at?: string
          final_score?: number | null
          id?: string
          published?: boolean
          published_at?: string | null
          remarks?: string
          status?: string
          team_name?: string
          team_ref?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "admin" | "faculty" | "mentor"
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
      app_role: ["student", "admin", "faculty", "mentor"],
    },
  },
} as const
