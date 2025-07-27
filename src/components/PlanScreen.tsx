
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar, Plus, Edit3 } from 'lucide-react';
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
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${start.getFullYear()}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        {isEditingTrip ? (
          <div className="space-y-4">
            <Input
              value={trip.name}
              onChange={(e) => updateTrip({ name: e.target.value })}
              className="text-2xl font-bold border-none p-0 focus:ring-0"
              placeholder="Trip name"
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Input
                  type="date"
                  value={trip.startDate}
                  onChange={(e) => updateTrip({ startDate: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <Input
                  type="date"
                  value={trip.endDate}
                  onChange={(e) => updateTrip({ endDate: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={() => setIsEditingTrip(false)} className="mt-4">
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{trip.name}</h2>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDateRange()}</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditingTrip(true)}
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {trip.days.map((day) => (
          <DayCard
            key={day.id}
            day={day}
            onUpdateActivities={(activities) => updateDay(day.id, activities)}
          />
        ))}
      </div>
    </div>
  );
};

export default PlanScreen;
