
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Trash2, Settings, Calendar } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { supabase } from '@/integrations/supabase/client';

interface TripsListProps {
  onSelectTrip: (tripId: string) => void;
  onCreateTrip: () => void;
}

const TripsList = ({ onSelectTrip, onCreateTrip }: TripsListProps) => {
  const { trips, loading } = useTrips();

  const formatMonthYear = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleDeleteTrip = async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this trip?')) {
      try {
        await supabase.from('trips').delete().eq('id', tripId);
        window.location.reload(); // Simple refresh for now
      } catch (error) {
        console.error('Error deleting trip:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading trips...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Travel Plans</h1>
        <Button onClick={onCreateTrip} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Trip
        </Button>
      </div>

      <div className="space-y-3">
        {trips.map((trip) => (
          <Card 
            key={trip.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectTrip(trip.id)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{trip.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {trip.base_location && `📍 ${trip.base_location}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {trip.number_of_people} {trip.number_of_people === 1 ? 'person' : 'people'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatMonthYear(trip.start_date)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteTrip(trip.id, e)}
                    className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Swipe for settings</span>
                  <span>Tap to open</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {trips.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="mb-4">No travel plans yet</p>
          <Button onClick={onCreateTrip} variant="outline">
            Create your first trip
          </Button>
        </div>
      )}
    </div>
  );
};

export default TripsList;
