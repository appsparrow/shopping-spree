
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, Camera, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { useActivities } from '@/hooks/useActivities';
import { supabase } from '@/integrations/supabase/client';

interface TripViewProps {
  tripId: string;
  onBack: () => void;
  onSetup: () => void;
}

const TripView = ({ tripId, onBack, onSetup }: TripViewProps) => {
  const { currentTrip } = useTrips();
  const { activities, updateActivity } = useActivities(tripId);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  const toggleActivity = async (activityId: string, completed: boolean) => {
    try {
      await updateActivity(activityId, { completed });
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const skipActivity = async (activityId: string) => {
    try {
      await updateActivity(activityId, { skipped: true });
    } catch (error) {
      console.error('Error skipping activity:', error);
    }
  };

  const uploadPhoto = async (activityId: string, file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${tripId}/${activityId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('travel-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('travel-photos')
        .getPublicUrl(filePath);

      await updateActivity(activityId, { 
        photo_url: publicUrl,
        photo_metadata: { 
          fileName,
          fileSize: file.size,
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  if (!currentTrip) {
    return <div className="flex justify-center items-center h-64">Loading trip...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold">{currentTrip.name}</h1>
        <Button variant="ghost" onClick={onSetup} className="text-sm">
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
                    disabled={activity.skipped}
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
