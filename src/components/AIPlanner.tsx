
import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
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

interface APIProvider {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  endpoint: string;
  model: string;
}

const AIPlanner = ({ onPlanGenerated }: AIPlannerProps) => {
  const [rawPlan, setRawPlan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [apiProviders, setApiProviders] = useState<APIProvider[]>([
    {
      id: 'gemini',
      name: 'Google Gemini',
      enabled: false,
      apiKey: '',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      model: 'gemini-pro'
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      enabled: false,
      apiKey: '',
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      model: 'deepseek-chat'
    },
    {
      id: 'kimi',
      name: 'Kimi K2',
      enabled: false,
      apiKey: '',
      endpoint: 'https://api.moonshot.cn/v1/chat/completions',
      model: 'moonshot-v1-8k'
    },
    {
      id: 'claude',
      name: 'Claude',
      enabled: false,
      apiKey: '',
      endpoint: 'https://api.anthropic.com/v1/messages',
      model: 'claude-3-sonnet-20240229'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      enabled: false,
      apiKey: '',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4'
    }
  ]);

  const updateProvider = (id: string, updates: Partial<APIProvider>) => {
    setApiProviders(prev => prev.map(provider =>
      provider.id === id ? { ...provider, ...updates } : provider
    ));
  };

  const generatePlan = async () => {
    const enabledProvider = apiProviders.find(p => p.enabled && p.apiKey.trim());
    
    if (!rawPlan.trim() || !enabledProvider) {
      return;
    }

    setIsGenerating(true);
    
    try {
      let response;
      const prompt = `Please convert this travel plan into a structured JSON format. Extract:
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
}`;

      if (enabledProvider.id === 'gemini') {
        response = await fetch(`${enabledProvider.endpoint}?key=${enabledProvider.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
      } else if (enabledProvider.id === 'claude') {
        response = await fetch(enabledProvider.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': enabledProvider.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: enabledProvider.model,
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }]
          })
        });
      } else {
        // OpenAI, DeepSeek, Kimi format
        response = await fetch(enabledProvider.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${enabledProvider.apiKey}`
          },
          body: JSON.stringify({
            model: enabledProvider.model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 4000
          })
        });
      }

      const data = await response.json();
      let generatedText = '';

      // Parse response based on provider
      if (enabledProvider.id === 'gemini') {
        generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      } else if (enabledProvider.id === 'claude') {
        generatedText = data.content?.[0]?.text;
      } else {
        generatedText = data.choices?.[0]?.message?.content;
      }
      
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

  const enabledProvider = apiProviders.find(p => p.enabled);
  const hasValidProvider = apiProviders.some(p => p.enabled && p.apiKey.trim());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-600" />
          AI Travel Planner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select AI Provider
          </label>
          <div className="space-y-3">
            {apiProviders.map(provider => (
              <div key={provider.id} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={provider.enabled}
                    onCheckedChange={(checked) => {
                      // Disable all others when enabling one
                      setApiProviders(prev => prev.map(p => ({
                        ...p,
                        enabled: p.id === provider.id ? !!checked : false
                      })));
                    }}
                  />
                  <label className="text-sm font-medium text-gray-700">
                    {provider.name}
                  </label>
                </div>
                
                {provider.enabled && (
                  <Input
                    type="password"
                    placeholder={`Enter your ${provider.name} API key`}
                    value={provider.apiKey}
                    onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value })}
                    className="ml-6"
                  />
                )}
              </div>
            ))}
          </div>
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
          disabled={!rawPlan.trim() || !hasValidProvider || isGenerating}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Plan with {enabledProvider?.name}...
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
