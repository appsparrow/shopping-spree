export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      shopping_items: {
        Row: {
          converted_currency: string
          created_at: string
          exchange_rate: number
          id: string
          liked: boolean
          name: string
          original_currency: string
          photo: string
          price_converted: number
          price_original: number
          purchased: boolean
          timestamp: string
          updated_at: string
          user_id: string
        }
        Insert: {
          converted_currency?: string
          created_at?: string
          exchange_rate: number
          id?: string
          liked?: boolean
          name: string
          original_currency?: string
          photo: string
          price_converted: number
          price_original: number
          purchased?: boolean
          timestamp?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          converted_currency?: string
          created_at?: string
          exchange_rate?: number
          id?: string
          liked?: boolean
          name?: string
          original_currency?: string
          photo?: string
          price_converted?: number
          price_original?: number
          purchased?: boolean
          timestamp?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trip_activities: {
        Row: {
          city_id: string | null
          completed: boolean | null
          created_at: string
          day_number: number | null
          id: string
          notes: string | null
          photo_metadata: Json | null
          photo_url: string | null
          place_name: string
          skipped: boolean | null
          sort_order: number | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          city_id?: string | null
          completed?: boolean | null
          created_at?: string
          day_number?: number | null
          id?: string
          notes?: string | null
          photo_metadata?: Json | null
          photo_url?: string | null
          place_name: string
          skipped?: boolean | null
          sort_order?: number | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          city_id?: string | null
          completed?: boolean | null
          created_at?: string
          day_number?: number | null
          id?: string
          notes?: string | null
          photo_metadata?: Json | null
          photo_url?: string | null
          place_name?: string
          skipped?: boolean | null
          sort_order?: number | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_activities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "trip_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_activities_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_cities: {
        Row: {
          city_name: string
          created_at: string
          end_date: string | null
          id: string
          planned_days: number | null
          sort_order: number | null
          start_date: string | null
          trip_id: string
        }
        Insert: {
          city_name: string
          created_at?: string
          end_date?: string | null
          id?: string
          planned_days?: number | null
          sort_order?: number | null
          start_date?: string | null
          trip_id: string
        }
        Update: {
          city_name?: string
          created_at?: string
          end_date?: string | null
          id?: string
          planned_days?: number | null
          sort_order?: number | null
          start_date?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_cities_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          base_location: string | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          number_of_people: number | null
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_location?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          number_of_people?: number | null
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          base_location?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          number_of_people?: number | null
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
