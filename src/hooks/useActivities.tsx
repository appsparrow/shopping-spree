
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/database';

type TripActivity = Database['public']['Tables']['trip_activities']['Row'];

export const useActivities = (tripId: string | null) => {
  const [activities, setActivities] = useState<TripActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    if (!tripId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trip_activities')
        .select('*')
        .eq('trip_id', tripId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (activityData: Database['public']['Tables']['trip_activities']['Insert']) => {
    if (!tripId) return;

    try {
      const { data, error } = await supabase
        .from('trip_activities')
        .insert({
          ...activityData,
          trip_id: tripId,
          sort_order: activities.length
        })
        .select()
        .single();
      
      if (error) throw error;
      setActivities(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  };

  const updateActivity = async (id: string, updates: Partial<TripActivity>) => {
    try {
      const { data, error } = await supabase
        .from('trip_activities')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setActivities(prev => prev.map(activity => activity.id === id ? data : activity));
      return data;
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trip_activities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setActivities(prev => prev.filter(activity => activity.id !== id));
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [tripId]);

  return {
    activities,
    loading,
    addActivity,
    updateActivity,
    deleteActivity,
    refetch: fetchActivities
  };
};
