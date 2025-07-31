
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, ArrowLeft, Bot, Calendar, MapPin, Users } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { useCities } from '@/hooks/useCities';

interface TripSetupProps {
  tripId: string | null;
  onBack: () => void;
}

const TripSetup = ({ tripId, onBack }: TripSetupProps) => {
  const { currentTrip, updateTrip } = useTrips();
  const { cities, addCity, loading } = useCities(tripId);
  const [newCityName, setNewCityName] = useState('');
  const [newCityDays, setNewCityDays] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (currentTrip) {
      setStartDate(currentTrip.start_date);
      setEndDate(currentTrip.end_date);
    }
  }, [currentTrip]);

  const handleAddCity = async () => {
    if (!newCityName.trim()) return;
    
    try {
      await addCity({
        city_name: newCityName.trim(),
        planned_days: newCityDays
      });
      setNewCityName('');
      setNewCityDays(1);
    } catch (error) {
      console.error('Failed to add city:', error);
    }
  };

  const handleUpdateDates = async () => {
    if (!currentTrip || !startDate || !endDate) return;
    
    try {
      await updateTrip(currentTrip.id, {
        start_date: startDate,
        end_date: endDate
      });
    } catch (error) {
      console.error('Failed to update dates:', error);
    }
  };

  const handleAIPlan = () => {
    // TODO: Implement AI planning based on cities and dates
    console.log('AI Planning triggered for cities:', cities);
  };

  if (!currentTrip) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold">{currentTrip.name}</h1>
        <div></div>
      </div>

      {/* Trip Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Trip Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleUpdateDates} className="w-full" variant="outline">
            Update Dates
          </Button>
        </CardContent>
      </Card>

      {/* Cities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Cities & Duration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="City name"
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCity()}
              className="flex-1"
            />
            <Input
              type="number"
              min="1"
              max="30"
              value={newCityDays}
              onChange={(e) => setNewCityDays(parseInt(e.target.value) || 1)}
              className="w-20"
              placeholder="Days"
            />
            <Button onClick={handleAddCity} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {cities.map((city) => (
              <div key={city.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">{city.city_name}</h3>
                  <p className="text-sm text-gray-500">{city.planned_days} days</p>
                </div>
                <div className="text-sm text-gray-500">
                  {city.start_date && city.end_date && (
                    <span>
                      {new Date(city.start_date).toLocaleDateString()} - {new Date(city.end_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {cities.length > 0 && (
            <Button onClick={handleAIPlan} className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
              <Bot className="w-4 h-4 mr-2" />
              Let AI Plan Activities
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TripSetup;
