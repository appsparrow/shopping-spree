
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Settings, Calendar, MapPin, Users } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';

interface TripViewProps {
  tripId: string;
  onBack: () => void;
  onSetup: () => void;
}

const TripView = ({ tripId, onBack, onSetup }: TripViewProps) => {
  const { currentTrip } = useTrips();

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
        </CardContent>
      </Card>

      {/* Setup Actions */}
      <Card>
        <CardContent className="p-4">
          <Button onClick={onSetup} className="w-full">
            <Settings className="w-4 h-4 mr-2" />
            Setup Trip Details
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripView;
