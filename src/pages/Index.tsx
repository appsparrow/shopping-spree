
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthScreen from '@/components/AuthScreen';
import TripsList from '@/components/TripsList';
import CreateTrip from '@/components/CreateTrip';
import TripView from '@/components/TripView';
import TripSetup from '@/components/TripSetup';
import ShoppingTracker from '@/components/ShoppingTracker';
import { useTrips } from '@/hooks/useTrips';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

const Index = () => {
  console.log('Index component rendering...');
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [currentTrip, setCurrentTrip] = useState(null);
  
  const tripsData = useTrips();
  
  useEffect(() => {
    if (tripsData.currentTrip) {
      setCurrentTrip(tripsData.currentTrip);
      console.log('Current trip updated:', tripsData.currentTrip);
    }
  }, [tripsData.currentTrip]);

  useEffect(() => {
    console.log('Index useEffect running...');
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        console.log('Session user:', session?.user);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session?.user);
      setUser(session?.user ?? null);
    });

    return () => {
      console.log('Cleaning up auth subscription...');
      subscription.unsubscribe();
    };
  }, []);

  console.log('Current state - loading:', loading, 'user:', user, 'view:', view);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <AuthScreen onLogin={() => {}} />;
  }

  const renderView = () => {
    console.log('Rendering view:', view);
    switch (view) {
      case 'create':
        return <CreateTrip onBack={() => setView('list')} onCreated={() => setView('view')} />;
      case 'view':
        return currentTrip ? (
          <TripView 
            tripId={currentTrip.id}
            onBack={() => setView('list')}
            onSetup={() => setView('setup')}
          />
        ) : null;
      case 'setup':
        return currentTrip ? (
          <TripSetup 
            tripId={currentTrip.id}
            onBack={() => setView('view')} 
          />
        ) : null;
      case 'shopping':
        return (
          <div>
            <div className="flex items-center gap-3 mb-4 p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('list')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Shopping Tracker</h1>
            </div>
            <ShoppingTracker />
          </div>
        );
      default:
        return (
          <div>
            <div className="flex items-center justify-between mb-6 p-4">
              <h1 className="text-2xl font-bold">My Trips</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setView('shopping')}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shopping
                </Button>
                <Button onClick={() => setView('create')}>
                  Create Trip
                </Button>
              </div>
            </div>
            <TripsList 
              onSelectTrip={(tripId) => {
                const trip = tripsData.trips.find(t => t.id === tripId);
                if (trip) {
                  setCurrentTrip(trip);
                  setView('view');
                }
              }}
              onCreateTrip={() => setView('create')}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderView()}
    </div>
  );
};

export default Index;
