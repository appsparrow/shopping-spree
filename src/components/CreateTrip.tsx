
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, MapPin, Users, Calendar, Plus } from 'lucide-react';
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
  const [interests, setInterests] = useState<string[]>([]);
  const [kidAges, setKidAges] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<Array<{name: string, days: number}>>([]);
  const [newCityName, setNewCityName] = useState('');
  const [newCityDays, setNewCityDays] = useState(1);
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
        number_of_people: formData.numberOfPeople,
        preferences: {
          interests,
          kidAges,
          cities: selectedCities
        }
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

  const addCity = () => {
    if (newCityName.trim()) {
      setSelectedCities(prev => [...prev, { name: newCityName.trim(), days: newCityDays }]);
      setNewCityName('');
      setNewCityDays(1);
    }
  };

  const removeCity = (index: number) => {
    setSelectedCities(prev => prev.filter((_, i) => i !== index));
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

            {/* Interests */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Interests</label>
              <div className="flex flex-wrap gap-2">
                {['Active','Adventure','Relaxing','Food','Culture','Shopping','Nature','Theme Parks','Nightlife','Tech','Anime','History','Art','Kid-friendly']
                  .map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                      className={`px-3 py-1 rounded-full text-sm border ${interests.includes(tag) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            </div>

            {/* Kids age groups */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Kids' Ages</label>
              <div className="flex flex-wrap gap-2">
                {['Elementary','Middle School','High School','College']
                  .map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setKidAges(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                      className={`px-3 py-1 rounded-full text-sm border ${kidAges.includes(tag) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200'}`}
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            </div>

            {/* Cities */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Cities</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {['Tokyo','Kyoto','Osaka','Nara','Hakone'].map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setNewCityName(city)}
                    className="px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200"
                  >
                    {city}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="City name"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCity()}
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
                <Button type="button" onClick={addCity} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {selectedCities.length > 0 && (
                <div className="space-y-1">
                  {selectedCities.map((city, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{city.name} ({city.days} days)</span>
                      <Button type="button" onClick={() => removeCity(index)} size="sm" variant="ghost" className="text-red-500">
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
