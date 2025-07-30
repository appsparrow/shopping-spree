
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { X, Clock, Calendar, Tag } from 'lucide-react';

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

interface GoDoCardProps {
  item: GoDoItem;
  onUpdate: (updates: Partial<GoDoItem>) => void;
  onDelete: () => void;
}

const GoDoCard = ({ item, onUpdate, onDelete }: GoDoCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !item.tags.includes(newTag.trim())) {
      onUpdate({ tags: [...item.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onUpdate({ tags: item.tags.filter(tag => tag !== tagToRemove) });
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <Input
          value={item.placeName}
          onChange={(e) => onUpdate({ placeName: e.target.value })}
          className="font-medium text-lg border-none p-0 focus:ring-0"
          placeholder="Place name"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-500 hover:text-red-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <Input
            type="date"
            value={item.preferredDate}
            onChange={(e) => onUpdate({ preferredDate: e.target.value })}
            className="text-sm border-gray-200"
          />
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Time window"
            value={item.timeWindow}
            onChange={(e) => onUpdate({ timeWindow: e.target.value })}
            className="text-sm border-gray-200"
          />
        </div>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-blue-600 hover:text-blue-800 mb-2"
      >
        {isExpanded ? 'Less details' : 'More details'}
      </button>

      {isExpanded && (
        <div className="space-y-3">
          <Textarea
            placeholder="Notes (lunch spots, ticket details, etc.)"
            value={item.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="resize-none"
            rows={3}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {item.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag (Nature, Food, Culture, etc.)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="text-sm"
              />
              <Button size="sm" onClick={addTag}>Add</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoDoCard;
