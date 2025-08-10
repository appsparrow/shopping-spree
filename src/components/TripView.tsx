
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Settings, Calendar, MapPin, Users, Play, CheckCircle, Clock } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { useCities } from '@/hooks/useCities';
import { useActivities } from '@/hooks/useActivities';
import DayCard from './DayCard';
import { Badge } from './ui/badge';

interface TripViewProps {
  tripId: string;
  onBack: () => void;
  onSetup: () => void;
}

type TripState = 'planning' | 'on_trip' | 'completed';

const TripView = ({ tripId, onBack, onSetup }: TripViewProps) => {
  const { currentTrip } = useTrips();
  const { cities } = useCities(tripId);
  const { activities } = useActivities(tripId);

  if (!currentTrip || currentTrip.id !== tripId) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">Trip Not Found</h1>
          <div></div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">Trip not found or loading...</p>
            <Button onClick={onBack} variant="outline">
              Back to Trips
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tripState = currentTrip.preferences?.tripState || 'planning';
  const completedActivities = activities.filter(a => a.completed).length;
  const totalActivities = activities.length;

  const getStateColor = (state: TripState) => {
    switch (state) {
      case 'planning': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'on_trip': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const getStateIcon = (state: TripState) => {
    switch (state) {
      case 'planning': return <Clock className="w-4 h-4" />;
      case 'on_trip': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold">{currentTrip.name}</h1>
        <Button variant="ghost" onClick={onSetup} className="p-2">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Trip Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${getStateColor(tripState)} flex items-center gap-1`}>
                {getStateIcon(tripState)}
                {tripState === 'planning' ? 'Planning' : tripState === 'on_trip' ? 'On Trip' : 'Completed'}
              </Badge>
            </div>
            {tripState === 'on_trip' && totalActivities > 0 && (
              <div className="text-sm text-gray-600">
                {completedActivities}/{totalActivities} completed
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trip Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Trip Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentTrip.base_location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{currentTrip.base_location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{currentTrip.number_of_people} {currentTrip.number_of_people === 1 ? 'person' : 'people'}</span>
          </div>
          
          {currentTrip.start_date && currentTrip.end_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(currentTrip.start_date).toLocaleDateString()} - {new Date(currentTrip.end_date).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Show preferences if they exist */}
          {currentTrip.preferences && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              {currentTrip.preferences.interests && currentTrip.preferences.interests.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Interests</div>
                  <div className="flex flex-wrap gap-1">
                    {currentTrip.preferences.interests.slice(0, 3).map((interest: string) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {currentTrip.preferences.interests.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{currentTrip.preferences.interests.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {currentTrip.preferences.kidAges && currentTrip.preferences.kidAges.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Kids' Ages</div>
                  <div className="flex flex-wrap gap-1">
                    {currentTrip.preferences.kidAges.map((age: string) => (
                      <Badge key={age} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {age}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Trip - Days by City */}
      {tripState !== 'planning' && cities.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Itinerary</h2>
          {cities.map(city => (
            <Card key={city.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {city.city_name} ({city.planned_days} days)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: Math.max(city.planned_days, 1) }).map((_, idx) => {
                  const dayNumber = idx + 1;
                  const dayActivities = activities.filter(a => a.city_id === city.id && a.day_number === dayNumber);
                  const dateStr = currentTrip.start_date ? new Date(new Date(currentTrip.start_date).getTime() + (idx * 86400000)).toLocaleDateString() : '';
                  return (
                    <DayCard
                      key={`${city.id}-${dayNumber}`}
                      day={{
                        id: `${city.id}-${dayNumber}`,
                        date: dateStr,
                        weekday: new Date(dateStr || Date.now()).toLocaleDateString('en-US', { weekday: 'long' }),
                        activities: dayActivities.map(a => ({
                          id: a.id,
                          text: a.place_name,
                          completed: a.completed,
                          type: 'activity',
                          time: a.notes?.split(': ')[0] || undefined,
                        }))
                      }}
                      onUpdateActivities={() => { /* Wiring drag/drop and updates next */ }}
                    />
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Setup Actions */}
      <Card>
        <CardContent className="p-4">
          <Button onClick={onSetup} className="w-full">
            <Settings className="w-4 h-4 mr-2" />
            {tripState === 'planning' ? 'Setup Trip Details' : 'Adjust Itinerary'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripView;
