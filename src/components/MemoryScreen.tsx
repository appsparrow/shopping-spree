
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Camera, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';

interface Memory {
  id: string;
  dayId: string;
  place: string;
  notes: string;
  completed: boolean;
  photo?: string;
  date: string;
}

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

const MemoryScreen = () => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newPlace, setNewPlace] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  useEffect(() => {
    const savedTrip = localStorage.getItem('planAndGo_trip');
    const savedMemories = localStorage.getItem('planAndGo_memories');
    
    if (savedTrip) {
      setTrip(JSON.parse(savedTrip));
    }
    if (savedMemories) {
      setMemories(JSON.parse(savedMemories));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('planAndGo_memories', JSON.stringify(memories));
  }, [memories]);

  const addMemory = () => {
    if (newPlace.trim() && selectedDay) {
      const memory: Memory = {
        id: Date.now().toString(),
        dayId: selectedDay,
        place: newPlace.trim(),
        notes: '',
        completed: false,
        date: new Date().toISOString()
      };
      setMemories([...memories, memory]);
      setNewPlace('');
      setSelectedDay('');
    }
  };

  const updateMemory = (id: string, updates: Partial<Memory>) => {
    setMemories(memories.map(memory =>
      memory.id === id ? { ...memory, ...updates } : memory
    ));
  };

  const handlePhotoUpload = (memoryId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateMemory(memoryId, { photo: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getMemoriesByDay = (dayId: string) => {
    return memories.filter(memory => memory.dayId === dayId);
  };

  const getCompletedMemories = () => {
    return memories.filter(memory => memory.completed);
  };

  if (!trip) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No trip planned yet. Go to Plan tab to create your itinerary first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Memory Lane</h2>
        
        <div className="flex gap-4 mb-4">
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="flex-1 p-2 border rounded-lg"
          >
            <option value="">Select a day</option>
            {trip.days.map(day => (
              <option key={day.id} value={day.id}>
                {day.weekday}, {day.date}
              </option>
            ))}
          </select>
          <Input
            value={newPlace}
            onChange={(e) => setNewPlace(e.target.value)}
            placeholder="Add a new place..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && addMemory()}
          />
          <Button onClick={addMemory} className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Add Place
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {trip.days.map(day => {
          const dayMemories = getMemoriesByDay(day.id);
          if (dayMemories.length === 0) return null;

          return (
            <Card key={day.id} className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  {day.weekday}, {day.date}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dayMemories.map(memory => (
                  <div key={memory.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={memory.completed}
                        onCheckedChange={(checked) =>
                          updateMemory(memory.id, { completed: checked as boolean })
                        }
                      />
                      <Input
                        value={memory.place}
                        onChange={(e) => updateMemory(memory.id, { place: e.target.value })}
                        className="flex-1 font-medium"
                        placeholder="Place name"
                      />
                    </div>
                    
                    <Textarea
                      value={memory.notes}
                      onChange={(e) => updateMemory(memory.id, { notes: e.target.value })}
                      placeholder="Add notes about this place..."
                      className="resize-none"
                    />
                    
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer flex items-center gap-2 text-blue-600 hover:text-blue-700">
                        <Camera className="w-4 h-4" />
                        <span className="text-sm">{memory.photo ? 'Change Photo' : 'Add Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(memory.id, e)}
                          className="hidden"
                        />
                      </label>
                      
                      {memory.photo && (
                        <div className="relative">
                          <img
                            src={memory.photo}
                            alt={memory.place}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => updateMemory(memory.id, { photo: undefined })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {getCompletedMemories().length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-800">
              <Camera className="w-5 h-5" />
              Completed Memories ({getCompletedMemories().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getCompletedMemories().map(memory => (
                <div key={memory.id} className="text-center">
                  {memory.photo ? (
                    <img
                      src={memory.photo}
                      alt={memory.place}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-800">{memory.place}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MemoryScreen;
