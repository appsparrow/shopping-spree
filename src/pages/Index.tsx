
import { useState, useEffect } from 'react';
import AuthScreen from '../components/AuthScreen';
import PlanMode from '../components/PlanMode';
import LiveMode from '../components/LiveMode';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MapPin, CheckSquare } from 'lucide-react';

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
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center p-4 bg-white border-b">
          <h1 className="text-xl font-bold text-gray-900">Plan & Go</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Logout
          </button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 m-4 mb-6">
            <TabsTrigger value="plan" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Plan Mode
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Live Mode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="px-4 pb-4">
            <PlanMode />
          </TabsContent>

          <TabsContent value="live" className="px-4 pb-4">
            <LiveMode />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
