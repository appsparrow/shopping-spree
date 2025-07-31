import React, { useState } from 'react';
import PlanScreen from './components/PlanScreen';
import MemoryScreen from './components/MemoryScreen';
import LiveMode from './components/LiveMode';
import { MapPin, Sparkles, Brain, Compass } from 'lucide-react';
import EnhancedPlanMode from './components/EnhancedPlanMode';
import './index.css';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('plan');

  const tabs: Tab[] = [
    { id: 'plan', label: 'Plan', icon: MapPin },
    { id: 'planner', label: 'Planner', icon: Brain },
    { id: 'memory', label: 'Memory', icon: Sparkles },
    { id: 'live', label: 'Live', icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="safe-area-top"></div>
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PlanAndGo
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="pb-20">
        {currentScreen === 'plan' && <EnhancedPlanMode />}
        {currentScreen === 'planner' && <PlanScreen />}
        {currentScreen === 'memory' && <MemoryScreen />}
        {currentScreen === 'live' && <LiveMode />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-4 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentScreen(tab.id)}
                className={`flex flex-col items-center py-2 px-1 text-xs transition-colors ${
                  currentScreen === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className={`w-6 h-6 mb-1 ${
                  currentScreen === tab.id ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="safe-area-bottom"></div>
    </div>
  );
}

export default App;
