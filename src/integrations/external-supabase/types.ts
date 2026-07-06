// AUTO-GENERATED from the EXTERNAL Supabase project's schema. Do not edit by hand.
// Regenerate if the external schema changes.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          membership_number: string;
          child_name: string | null;
          parent_name: string | null;
          service: string;
          booking_date: string | null;
          booking_time: string | null;
          status: string | null;
          waiver_accepted: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          membership_number: string;
          child_name?: string | null;
          parent_name?: string | null;
          service: string;
          booking_date?: string | null;
          booking_time?: string | null;
          status?: string | null;
          waiver_accepted?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          membership_number?: string | null;
          child_name?: string | null;
          parent_name?: string | null;
          service?: string | null;
          booking_date?: string | null;
          booking_time?: string | null;
          status?: string | null;
          waiver_accepted?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      children: {
        Row: {
          id: string;
          membership_number: string;
          first_name: string;
          last_name: string;
          dob: string | null;
          sex: string | null;
          allergies: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          membership_number: string;
          first_name: string;
          last_name: string;
          dob?: string | null;
          sex?: string | null;
          allergies?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          membership_number?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          dob?: string | null;
          sex?: string | null;
          allergies?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      enrollments: {
        Row: {
          id: string;
          child_full_name: string;
          child_dob: string;
          child_gender: string | null;
          child_nickname: string | null;
          parent_full_name: string;
          parent_relationship: string;
          parent_phone: string;
          parent_email: string;
          home_address: string;
          ec1_name: string;
          ec1_relationship: string;
          ec1_phone: string;
          ec2_name: string | null;
          ec2_relationship: string | null;
          ec2_phone: string | null;
          allergies: string;
          medications: string | null;
          medical_conditions: string | null;
          doctor_name: string | null;
          doctor_phone: string | null;
          services: Json;
          preferred_start_date: string;
          dropoff_time: string | null;
          consent: boolean;
          created_at: string | null;
        };
        Insert: {
          id: string;
          child_full_name: string;
          child_dob: string;
          child_gender?: string | null;
          child_nickname?: string | null;
          parent_full_name: string;
          parent_relationship: string;
          parent_phone: string;
          parent_email: string;
          home_address: string;
          ec1_name: string;
          ec1_relationship: string;
          ec1_phone: string;
          ec2_name?: string | null;
          ec2_relationship?: string | null;
          ec2_phone?: string | null;
          allergies: string;
          medications?: string | null;
          medical_conditions?: string | null;
          doctor_name?: string | null;
          doctor_phone?: string | null;
          services: Json;
          preferred_start_date: string;
          dropoff_time?: string | null;
          consent: boolean;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          child_full_name?: string | null;
          child_dob?: string | null;
          child_gender?: string | null;
          child_nickname?: string | null;
          parent_full_name?: string | null;
          parent_relationship?: string | null;
          parent_phone?: string | null;
          parent_email?: string | null;
          home_address?: string | null;
          ec1_name?: string | null;
          ec1_relationship?: string | null;
          ec1_phone?: string | null;
          ec2_name?: string | null;
          ec2_relationship?: string | null;
          ec2_phone?: string | null;
          allergies?: string | null;
          medications?: string | null;
          medical_conditions?: string | null;
          doctor_name?: string | null;
          doctor_phone?: string | null;
          services?: Json | null;
          preferred_start_date?: string | null;
          dropoff_time?: string | null;
          consent?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      parents: {
        Row: {
          id: string;
          child_id: string | null;
          name: string;
          phone: string;
          email: string | null;
          emergency_contact: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          child_id?: string | null;
          name: string;
          phone: string;
          email?: string | null;
          emergency_contact?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          child_id?: string | null;
          name?: string | null;
          phone?: string | null;
          email?: string | null;
          emergency_contact?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          sort_order: number | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          sort_order?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          name?: string | null;
          description?: string | null;
          sort_order?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
