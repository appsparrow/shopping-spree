
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, Camera, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { useCities } from '@/hooks/useCities';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  id: string;
  place_name: string;
  notes?: string;
  photo_url?: string;
  completed: boolean;
  skipped: boolean;
  day_number?: number;
}

interface TripViewProps {
  tripId: string;
  onBack: () => void;
  onSetup: () => void;
}

const TripView = ({ tripId, onBack, onSetup }: TripViewProps) => {
  const { currentTrip } = useTrips();
  const { cities } = useCities(tripId);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [tripId]);

  const fetchActivities = async () => {
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

  const toggleActivity = async (activityId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('trip_activities')
        .update({ completed, updated_at: new Date().toISOString() })
        .eq('id', activityId);
      
      if (error) throw error;
      
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId ? { ...activity, completed } : activity
        )
      );
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const skipActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('trip_activities')
        .update({ skipped: true, updated_at: new Date().toISOString() })
        .eq('id', activityId);
      
      if (error) throw error;
      
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId ? { ...activity, skipped: true } : activity
        )
      );
    } catch (error) {
      console.error('Error skipping activity:', error);
    }
  };

  const uploadPhoto = async (activityId: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${tripId}/${activityId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('travel-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('travel-photos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('trip_activities')
        .update({ photo_url: publicUrl })
        .eq('id', activityId);

      if (updateError) throw updateError;

      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId ? { ...activity, photo_url: publicUrl } : activity
        )
      );
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold">{currentTrip?.name}</h1>
        <Button variant="ghost" onClick={onSetup} className="p-2">
          Setup
        </Button>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <Card key={activity.id} className={`${activity.skipped ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleActivity(activity.id, !activity.completed)}
                  className={`p-2 ${activity.completed ? 'text-green-600' : 'text-gray-400'}`}
                >
                  <Check className="w-4 h-4" />
                </Button>

                <div className="flex-1">
                  <h3 className={`font-medium ${activity.skipped ? 'line-through text-gray-500' : ''}`}>
                    {activity.place_name}
                  </h3>
                  {activity.day_number && (
                    <p className="text-sm text-gray-500">Day {activity.day_number}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activity.photo_url && (
                    <img 
                      src={activity.photo_url} 
                      alt="" 
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadPhoto(activity.id, file);
                    }}
                    className="hidden"
                    id={`photo-${activity.id}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => document.getElementById(`photo-${activity.id}`)?.click()}
                    className="p-2"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skipActivity(activity.id)}
                    className="p-2 text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedActivity(
                      expandedActivity === activity.id ? null : activity.id
                    )}
                    className="p-2"
                  >
                    {expandedActivity === activity.id ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                    }
                  </Button>
                </div>
              </div>

              {expandedActivity === activity.id && (activity.notes || activity.photo_url) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {activity.notes && (
                    <p className="text-sm text-gray-600 mb-3">{activity.notes}</p>
                  )}
                  {activity.photo_url && (
                    <img 
                      src={activity.photo_url} 
                      alt={activity.place_name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No activities planned yet</p>
          <Button onClick={onSetup} variant="outline">
            Setup your trip
          </Button>
        </div>
      )}
    </div>
  );
};

export default TripView;
