
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { GripVertical, Edit, X, Calendar } from 'lucide-react';
import { Database } from '@/types/database';

type TripCity = Database['public']['Tables']['trip_cities']['Row'];

interface CityCardProps {
  city: TripCity;
  onUpdate: (updates: Partial<TripCity>) => void;
  onDelete: () => void;
}

export const CityCard = ({ city, onUpdate, onDelete }: CityCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(city.city_name);
  const [editDays, setEditDays] = useState(city.planned_days);

  const handleSave = () => {
    onUpdate({
      city_name: editName,
      planned_days: editDays
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(city.city_name);
    setEditDays(city.planned_days);
    setIsEditing(false);
  };

  const formatDateRange = () => {
    if (!city.start_date || !city.end_date) return '';
    const start = new Date(city.start_date);
    const end = new Date(city.end_date);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing" />
      
      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="font-medium"
            />
            <Input
              type="number"
              min="1"
              max="30"
              value={editDays}
              onChange={(e) => setEditDays(parseInt(e.target.value) || 1)}
              className="w-24"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-medium text-gray-900">{city.city_name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{city.planned_days} day{city.planned_days > 1 ? 's' : ''}</span>
              {formatDateRange() && (
                <>
                  <span>•</span>
                  <Calendar className="w-3 h-3" />
                  <span>{formatDateRange()}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="text-gray-500 hover:text-gray-700"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-500 hover:text-red-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
