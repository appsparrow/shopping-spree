
import { useState, useEffect } from 'react';
import AuthScreen from '../components/AuthScreen';
import PlanScreen from '../components/PlanScreen';
import MemoryScreen from '../components/MemoryScreen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MapPin, Camera } from 'lucide-react';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('plan');

  useEffect(() => {
    const authStatus = localStorage.getItem('planAndGo_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('planAndGo_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('planAndGo_auth');
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Plan & Go</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Logout
          </button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="plan" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Plan
            </TabsTrigger>
            <TabsTrigger value="memory" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Memory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan">
            <PlanScreen />
          </TabsContent>

          <TabsContent value="memory">
            <MemoryScreen />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
