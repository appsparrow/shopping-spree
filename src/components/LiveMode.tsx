
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Camera, Calendar, MapPin, Plus, Image as ImageIcon } from 'lucide-react';

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
  photos?: string[];
  actualNotes?: string;
  addedDuringTrip?: boolean;
}

interface TripSetup {
  tripName: string;
  numberOfPeople: number;
  fromDate: string;
  toDate: string;
  baseLocation: string;
  cities: string[];
}

const LiveMode = () => {
  const [tripSetup, setTripSetup] = useState<TripSetup | null>(null);
  const [goDoItems, setGoDoItems] = useState<GoDoItem[]>([]);
  const [newPlace, setNewPlace] = useState('');
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
    if (goDoItems.length > 0) {
      localStorage.setItem('planAndGo_godo', JSON.stringify(goDoItems));
    }
  }, [goDoItems]);

  const updateGoDoItem = (id: string, updates: Partial<GoDoItem>) => {
    setGoDoItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const addNewPlace = () => {
    if (newPlace.trim() && selectedCity) {
      const newItem: GoDoItem = {
        id: Date.now().toString(),
        cityId: selectedCity,
        placeName: newPlace.trim(),
        preferredDate: '',
        timeWindow: '',
        notes: '',
        tags: ['Added During Trip'],
        completed: false,
        skipped: false,
        addedDuringTrip: true,
        photos: []
      };
      setGoDoItems(prev => [...prev, newItem]);
      setNewPlace('');
      setSelectedCity('');
    }
  };

  const handlePhotoUpload = (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string;
        updateGoDoItem(itemId, {
          photos: [...(goDoItems.find(item => item.id === itemId)?.photos || []), photoUrl]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getCompletedItems = () => {
    return goDoItems.filter(item => item.completed);
  };

  const getItemsByCity = (cityId: string) => {
    return goDoItems.filter(item => item.cityId === cityId);
  };

  if (!tripSetup || tripSetup.cities.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No trip planned yet. Go to Plan Mode to set up your itinerary first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trip Summary */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="text-center">
            <h2 className="text-xl font-bold">{tripSetup.tripName}</h2>
            <p className="text-white/80 text-sm mt-1">
              {new Date(tripSetup.fromDate).toLocaleDateString()} - {new Date(tripSetup.toDate).toLocaleDateString()}
            </p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-white/90 mb-2">
              {getCompletedItems().length} of {goDoItems.length} places visited
            </p>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${goDoItems.length > 0 ? (getCompletedItems().length / goDoItems.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Place */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Add New Discovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="flex-1 p-2 border rounded-lg"
            >
              <option value="">Select city</option>
              {tripSetup.cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <Input
              value={newPlace}
              onChange={(e) => setNewPlace(e.target.value)}
              placeholder="New place discovered"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && addNewPlace()}
            />
            <Button onClick={addNewPlace}>Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Go-Do Lists by City */}
      {tripSetup.cities.map(city => {
        const cityItems = getItemsByCity(city);
        if (cityItems.length === 0) return null;

        return (
          <Card key={city}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                {city}
                <span className="text-sm font-normal text-gray-500">
                  ({cityItems.filter(item => item.completed).length}/{cityItems.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cityItems.map(item => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={(checked) =>
                        updateGoDoItem(item.id, { completed: checked as boolean })
                      }
                    />
                    <div className="flex-1">
                      <h3 className={`font-medium ${item.completed ? 'line-through text-gray-500' : ''} ${item.skipped ? 'line-through text-red-400' : ''}`}>
                        {item.placeName}
                        {item.addedDuringTrip && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            New!
                          </span>
                        )}
                      </h3>
                      {item.timeWindow && (
                        <p className="text-sm text-gray-500">{item.timeWindow}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={item.skipped ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => updateGoDoItem(item.id, { skipped: !item.skipped, completed: false })}
                      >
                        {item.skipped ? 'Skipped' : 'Skip'}
                      </Button>
                    </div>
                  </div>

                  {(item.completed || item.skipped) && (
                    <div className="space-y-3 bg-gray-50 p-3 rounded">
                      <Textarea
                        placeholder="Add notes about your experience..."
                        value={item.actualNotes || ''}
                        onChange={(e) => updateGoDoItem(item.id, { actualNotes: e.target.value })}
                        className="resize-none"
                        rows={2}
                      />
                      
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer flex items-center gap-2 text-blue-600 hover:text-blue-700">
                          <Camera className="w-4 h-4" />
                          <span className="text-sm">Add Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(item.id, e)}
                            className="hidden"
                          />
                        </label>
                        
                        {item.photos && item.photos.length > 0 && (
                          <div className="flex gap-2">
                            {item.photos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`${item.placeName} memory`}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Memory Lane Summary */}
      {getCompletedItems().length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Camera className="w-5 h-5" />
              Memory Lane ({getCompletedItems().length} places visited)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {getCompletedItems().map(item => (
                <div key={item.id} className="text-center">
                  {item.photos && item.photos.length > 0 ? (
                    <img
                      src={item.photos[0]}
                      alt={item.placeName}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-800">{item.placeName}</p>
                  <p className="text-xs text-gray-600">{item.cityId}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveMode;
