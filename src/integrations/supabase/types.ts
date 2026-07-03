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
      bookings: {
        Row: {
          booking_date: string | null
          booking_time: string | null
          child_id: string | null
          created_at: string
          id: string
          membership_number: string
          parent_id: string | null
          service: string
          status: string
          waiver_accepted: boolean
        }
        Insert: {
          booking_date?: string | null
          booking_time?: string | null
          child_id?: string | null
          created_at?: string
          id?: string
          membership_number: string
          parent_id?: string | null
          service: string
          status?: string
          waiver_accepted?: boolean
        }
        Update: {
          booking_date?: string | null
          booking_time?: string | null
          child_id?: string | null
          created_at?: string
          id?: string
          membership_number?: string
          parent_id?: string | null
          service?: string
          status?: string
          waiver_accepted?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "bookings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          allergies: string | null
          created_at: string
          dob: string | null
          doctor_name: string | null
          doctor_phone: string | null
          first_name: string
          id: string
          last_name: string
          medical_conditions: string | null
          membership_number: string
          notes: string | null
          parent_id: string
          service_preferences: string | null
          sex: string | null
        }
        Insert: {
          allergies?: string | null
          created_at?: string
          dob?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          first_name: string
          id?: string
          last_name: string
          medical_conditions?: string | null
          membership_number?: string
          notes?: string | null
          parent_id: string
          service_preferences?: string | null
          sex?: string | null
        }
        Update: {
          allergies?: string | null
          created_at?: string
          dob?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          first_name?: string
          id?: string
          last_name?: string
          medical_conditions?: string | null
          membership_number?: string
          notes?: string | null
          parent_id?: string
          service_preferences?: string | null
          sex?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          created_at: string
          email: string | null
          emergency_contact: string | null
          emergency_contact_alt_phone: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          home_address: string | null
          id: string
          name: string
          phone: string
          relationship: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          emergency_contact_alt_phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          home_address?: string | null
          id?: string
          name: string
          phone: string
          relationship?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          emergency_contact_alt_phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          home_address?: string | null
          id?: string
          name?: string
          phone?: string
          relationship?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _admin_password: { Args: never; Returns: string }
      app_admin_bookings: { Args: { p_password: string }; Returns: Json }
      app_admin_members: { Args: { p_password: string }; Returns: Json }
      app_admin_overview: { Args: { p_password: string }; Returns: Json }
      app_admin_update_booking: {
        Args: { p_id: string; p_password: string; p_status: string }
        Returns: undefined
      }
      app_create_booking: {
        Args: {
          p_date: string
          p_mnum: string
          p_service: string
          p_time: string
          p_waiver: boolean
        }
        Returns: string
      }
      app_lookup_member: { Args: { p_mnum: string }; Returns: Json }
      app_register_and_book: {
        Args: {
          p_child: Json
          p_date: string
          p_parent: Json
          p_service: string
          p_time: string
          p_waiver: boolean
        }
        Returns: string
      }
      app_register_member: {
        Args: { p_child: Json; p_parent: Json }
        Returns: string
      }
      next_membership_number: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
