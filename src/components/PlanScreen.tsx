
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar, Plus, Edit3, Car } from 'lucide-react';
import DayCard from './DayCard';

interface Trip {
  name: string;
  startDate: string;
  endDate: string;
  days: Day[];
}

interface Day {
  id: string;
  date: string;
  weekday: string;
  activities: Activity[];
}

interface Activity {
  id: string;
  text: string;
  completed: boolean;
  type: 'activity' | 'place' | 'accommodation';
  time?: string;
}

const PlanScreen = () => {
  const [trip, setTrip] = useState<Trip>({
    name: 'Sri Lanka Travel Itinerary',
    startDate: '2025-02-11',
    endDate: '2025-02-15',
    days: []
  });
  const [isEditingTrip, setIsEditingTrip] = useState(false);

  useEffect(() => {
    const savedTrip = localStorage.getItem('planAndGo_trip');
    if (savedTrip) {
      setTrip(JSON.parse(savedTrip));
    } else {
      generateDaysFromDates();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('planAndGo_trip', JSON.stringify(trip));
  }, [trip]);

  const generateDaysFromDates = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days: Day[] = [];
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      
      days.push({
        id: date.toISOString().split('T')[0],
        date: dateStr,
        weekday,
        activities: []
      });
    }
    
    setTrip(prev => ({ ...prev, days }));
  };

  const updateTrip = (updates: Partial<Trip>) => {
    setTrip(prev => ({ ...prev, ...updates }));
    if (updates.startDate || updates.endDate) {
      setTimeout(generateDaysFromDates, 0);
    }
  };

  const updateDay = (dayId: string, activities: Activity[]) => {
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(day =>
        day.id === dayId ? { ...day, activities } : day
      )
    }));
  };

  const formatDateRange = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}–${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, ${start.getFullYear()}`;
  };

  return (
    <div className="max-w-md mx-auto space-y-0">
      {/* Trip Header Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-3xl p-8 text-white text-center">
        {isEditingTrip ? (
          <div className="space-y-4">
            <Input
              value={trip.name}
              onChange={(e) => updateTrip({ name: e.target.value })}
              className="text-xl font-bold border-white/20 bg-white/10 text-white placeholder:text-white/70"
              placeholder="Trip name"
            />
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Start Date</label>
                <Input
                  type="date"
                  value={trip.startDate}
                  onChange={(e) => updateTrip({ startDate: e.target.value })}
                  className="border-white/20 bg-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">End Date</label>
                <Input
                  type="date"
                  value={trip.endDate}
                  onChange={(e) => updateTrip({ endDate: e.target.value })}
                  className="border-white/20 bg-white/10 text-white"
                />
              </div>
            </div>
            <Button 
              onClick={() => setIsEditingTrip(false)} 
              className="bg-white text-blue-600 hover:bg-white/90"
            >
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-xl font-bold mb-2">{trip.name}</h1>
                <p className="text-white/80 text-sm">{formatDateRange()}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setIsEditingTrip(true)}
                className="text-white hover:bg-white/10 p-2"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            <div className="w-full h-1 bg-white/30 rounded-full">
              <div className="h-full bg-white rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Days Container */}
      <div className="bg-white rounded-b-3xl shadow-sm">
        {trip.days.map((day, index) => (
          <div key={day.id} className={index === 0 ? "" : "border-t border-gray-100"}>
            <DayCard
              day={day}
              onUpdateActivities={(activities) => updateDay(day.id, activities)}
            />
          </div>
        ))}
      </div>

      {/* Drive Times Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
        <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
          <Car className="w-5 h-5" />
          Drive Times
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Car className="w-4 h-4 text-blue-500" />
            <span>Hambantota to Kalametiya - 30 mins</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Car className="w-4 h-4 text-blue-500" />
            <span>Kalametiya to Udawalawe - 2 hours</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Car className="w-4 h-4 text-blue-500" />
            <span>Udawalawe to Yala - 1.5 hours</span>
          </div>
        </div>
      </div>

      {/* Places of Interest */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center justify-between">
          Places of Interest
          <Button variant="ghost" size="sm" className="text-purple-600">
            <Plus className="w-4 h-4" />
          </Button>
        </h3>
        <div className="space-y-2">
          <div className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm mr-2 mb-2">
            🏛️ Kalametiya Bird Sanctuary
          </div>
          <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm mr-2 mb-2">
            🏖️ Tangalle Beach
          </div>
          <div className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm mr-2 mb-2">
            🏛️ Mulkirigala Rock Monastery
          </div>
          <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm mr-2 mb-2">
            🏛️ Udawalawe National Park
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanScreen;
