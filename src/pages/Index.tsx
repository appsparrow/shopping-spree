
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthScreen from '../components/AuthScreen';
import TripsList from '../components/TripsList';
import TripView from '../components/TripView';
import TripSetup from '../components/TripSetup';
import CreateTrip from '../components/CreateTrip';

type ViewMode = 'list' | 'view' | 'setup' | 'create';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentView('list');
    setSelectedTripId(null);
  };

  const handleSelectTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    setCurrentView('view');
  };

  const handleCreateTrip = () => {
    setCurrentView('create');
  };

  const handleTripCreated = (tripId: string) => {
    setSelectedTripId(tripId);
    setCurrentView('setup');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedTripId(null);
  };

  const handleGoToSetup = () => {
    setCurrentView('setup');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {currentView !== 'list' && (
        <div className="bg-white border-b px-4 py-3 flex justify-end">
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Logout
          </button>
        </div>
      )}

      {currentView === 'list' && (
        <>
          <div className="bg-white border-b px-4 py-3 flex justify-end">
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
          <TripsList 
            onSelectTrip={handleSelectTrip}
            onCreateTrip={handleCreateTrip}
          />
        </>
      )}

      {currentView === 'create' && (
        <CreateTrip 
          onBack={handleBackToList}
          onCreated={handleTripCreated}
        />
      )}

      {currentView === 'view' && selectedTripId && (
        <TripView 
          tripId={selectedTripId}
          onBack={handleBackToList}
          onSetup={handleGoToSetup}
        />
      )}

      {currentView === 'setup' && selectedTripId && (
        <TripSetup 
          tripId={selectedTripId}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};

export default Index;
