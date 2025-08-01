
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/database';

type City = Database['public']['Tables']['trip_cities']['Row'];
type CityInsert = Database['public']['Tables']['trip_cities']['Insert'];
type CityUpdate = Database['public']['Tables']['trip_cities']['Update'];

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

  const updateCity = async (cityId: string, updates: CityUpdate) => {
    try {
      const { data, error } = await supabase
        .from('trip_cities')
        .update(updates)
        .eq('id', cityId)
        .select()
        .single();
      
      if (error) throw error;
      setCities(prev => prev.map(city => 
        city.id === cityId ? data : city
      ));
      return data;
    } catch (error) {
      console.error('Error updating city:', error);
      throw error;
    }
  };

  const deleteCity = async (cityId: string) => {
    try {
      const { error } = await supabase
        .from('trip_cities')
        .delete()
        .eq('id', cityId);
      
      if (error) throw error;
      setCities(prev => prev.filter(city => city.id !== cityId));
    } catch (error) {
      console.error('Error deleting city:', error);
      throw error;
    }
  };

  const reorderCities = async (reorderedCities: City[]) => {
    try {
      // Update sort_order for each city
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

      // Update local state
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
