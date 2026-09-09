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
      campuses: {
        Row: {
          address: string | null
          campus_code: string | null
          campus_name: string
          city: string | null
          created_at: string
          id: string
          institution_id: string
          state: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          campus_code?: string | null
          campus_name: string
          city?: string | null
          created_at?: string
          id?: string
          institution_id: string
          state?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          campus_code?: string | null
          campus_name?: string
          city?: string | null
          created_at?: string
          id?: string
          institution_id?: string
          state?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campuses_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
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
      industrial_mentor_profiles: {
        Row: {
          accepting_requests: boolean
          bio: string
          certifications: string | null
          company: string
          contact_email: string
          created_at: string
          designation: string
          experience_years: number
          expertise: string
          full_name: string
          id: string
          industry: string
          linkedin_url: string
          mentor_scope: string
          mobile: string
          photo_url: string | null
          portfolio_url: string | null
          skills: string
          status: string
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          accepting_requests?: boolean
          bio?: string
          certifications?: string | null
          company: string
          contact_email: string
          created_at?: string
          designation: string
          experience_years?: number
          expertise?: string
          full_name: string
          id?: string
          industry?: string
          linkedin_url: string
          mentor_scope?: string
          mobile: string
          photo_url?: string | null
          portfolio_url?: string | null
          skills?: string
          status?: string
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          accepting_requests?: boolean
          bio?: string
          certifications?: string | null
          company?: string
          contact_email?: string
          created_at?: string
          designation?: string
          experience_years?: number
          expertise?: string
          full_name?: string
          id?: string
          industry?: string
          linkedin_url?: string
          mentor_scope?: string
          mobile?: string
          photo_url?: string | null
          portfolio_url?: string | null
          skills?: string
          status?: string
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      institution_domains: {
        Row: {
          created_at: string
          domain: string
          id: string
          institution_id: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          institution_id: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          institution_id?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_domains_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          city: string | null
          created_at: string
          id: string
          institution_type: string
          official_name: string
          short_name: string
          state: string | null
          status: string
          university_name: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          institution_type?: string
          official_name: string
          short_name: string
          state?: string | null
          status?: string
          university_name?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          institution_type?: string
          official_name?: string
          short_name?: string
          state?: string | null
          status?: string
          university_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mentor_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          request_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          request_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "mentorship_requests"
            referencedColumns: ["id"]
          },
        ]
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
      mentorship_requests: {
        Row: {
          created_at: string
          id: string
          institution_id: string | null
          mentor_user_id: string
          message: string
          responded_at: string | null
          response_note: string
          status: string
          student_id: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id?: string | null
          mentor_user_id: string
          message?: string
          responded_at?: string | null
          response_note?: string
          status?: string
          student_id: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string | null
          mentor_user_id?: string
          message?: string
          responded_at?: string | null
          response_note?: string
          status?: string
          student_id?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_requests_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_challenges: {
        Row: {
          attempts: number
          channel: string
          code_hash: string
          consumed: boolean
          contact: string
          created_at: string
          email: string | null
          expires_at: string
          full_name: string | null
          id: string
          mobile: string | null
          prn: string | null
          purpose: string
          role: string | null
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          channel: string
          code_hash: string
          consumed?: boolean
          contact: string
          created_at?: string
          email?: string | null
          expires_at: string
          full_name?: string | null
          id?: string
          mobile?: string | null
          prn?: string | null
          purpose?: string
          role?: string | null
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          channel?: string
          code_hash?: string
          consumed?: boolean
          contact?: string
          created_at?: string
          email?: string | null
          expires_at?: string
          full_name?: string | null
          id?: string
          mobile?: string | null
          prn?: string | null
          purpose?: string
          role?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: string
          auth_email: string | null
          campus: string | null
          campus_id: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          id: string
          institution_id: string | null
          mobile: string | null
          prn: string | null
          status: string
          updated_at: string
          verified_channel: string
        }
        Insert: {
          approval_status?: string
          auth_email?: string | null
          campus?: string | null
          campus_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id: string
          institution_id?: string | null
          mobile?: string | null
          prn?: string | null
          status?: string
          updated_at?: string
          verified_channel?: string
        }
        Update: {
          approval_status?: string
          auth_email?: string | null
          campus?: string | null
          campus_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          institution_id?: string | null
          mobile?: string | null
          prn?: string | null
          status?: string
          updated_at?: string
          verified_channel?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
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
      team_members: {
        Row: {
          created_at: string
          is_leader: boolean
          member_name: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          is_leader?: boolean
          member_name?: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          is_leader?: boolean
          member_name?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          campus: string | null
          code: string
          created_at: string
          department: string | null
          id: string
          leader_id: string
          name: string
          selected_at: string | null
          selected_by: string | null
          selected_ps_id: string | null
          selected_ps_org: string | null
          selected_ps_title: string | null
          updated_at: string
        }
        Insert: {
          campus?: string | null
          code: string
          created_at?: string
          department?: string | null
          id?: string
          leader_id: string
          name: string
          selected_at?: string | null
          selected_by?: string | null
          selected_ps_id?: string | null
          selected_ps_org?: string | null
          selected_ps_title?: string | null
          updated_at?: string
        }
        Update: {
          campus?: string | null
          code?: string
          created_at?: string
          department?: string | null
          id?: string
          leader_id?: string
          name?: string
          selected_at?: string | null
          selected_by?: string | null
          selected_ps_id?: string | null
          selected_ps_org?: string | null
          selected_ps_title?: string | null
          updated_at?: string
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
      user_sessions: {
        Row: {
          created_at: string
          device_label: string
          expires_at: string
          id: string
          institution_id: string | null
          last_activity_at: string
          revoked_at: string | null
          role: string | null
          session_token_hash: string
          status: string
          user_agent: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_label?: string
          expires_at?: string
          id?: string
          institution_id?: string | null
          last_activity_at?: string
          revoked_at?: string | null
          role?: string | null
          session_token_hash: string
          status?: string
          user_agent?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_label?: string
          expires_at?: string
          id?: string
          institution_id?: string | null
          last_activity_at?: string
          revoked_at?: string | null
          role?: string | null
          session_token_hash?: string
          status?: string
          user_agent?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
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
      is_request_participant: {
        Args: { _request_id: string; _user_id: string }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
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
      app_role: ["student", "admin", "faculty", "mentor"],
    },
  },
} as const
