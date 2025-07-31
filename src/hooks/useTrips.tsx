
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/database';

type Trip = Database['public']['Tables']['trips']['Row'];
type TripCity = Database['public']['Tables']['trip_cities']['Row'];
type TripActivity = Database['public']['Tables']['trip_activities']['Row'];

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTrips(data || []);
      if (data && data.length > 0 && !currentTrip) {
        setCurrentTrip(data[0]);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: Database['public']['Tables']['trips']['Insert']) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('trips')
        .insert({ ...tripData, user_id: user.user.id })
        .select()
        .single();
      
      if (error) throw error;
      setTrips(prev => [data, ...prev]);
      setCurrentTrip(data);
      return data;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  };

  const updateTrip = async (id: string, updates: Database['public']['Tables']['trips']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setTrips(prev => prev.map(trip => trip.id === id ? data : trip));
      if (currentTrip?.id === id) {
        setCurrentTrip(data);
      }
      return data;
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return {
    trips,
    currentTrip,
    setCurrentTrip,
    loading,
    createTrip,
    updateTrip,
    refetch: fetchTrips
  };
};
