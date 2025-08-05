
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Download, X, Wifi, WifiOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed/standalone
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.matchMedia('(display-mode: fullscreen)').matches ||
                        (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
      return standalone;
    };

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('PWA install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Show prompt immediately if not already dismissed
      const wasDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!wasDismissed && !checkStandalone()) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 1000);
      }
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowPrompt(false);
      setIsInstallable(false);
      setIsStandalone(true);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-prompt-dismissed');
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkStandalone();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      console.log('User choice:', choiceResult.outcome);
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        localStorage.removeItem('pwa-prompt-dismissed');
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal but allow showing again after some time
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  const handleNotNow = () => {
    setShowPrompt(false);
    // Don't show again for this session only
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed, dismissed this session, or recently dismissed
  const wasDismissedRecently = () => {
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
    if (!dismissedTime) return false;
    
    // Show again after 7 days
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return parseInt(dismissedTime) > sevenDaysAgo;
  };

  const sessionDismissed = sessionStorage.getItem('pwa-prompt-dismissed');
  
  if (isStandalone || !isInstallable || !showPrompt || sessionDismissed || wasDismissedRecently()) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Install Shopping Tracker</h3>
              {!isOnline && <WifiOff className="w-4 h-4 text-orange-500" />}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {!isOnline 
                ? "Install this app to use it offline and never lose access to your shopping list!"
                : "Install this app for faster access and offline usage!"
              }
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleInstallClick}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4 mr-1" />
                Install Now
              </Button>
              <Button 
                onClick={handleNotNow}
                variant="outline"
                size="sm"
              >
                Not now
              </Button>
              <Button 
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Don't ask again
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;
