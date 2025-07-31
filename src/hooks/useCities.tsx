
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type TripCity = Database['public']['Tables']['trip_cities']['Row'];

export const useCities = (tripId: string | null) => {
  const [cities, setCities] = useState<TripCity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCities = async () => {
    if (!tripId) return;
    
    setLoading(true);
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

  const addCity = async (cityData: { city_name: string; planned_days: number }) => {
    if (!tripId) return;

    try {
      const { data, error } = await supabase
        .from('trip_cities')
        .insert({
          trip_id: tripId,
          ...cityData,
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

  const updateCity = async (id: string, updates: Partial<TripCity>) => {
    try {
      const { data, error } = await supabase
        .from('trip_cities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setCities(prev => prev.map(city => city.id === id ? data : city));
      return data;
    } catch (error) {
      console.error('Error updating city:', error);
      throw error;
    }
  };

  const deleteCity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trip_cities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setCities(prev => prev.filter(city => city.id !== id));
    } catch (error) {
      console.error('Error deleting city:', error);
      throw error;
    }
  };

  const reorderCities = async (reorderedCities: TripCity[]) => {
    try {
      const updates = reorderedCities.map((city, index) => ({
        id: city.id,
        sort_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('trip_cities')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }
      
      setCities(reorderedCities);
    } catch (error) {
      console.error('Error reordering cities:', error);
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
    updateCity,
    deleteCity,
    reorderCities,
    refetch: fetchCities
  };
};
