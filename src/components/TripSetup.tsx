
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, ArrowLeft, Bot, Calendar, MapPin, Users, Sparkles, Play, CheckCircle } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { useCities } from '@/hooks/useCities';
import { useActivities } from '@/hooks/useActivities';
import { Badge } from './ui/badge';

interface TripSetupProps {
  tripId: string | null;
  onBack: () => void;
}

type TripState = 'planning' | 'on_trip' | 'completed';

const TripSetup = ({ tripId, onBack }: TripSetupProps) => {
  const { currentTrip, updateTrip } = useTrips();
  const { cities, addCity, loading } = useCities(tripId);
  const { addActivity } = useActivities(tripId);
  const [newCityName, setNewCityName] = useState('');
  const [newCityDays, setNewCityDays] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [kidAges, setKidAges] = useState<string[]>([]);
  const [aiDescription, setAiDescription] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [tripState, setTripState] = useState<TripState>('planning');

  useEffect(() => {
    if (currentTrip) {
      setStartDate(currentTrip.start_date);
      setEndDate(currentTrip.end_date);
      if (currentTrip.preferences) {
        setInterests(currentTrip.preferences.interests || []);
        setKidAges(currentTrip.preferences.kidAges || []);
      }
      // Set trip state from preferences or default to planning
      setTripState(currentTrip.preferences?.tripState || 'planning');
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

  const handleUpdatePreferences = async () => {
    if (!currentTrip) return;
    
    try {
      await updateTrip(currentTrip.id, {
        preferences: {
          interests,
          kidAges,
          tripState,
          cities: cities.map(c => ({ id: c.id, name: c.city_name, days: c.planned_days })),
        }
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const handleAIPlan = async () => {
    if (!currentTrip || !aiDescription.trim()) return;
    
    setIsGeneratingAI(true);
    try {
      // Create a prompt based on user inputs
      const prompt = `Create a detailed travel itinerary for Japan with the following requirements:

Trip Details:
- Cities: ${cities.map(c => `${c.city_name} (${c.planned_days} days)`).join(', ')}
- Dates: ${startDate} to ${endDate}
- Interests: ${interests.join(', ')}
- Kids' Ages: ${kidAges.join(', ')}
- Special Requirements: ${aiDescription}

Please create specific activities for each city and day, considering the interests and age groups. Include:
- Specific places to visit
- Recommended time windows
- Notes about tickets, reservations, or tips
- Activities suitable for the specified age groups

Format as JSON with activities grouped by city and day.`;

      // For now, we'll simulate AI generation with sample data
      // In a real implementation, you'd call your AI service here
      console.log('AI Planning triggered with prompt:', prompt);
      
      // Simulate AI response with sample activities
      const sampleActivities = [
        {
          city_name: 'Tokyo',
          day_number: 1,
          place_name: 'Senso-ji Temple',
          time_window: 'Morning',
          notes: 'Visit the oldest temple in Tokyo. Arrive early to avoid crowds.',
          tags: ['Culture', 'History']
        },
        {
          city_name: 'Tokyo',
          day_number: 1,
          place_name: 'Akihabara',
          time_window: 'Afternoon',
          notes: 'Electronics and anime district. Great for tech enthusiasts.',
          tags: ['Tech', 'Shopping']
        },
        {
          city_name: 'Kyoto',
          day_number: 1,
          place_name: 'Fushimi Inari Shrine',
          time_window: 'Early Morning',
          notes: 'Famous for thousands of torii gates. Best visited early.',
          tags: ['Culture', 'Nature']
        }
      ];

      // Add activities to the database
      for (const activity of sampleActivities) {
        const city = cities.find(c => c.city_name === activity.city_name);
        if (city) {
          await addActivity({
            trip_id: currentTrip.id,
            city_id: city.id,
            place_name: activity.place_name,
            notes: `${activity.time_window}: ${activity.notes}`,
            photo_metadata: { tags: activity.tags },
            day_number: activity.day_number,
            completed: false,
            skipped: false
          });
        }
      }

      // Update preferences to mark as AI-generated
      await updateTrip(currentTrip.id, {
        preferences: {
          ...currentTrip.preferences,
          aiGenerated: true,
          aiDescription
        }
      });

    } catch (error) {
      console.error('Failed to generate AI itinerary:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const updateTripState = async (newState: TripState) => {
    if (!currentTrip) return;
    
    try {
      setTripState(newState);
      await updateTrip(currentTrip.id, {
        preferences: {
          ...currentTrip.preferences,
          tripState: newState
        }
      });
    } catch (error) {
      console.error('Failed to update trip state:', error);
    }
  };

  if (!currentTrip) {
    return <div>Loading...</div>;
  }

  const getStateColor = (state: TripState) => {
    switch (state) {
      case 'planning': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'on_trip': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const getStateIcon = (state: TripState) => {
    switch (state) {
      case 'planning': return <Calendar className="w-4 h-4" />;
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
        <div></div>
      </div>

      {/* Trip State Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Trip Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={`${getStateColor(tripState)} flex items-center gap-1`}>
              {getStateIcon(tripState)}
              {tripState === 'planning' ? 'Planning' : tripState === 'on_trip' ? 'On Trip' : 'Completed'}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={tripState === 'planning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateTripState('planning')}
            >
              Planning
            </Button>
            <Button 
              variant={tripState === 'on_trip' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateTripState('on_trip')}
            >
              Start Trip
            </Button>
            <Button 
              variant={tripState === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateTripState('completed')}
            >
              Complete
            </Button>
          </div>
        </CardContent>
      </Card>

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
          {/* Quick-select Japan cities */}
          <div className="flex flex-wrap gap-2">
            {['Tokyo','Kyoto','Osaka','Nara','Hakone'].map(city => (
              <button
                key={city}
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
            <>
              {/* Interests chips */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Interests</div>
                <div className="flex flex-wrap gap-2">
                  {['Active','Adventure','Relaxing','Food','Culture','Shopping','Nature','Theme Parks','Nightlife','Tech','Anime','History','Art','Kid-friendly']
                    .map(tag => (
                      <button
                        key={tag}
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
                <div className="text-sm font-medium">Kids' Ages</div>
                <div className="flex flex-wrap gap-2">
                  {['Elementary','Middle School','High School','College']
                    .map(tag => (
                      <button
                        key={tag}
                        onClick={() => setKidAges(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                        className={`px-3 py-1 rounded-full text-sm border ${kidAges.includes(tag) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200'}`}
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              </div>

              {/* AI Description */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Describe Your Trip Vision</div>
                <Textarea
                  placeholder="Tell us about your ideal trip experience, special requirements, must-see places, or any specific preferences..."
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleAIPlan} 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                disabled={isGeneratingAI || !aiDescription.trim()}
              >
                {isGeneratingAI ? (
                  <>
                    <Bot className="w-4 h-4 mr-2 animate-spin" />
                    Generating Itinerary...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Itinerary with AI
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TripSetup;
