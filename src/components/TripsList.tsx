
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Trash2, Calendar, MapPin, Users, Sparkles } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { supabase } from '@/integrations/supabase/client';

interface TripsListProps {
  onSelectTrip: (tripId: string) => void;
  onCreateTrip: () => void;
}

const TripsList = ({ onSelectTrip, onCreateTrip }: TripsListProps) => {
  const { trips, loading, setCurrentTrip, refetch } = useTrips();

  const formatMonthYear = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleDeleteTrip = async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this trip? This action cannot be undone.')) {
      try {
        const { error } = await supabase.from('trips').delete().eq('id', tripId);
        if (error) throw error;
        refetch(); // Refresh the list
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Failed to delete trip. Please try again.');
      }
    }
  };

  const handleSelectTrip = (tripId: string) => {
    setCurrentTrip(tripId);
    onSelectTrip(tripId);
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
            onClick={() => handleSelectTrip(trip.id)}
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
                  
                  {/* Show preferences if they exist */}
                  {trip.preferences && (
                    <div className="mt-3 space-y-2">
                      {trip.preferences.interests && trip.preferences.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {trip.preferences.interests.slice(0, 3).map((interest: string) => (
                            <Badge key={interest} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {trip.preferences.interests.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{trip.preferences.interests.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {trip.preferences.kidAges && trip.preferences.kidAges.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {trip.preferences.kidAges.map((age: string) => (
                            <Badge key={age} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              {age}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {trip.preferences.cities && trip.preferences.cities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {trip.preferences.cities.slice(0, 2).map((city: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {city.name} ({city.days}d)
                            </Badge>
                          ))}
                          {trip.preferences.cities.length > 2 && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              +{trip.preferences.cities.length - 2} more cities
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {trip.start_date && (
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatMonthYear(trip.start_date)}
                    </Badge>
                  )}
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
                  <span>Tap to open</span>
                  <span>Swipe for options</span>
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
