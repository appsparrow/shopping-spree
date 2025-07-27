
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Plus, X, Clock } from 'lucide-react';

interface Activity {
  id: string;
  text: string;
  completed: boolean;
  type: 'activity' | 'place' | 'accommodation';
  time?: string;
}

interface Day {
  id: string;
  date: string;
  weekday: string;
  activities: Activity[];
}

interface DayCardProps {
  day: Day;
  onUpdateActivities: (activities: Activity[]) => void;
}

const DayCard = ({ day, onUpdateActivities }: DayCardProps) => {
  const [newActivity, setNewActivity] = useState('');
  const [newTime, setNewTime] = useState('');

  const addActivity = () => {
    if (newActivity.trim()) {
      const activity: Activity = {
        id: Date.now().toString(),
        text: newActivity.trim(),
        completed: false,
        type: 'activity',
        time: newTime || undefined
      };
      onUpdateActivities([...day.activities, activity]);
      setNewActivity('');
      setNewTime('');
    }
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    onUpdateActivities(
      day.activities.map(activity =>
        activity.id === id ? { ...activity, ...updates } : activity
      )
    );
  };

  const deleteActivity = (id: string) => {
    onUpdateActivities(day.activities.filter(activity => activity.id !== id));
  };

  return (
    <div className="p-6">
      {/* Day Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{day.weekday}</h2>
          <p className="text-sm text-gray-500">{day.date}</p>
        </div>
      </div>

      {/* Activities Timeline */}
      <div className="space-y-4 ml-4 border-l-2 border-gray-100 pl-6">
        {day.activities.map((activity, index) => (
          <div key={activity.id} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-9 top-1">
              <Checkbox
                checked={activity.completed}
                onCheckedChange={(checked) =>
                  updateActivity(activity.id, { completed: checked as boolean })
                }
                className="w-6 h-6 rounded-full border-2 border-blue-500 data-[state=checked]:bg-blue-500"
              />
            </div>
            
            {/* Activity content */}
            <div className="bg-gray-50 rounded-lg p-4 relative group">
              {activity.time && (
                <div className="text-xs font-medium text-blue-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activity.time}
                </div>
              )}
              
              <Textarea
                value={activity.text}
                onChange={(e) => updateActivity(activity.id, { text: e.target.value })}
                className="border-none bg-transparent p-0 resize-none focus:ring-0 text-sm leading-relaxed min-h-[60px]"
                placeholder="Add activity details..."
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteActivity(activity.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Add new activity */}
        <div className="relative">
          <div className="absolute -left-9 top-3">
            <div className="w-6 h-6 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
              <Plus className="w-3 h-3 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Input
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder="Time (e.g., 09:30)"
              className="text-xs"
            />
            <div className="flex gap-2">
              <Input
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                placeholder="Add new activity..."
                onKeyPress={(e) => e.key === 'Enter' && addActivity()}
                className="flex-1 text-sm"
              />
              <Button 
                onClick={addActivity} 
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayCard;
