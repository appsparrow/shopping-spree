
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react';

interface Activity {
  id: string;
  text: string;
  completed: boolean;
  type: 'activity' | 'place' | 'accommodation';
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
  const [isOpen, setIsOpen] = useState(false);
  const [newActivity, setNewActivity] = useState('');

  const addActivity = () => {
    if (newActivity.trim()) {
      const activity: Activity = {
        id: Date.now().toString(),
        text: newActivity.trim(),
        completed: false,
        type: 'activity'
      };
      onUpdateActivities([...day.activities, activity]);
      setNewActivity('');
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

  const completedCount = day.activities.filter(a => a.completed).length;
  const totalCount = day.activities.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full p-6 text-left hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {new Date(day.date + ', 2025').getDate()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{day.weekday}</h3>
                <p className="text-sm text-gray-600">{day.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {totalCount > 0 && (
                <span className="text-sm text-gray-500">
                  {completedCount}/{totalCount} completed
                </span>
              )}
              {isOpen ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-6 pb-6 space-y-4">
            {day.activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  checked={activity.completed}
                  onCheckedChange={(checked) =>
                    updateActivity(activity.id, { completed: checked as boolean })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <Textarea
                    value={activity.text}
                    onChange={(e) => updateActivity(activity.id, { text: e.target.value })}
                    className="border-none bg-transparent p-0 resize-none focus:ring-0"
                    placeholder="Add activity details..."
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteActivity(activity.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                placeholder="Add new activity..."
                onKeyPress={(e) => e.key === 'Enter' && addActivity()}
                className="flex-1"
              />
              <Button onClick={addActivity} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default DayCard;
