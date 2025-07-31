
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
  const [formData, setFormData] = useState({
    name: '',
    baseLocation: '',
    startDate: '',
    endDate: '',
    numberOfPeople: 2
  });
  const [loading, setLoading] = useState(false);
  const { createTrip } = useTrips();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const newTrip = await createTrip({
        name: formData.name.trim(),
        base_location: formData.baseLocation.trim() || null,
        start_date: formData.startDate || new Date().toISOString().split('T')[0],
        end_date: formData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        number_of_people: formData.numberOfPeople
      });
      
      if (newTrip) {
        onCreated(newTrip.id);
      }
    } catch (error) {
      console.error('Failed to create trip:', error);
    } finally {
      setLoading(false);
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
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Trip Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Trip name (required)"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />

            <Input
              placeholder="Base location (optional)"
              value={formData.baseLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, baseLocation: e.target.value }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Start Date
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <Users className="w-4 h-4 inline mr-1" />
                Number of People
              </label>
              <Input
                type="number"
                min="1"
                max="20"
                value={formData.numberOfPeople}
                onChange={(e) => setFormData(prev => ({ ...prev, numberOfPeople: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !formData.name.trim()}
            >
              {loading ? 'Creating...' : 'Create Trip'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTrip;
