
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, MapPin, Calendar, Users } from 'lucide-react';
import GoDoCard from './GoDoCard';

interface TripSetup {
  tripName: string;
  numberOfPeople: number;
  fromDate: string;
  toDate: string;
  baseLocation: string;
  cities: string[];
}

interface GoDoItem {
  id: string;
  cityId: string;
  placeName: string;
  preferredDate: string;
  timeWindow: string;
  notes: string;
  tags: string[];
  completed: boolean;
  skipped: boolean;
}

const PlanMode = () => {
  const [tripSetup, setTripSetup] = useState<TripSetup>({
    tripName: '',
    numberOfPeople: 1,
    fromDate: '',
    toDate: '',
    baseLocation: '',
    cities: []
  });
  
  const [goDoItems, setGoDoItems] = useState<GoDoItem[]>([]);
  const [newCity, setNewCity] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    const savedSetup = localStorage.getItem('planAndGo_setup');
    const savedGoDoItems = localStorage.getItem('planAndGo_godo');
    
    if (savedSetup) {
      setTripSetup(JSON.parse(savedSetup));
    }
    if (savedGoDoItems) {
      setGoDoItems(JSON.parse(savedGoDoItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('planAndGo_setup', JSON.stringify(tripSetup));
  }, [tripSetup]);

  useEffect(() => {
    localStorage.setItem('planAndGo_godo', JSON.stringify(goDoItems));
  }, [goDoItems]);

  const addCity = () => {
    if (newCity.trim() && !tripSetup.cities.includes(newCity.trim())) {
      setTripSetup(prev => ({
        ...prev,
        cities: [...prev.cities, newCity.trim()]
      }));
      setNewCity('');
    }
  };

  const removeCity = (cityToRemove: string) => {
    setTripSetup(prev => ({
      ...prev,
      cities: prev.cities.filter(city => city !== cityToRemove)
    }));
    // Remove all Go-Do items for this city
    setGoDoItems(prev => prev.filter(item => item.cityId !== cityToRemove));
  };

  const addGoDoItem = (cityId: string, placeName: string) => {
    if (placeName.trim()) {
      const newItem: GoDoItem = {
        id: Date.now().toString(),
        cityId,
        placeName: placeName.trim(),
        preferredDate: '',
        timeWindow: '',
        notes: '',
        tags: [],
        completed: false,
        skipped: false
      };
      setGoDoItems(prev => [...prev, newItem]);
    }
  };

  const updateGoDoItem = (id: string, updates: Partial<GoDoItem>) => {
    setGoDoItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteGoDoItem = (id: string) => {
    setGoDoItems(prev => prev.filter(item => item.id !== id));
  };

  const getGoDoItemsForCity = (cityId: string) => {
    return goDoItems.filter(item => item.cityId === cityId);
  };

  return (
    <div className="space-y-6">
      {/* Trip Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Trip Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Trip Name"
            value={tripSetup.tripName}
            onChange={(e) => setTripSetup(prev => ({ ...prev, tripName: e.target.value }))}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Users className="w-4 h-4 inline mr-1" />
                People
              </label>
              <Input
                type="number"
                min="1"
                value={tripSetup.numberOfPeople}
                onChange={(e) => setTripSetup(prev => ({ ...prev, numberOfPeople: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <Input
              placeholder="Base Location"
              value={tripSetup.baseLocation}
              onChange={(e) => setTripSetup(prev => ({ ...prev, baseLocation: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                From
              </label>
              <Input
                type="date"
                value={tripSetup.fromDate}
                onChange={(e) => setTripSetup(prev => ({ ...prev, fromDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <Input
                type="date"
                value={tripSetup.toDate}
                onChange={(e) => setTripSetup(prev => ({ ...prev, toDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add city to visit"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCity()}
            />
            <Button onClick={addCity}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {tripSetup.cities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tripSetup.cities.map(city => (
                <span
                  key={city}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {city}
                  <button
                    onClick={() => removeCity(city)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Go-Do Lists by City */}
      {tripSetup.cities.map(city => (
        <Card key={city}>
          <CardHeader>
            <CardTitle className="text-lg">
              📍 {city} Go-Do List
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getGoDoItemsForCity(city).map(item => (
              <GoDoCard
                key={item.id}
                item={item}
                onUpdate={(updates) => updateGoDoItem(item.id, updates)}
                onDelete={() => deleteGoDoItem(item.id)}
              />
            ))}
            
            <div className="flex gap-2">
              <Input
                placeholder="Add place to visit"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addGoDoItem(city, (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Button
                onClick={() => {
                  const input = document.querySelector(`input[placeholder="Add place to visit"]`) as HTMLInputElement;
                  if (input?.value) {
                    addGoDoItem(city, input.value);
                    input.value = '';
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {tripSetup.cities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Add cities to start planning your Go-Do list
        </div>
      )}
    </div>
  );
};

export default PlanMode;
