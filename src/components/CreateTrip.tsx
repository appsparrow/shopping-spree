
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, MapPin, Users, Calendar } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';

interface CreateTripProps {
  onBack: () => void;
  onCreated: (tripId: string) => void;
}

const CreateTrip = ({ onBack, onCreated }: CreateTripProps) => {
  const { createTrip } = useTrips();
  const [tripName, setTripName] = useState('');
  const [baseLocation, setBaseLocation] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName || !startDate || !endDate) return;

    setCreating(true);
    try {
      const trip = await createTrip({
        name: tripName,
        start_date: startDate,
        end_date: endDate,
        base_location: baseLocation,
        number_of_people: numberOfPeople
      });
      onCreated(trip.id);
    } catch (error) {
      console.error('Failed to create trip:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold">New Trip</h1>
        <div></div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Trip Name</label>
              <Input
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="e.g., Summer Europe Trip"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Base Location (Optional)
              </label>
              <Input
                value={baseLocation}
                onChange={(e) => setBaseLocation(e.target.value)}
                placeholder="e.g., London"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <Users className="w-4 h-4 inline mr-1" />
                Number of People
              </label>
              <Input
                type="number"
                min="1"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={creating || !tripName || !startDate || !endDate}
            >
              {creating ? 'Creating...' : 'Create Trip'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTrip;
