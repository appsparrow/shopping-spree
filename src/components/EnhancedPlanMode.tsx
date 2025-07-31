
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, MapPin, Calendar, Users, Bot, GripVertical, X, Edit } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { CityCard } from './CityCard';
import { useTrips } from '@/hooks/useTrips';
import { useCities } from '@/hooks/useCities';
import AIPlanner from './AIPlanner';
import GoDoCard from './GoDoCard';
import { supabase } from '@/integrations/supabase/client';

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

const EnhancedPlanMode = () => {
  const [showAIPlanner, setShowAIPlanner] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCityDays, setNewCityDays] = useState(1);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [useSupabaseMode, setUseSupabaseMode] = useState(false);
  
  // Local state for non-authenticated users (original functionality)
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

  // Supabase hooks for authenticated users
  const { trips, currentTrip, createTrip, updateTrip, loading: tripsLoading } = useTrips();
  const { cities, addCity, updateCity, deleteCity, reorderCities, loading: citiesLoading } = useCities(useSupabaseMode ? currentTrip?.id || null : null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentTrip && useSupabaseMode) {
      setTripSetup({
        tripName: currentTrip.name,
        numberOfPeople: currentTrip.number_of_people,
        fromDate: currentTrip.start_date,
        toDate: currentTrip.end_date,
        baseLocation: currentTrip.base_location || '',
        cities: cities.map(city => city.city_name)
      });
    }
  }, [currentTrip, cities, useSupabaseMode]);

  // Load local storage data for non-authenticated mode
  useEffect(() => {
    if (!useSupabaseMode) {
      const savedSetup = localStorage.getItem('planAndGo_setup');
      const savedGoDoItems = localStorage.getItem('planAndGo_godo');
      
      if (savedSetup) {
        setTripSetup(JSON.parse(savedSetup));
      }
      if (savedGoDoItems) {
        setGoDoItems(JSON.parse(savedGoDoItems));
      }
    }
  }, [useSupabaseMode]);

  // Save to localStorage when in local mode
  useEffect(() => {
    if (!useSupabaseMode) {
      localStorage.setItem('planAndGo_setup', JSON.stringify(tripSetup));
    }
  }, [tripSetup, useSupabaseMode]);

  useEffect(() => {
    if (!useSupabaseMode) {
      localStorage.setItem('planAndGo_godo', JSON.stringify(goDoItems));
    }
  }, [goDoItems, useSupabaseMode]);

  const handleAIPlanGenerated = (generatedTripSetup: TripSetup, generatedGoDoItems: GoDoItem[]) => {
    setTripSetup(generatedTripSetup);
    setGoDoItems(generatedGoDoItems);
    setShowAIPlanner(false);
  };

  // Local mode functions (original functionality)
  const addCityLocal = () => {
    if (newCity.trim() && !tripSetup.cities.includes(newCity.trim())) {
      setTripSetup(prev => ({
        ...prev,
        cities: [...prev.cities, newCity.trim()]
      }));
      setNewCity('');
    }
  };

  const removeCityLocal = (cityToRemove: string) => {
    setTripSetup(prev => ({
      ...prev,
      cities: prev.cities.filter(city => city !== cityToRemove)
    }));
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

  // Supabase mode functions
  const handleCreateTrip = async () => {
    if (!tripSetup.tripName || !tripSetup.fromDate || !tripSetup.toDate) return;
    
    setIsCreatingTrip(true);
    try {
      await createTrip({
        name: tripSetup.tripName,
        start_date: tripSetup.fromDate,
        end_date: tripSetup.toDate,
        base_location: tripSetup.baseLocation,
        number_of_people: tripSetup.numberOfPeople
      });
    } catch (error) {
      console.error('Failed to create trip:', error);
    } finally {
      setIsCreatingTrip(false);
    }
  };

  const handleUpdateTrip = async () => {
    if (!currentTrip) return;
    
    try {
      await updateTrip(currentTrip.id, {
        name: tripSetup.tripName,
        start_date: tripSetup.fromDate,
        end_date: tripSetup.toDate,
        base_location: tripSetup.baseLocation,
        number_of_people: tripSetup.numberOfPeople
      });
    } catch (error) {
      console.error('Failed to update trip:', error);
    }
  };

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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = cities.findIndex(city => city.id === active.id);
      const newIndex = cities.findIndex(city => city.id === over.id);
      
      const reorderedCities = arrayMove(cities, oldIndex, newIndex);
      reorderCities(reorderedCities);
    }
  };

  const calculateTotalDays = () => {
    if (useSupabaseMode) {
      return cities.reduce((total, city) => total + city.planned_days, 0);
    }
    return 0;
  };

  const formatDateRange = () => {
    if (!tripSetup.fromDate || !tripSetup.toDate) return '';
    const start = new Date(tripSetup.fromDate);
    const end = new Date(tripSetup.toDate);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  if (tripsLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      {/* Mode Toggle */}
      {isAuthenticated && (
        <div className="flex justify-center mb-4">
          <Button
            onClick={() => setUseSupabaseMode(!useSupabaseMode)}
            variant={useSupabaseMode ? "default" : "outline"}
            className="text-sm"
          >
            {useSupabaseMode ? 'Using Supabase' : 'Using Local Storage'}
          </Button>
        </div>
      )}

      {/* AI Planner Toggle */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowAIPlanner(!showAIPlanner)}
          variant={showAIPlanner ? "secondary" : "default"}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          <Bot className="w-4 h-4 mr-2" />
          {showAIPlanner ? 'Manual Planning' : 'Plan with AI'}
        </Button>
      </div>

      {/* AI Planner */}
      {showAIPlanner && (
        <AIPlanner onPlanGenerated={handleAIPlanGenerated} />
      )}

      {/* Manual Planning */}
      {!showAIPlanner && (
        <>
          {/* Trip Setup */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
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
              
              <div className="grid grid-cols-2 gap-3">
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

              <div className="grid grid-cols-2 gap-3">
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

              {formatDateRange() && (
                <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                  📅 {formatDateRange()} {useSupabaseMode && `• ${calculateTotalDays()} days planned`}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {useSupabaseMode && !currentTrip ? (
                  <Button 
                    onClick={handleCreateTrip} 
                    disabled={isCreatingTrip || !tripSetup.tripName || !tripSetup.fromDate || !tripSetup.toDate}
                    className="flex-1"
                  >
                    {isCreatingTrip ? 'Creating...' : 'Create Trip'}
                  </Button>
                ) : useSupabaseMode ? (
                  <Button 
                    onClick={handleUpdateTrip} 
                    variant="outline"
                    className="flex-1"
                  >
                    Update Trip
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Cities Planning - Supabase Mode */}
          {useSupabaseMode && currentTrip && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Cities & Days</CardTitle>
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

                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={cities.map(city => city.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {cities.map((city) => (
                        <SortableItem key={city.id} id={city.id}>
                          <CityCard 
                            city={city}
                            onUpdate={(updates) => updateCity(city.id, updates)}
                            onDelete={() => deleteCity(city.id)}
                          />
                        </SortableItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {cities.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Add cities to start planning</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Cities Planning - Local Mode (Original functionality) */}
          {!useSupabaseMode && (
            <>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Cities to Visit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add city to visit"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCityLocal()}
                    />
                    <Button onClick={addCityLocal}>
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
                            onClick={() => removeCityLocal(city)}
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
            </>
          )}
        </>
      )}
    </div>
  );
};

export default EnhancedPlanMode;
