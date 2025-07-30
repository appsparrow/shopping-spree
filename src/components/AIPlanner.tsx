
import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Bot, Wand2, Loader2 } from 'lucide-react';

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

interface AIPlannerProps {
  onPlanGenerated: (tripSetup: TripSetup, goDoItems: GoDoItem[]) => void;
}

const AIPlanner = ({ onPlanGenerated }: AIPlannerProps) => {
  const [rawPlan, setRawPlan] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlan = async () => {
    if (!rawPlan.trim() || !apiKey.trim()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Please convert this travel plan into a structured JSON format. Extract:
1. Trip details (name, duration, cities)
2. Activities and places organized by city
3. Suggested timeframes and notes

Raw travel plan:
${rawPlan}

Return ONLY valid JSON in this exact format:
{
  "tripSetup": {
    "tripName": "Trip Name",
    "numberOfPeople": 2,
    "fromDate": "",
    "toDate": "",
    "baseLocation": "Starting City",
    "cities": ["City1", "City2"]
  },
  "activities": [
    {
      "cityId": "City1",
      "placeName": "Activity Name",
      "preferredDate": "",
      "timeWindow": "Morning/Afternoon/Evening",
      "notes": "Any notes",
      "tags": ["Food", "Culture", "Nature"]
    }
  ]
}`
            }]
          }]
        })
      });

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No response from AI');
      }

      // Clean the response to extract JSON
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response');
      }

      const parsedPlan = JSON.parse(jsonMatch[0]);
      
      // Convert to our format
      const tripSetup: TripSetup = parsedPlan.tripSetup;
      const goDoItems: GoDoItem[] = parsedPlan.activities.map((activity: any, index: number) => ({
        id: (Date.now() + index).toString(),
        cityId: activity.cityId,
        placeName: activity.placeName,
        preferredDate: activity.preferredDate || '',
        timeWindow: activity.timeWindow || '',
        notes: activity.notes || '',
        tags: activity.tags || [],
        completed: false,
        skipped: false
      }));

      onPlanGenerated(tripSetup, goDoItems);
      
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to generate plan. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-600" />
          AI Travel Planner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Gemini API Key
          </label>
          <Input
            type="password"
            placeholder="Enter your Google Gemini API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Get your API key from{' '}
            <a 
              href="https://makersuite.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste Your Travel Plan
          </label>
          <Textarea
            placeholder="Paste your raw travel plan here (like the Japan example you shared)..."
            value={rawPlan}
            onChange={(e) => setRawPlan(e.target.value)}
            rows={12}
            className="font-mono text-sm"
          />
        </div>

        <Button 
          onClick={generatePlan}
          disabled={!rawPlan.trim() || !apiKey.trim() || isGenerating}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Plan...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Plan with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIPlanner;
