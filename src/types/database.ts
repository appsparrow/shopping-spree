
export interface Database {
  public: {
    Tables: {
      shopping_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          photo: string;
          price_original: number;
          price_converted: number;
          original_currency: string;
          converted_currency: string;
          exchange_rate: number;
          liked: boolean;
          purchased: boolean;
          timestamp: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          photo: string;
          price_original: number;
          price_converted: number;
          original_currency?: string;
          converted_currency?: string;
          exchange_rate: number;
          liked?: boolean;
          purchased?: boolean;
          timestamp?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          photo?: string;
          price_original?: number;
          price_converted?: number;
          original_currency?: string;
          converted_currency?: string;
          exchange_rate?: number;
          liked?: boolean;
          purchased?: boolean;
          timestamp?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          start_date: string;
          end_date: string;
          base_location: string | null;
          number_of_people: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          start_date: string;
          end_date: string;
          base_location?: string | null;
          number_of_people?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          base_location?: string | null;
          number_of_people?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      trip_cities: {
        Row: {
          id: string;
          trip_id: string;
          city_name: string;
          planned_days: number;
          start_date: string | null;
          end_date: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          city_name: string;
          planned_days?: number;
          start_date?: string | null;
          end_date?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          city_name?: string;
          planned_days?: number;
          start_date?: string | null;
          end_date?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      trip_activities: {
        Row: {
          id: string;
          trip_id: string;
          city_id: string | null;
          place_name: string;
          notes: string | null;
          photo_url: string | null;
          photo_metadata: any;
          completed: boolean;
          skipped: boolean;
          day_number: number | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          city_id?: string | null;
          place_name: string;
          notes?: string | null;
          photo_url?: string | null;
          photo_metadata?: any;
          completed?: boolean;
          skipped?: boolean;
          day_number?: number | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          city_id?: string | null;
          place_name?: string;
          notes?: string | null;
          photo_url?: string | null;
          photo_metadata?: any;
          completed?: boolean;
          skipped?: boolean;
          day_number?: number | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
