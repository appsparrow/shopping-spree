
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/database';

type City = Database['public']['Tables']['trip_cities']['Row'];
type CityInsert = Database['public']['Tables']['trip_cities']['Insert'];

export const useCities = (tripId: string | null) => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCities = async () => {
    if (!tripId) {
      setCities([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trip_cities')
        .select('*')
        .eq('trip_id', tripId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCity = async (cityData: Omit<CityInsert, 'trip_id'>) => {
    if (!tripId) throw new Error('No trip ID provided');

    try {
      const { data, error } = await supabase
        .from('trip_cities')
        .insert({ 
          ...cityData, 
          trip_id: tripId,
          sort_order: cities.length 
        })
        .select()
        .single();
      
      if (error) throw error;
      setCities(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding city:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCities();
  }, [tripId]);

  return {
    cities,
    loading,
    addCity,
    refetch: fetchCities
  };
};
