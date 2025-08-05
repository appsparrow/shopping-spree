
import React, { useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Download, ArrowLeft, ShoppingBag, Heart, MapPin, Eye, EyeOff, ChevronUp } from 'lucide-react';
import { ShoppingItem } from '@/hooks/useShoppingItems';
import InstagramCard from './InstagramCard';

interface InstagramViewProps {
  items: ShoppingItem[];
  totalSpent: number;
  totalItems: number;
  purchasedCount: number;
  totalCount: number;
  currencySymbol: string;
  exchangeRate: number;
  fromCurrency: string;
  toCurrency: string;
  location: string;
  onClose: () => void;
  onToggleLike: (item: ShoppingItem) => void;
  onTogglePurchased: (item: ShoppingItem) => void;
  isUpdating: boolean;
}

const InstagramView: React.FC<InstagramViewProps> = ({
  items,
  totalSpent,
  totalItems,
  purchasedCount,
  totalCount,
  currencySymbol,
  exchangeRate,
  fromCurrency,
  toCurrency,
  location,
  onClose,
  onToggleLike,
  onTogglePurchased,
  isUpdating
}) => {
  const viewRef = useRef<HTMLDivElement>(null);
  const [showExchangeRate, setShowExchangeRate] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllProducts, setShowAllProducts] = useState(false);

  const downloadImage = () => {
    if (viewRef.current) {
      import('html2canvas').then(html2canvas => {
        html2canvas.default(viewRef.current!, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          height: viewRef.current!.scrollHeight,
          width: viewRef.current!.scrollWidth,
        }).then(canvas => {
          const link = document.createElement('a');
          link.download = 'shopping-haul.png';
          link.href = canvas.toDataURL('image/png', 1.0);
          link.click();
        });
      }).catch(() => {
        alert('Screenshot feature requires additional setup. Please take a manual screenshot for now!');
      });
    }
  };

  const handleSwipeUp = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowAllProducts(true);
    }
  };

  const handleSwipeDown = () => {
    if (showAllProducts) {
      setShowAllProducts(false);
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 flex items-center justify-center">
        <div className="text-center text-white">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">No Items Found</h2>
          <p className="opacity-80">Add some products to create your shopping haul!</p>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="mt-4 text-purple-600 border-white bg-white hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (showAllProducts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
        <div className="max-w-lg mx-auto">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-4 text-white">
            <Button
              variant="ghost"
              onClick={() => setShowAllProducts(false)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold">All Products ({items.length})</h1>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              Close
            </Button>
          </div>

          {/* All Products Grid */}
          <div className="grid grid-cols-2 gap-3 pb-20">
            {items.map((item, index) => (
              <div key={item.id} className="aspect-[3/4] relative">
                <img 
                  src={item.photo} 
                  alt={item.name}
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl" />
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <p className="text-xs">{currencySymbol}{item.price_converted.toFixed(0)}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.liked && (
                    <div className="bg-red-500 rounded-full p-1">
                      <Heart className="w-3 h-3 fill-white text-white" />
                    </div>
                  )}
                  {item.purchased && (
                    <div className="bg-green-500 rounded-full p-1">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <div 
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => {
                    setCurrentIndex(index);
                    setShowAllProducts(false);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div ref={viewRef} className="h-screen flex items-center justify-center relative">
        {/* Background with current item */}
        <div className="absolute inset-0">
          <img 
            src={currentItem.photo} 
            alt={currentItem.name}
            className="w-full h-full object-cover blur-sm opacity-30"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Header Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          
          <div className="text-white text-center">
            <p className="text-sm opacity-80">{currentIndex + 1} of {items.length}</p>
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="text-xs">{location}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowExchangeRate(!showExchangeRate)}
              className="text-white hover:bg-white/20"
            >
              {showExchangeRate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              onClick={downloadImage}
              className="text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Exchange Rate Badge */}
        {showExchangeRate && (
          <div className="absolute top-16 left-4 right-4 z-10">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-center">
              <p className="text-white text-sm font-medium">
                {fromCurrency} {exchangeRate.toFixed(2)} = {toCurrency} 1.00
              </p>
            </div>
          </div>
        )}

        {/* Main Product Card */}
        <div className="relative z-10 max-w-sm w-full mx-4">
          <InstagramCard
            item={currentItem}
            currencySymbol={currencySymbol}
            onToggleLike={onToggleLike}
            onTogglePurchased={onTogglePurchased}
            isUpdating={isUpdating}
          />
        </div>

        {/* Swipe Indicators */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center text-white">
            <Button
              variant="ghost"
              onClick={handleSwipeUp}
              className="p-2 hover:bg-white/20 rounded-full"
            >
              <ChevronUp className="w-6 h-6" />
            </Button>
            <p className="text-xs opacity-80 mt-1">
              {currentIndex < items.length - 1 ? 'Swipe up for next' : 'Swipe up for all'}
            </p>
          </div>
        </div>

        {/* Touch handlers for swipe */}
        <div 
          className="absolute inset-0 z-5"
          onTouchStart={(e) => {
            const touch = e.touches[0];
            const startY = touch.clientY;
            
            const handleTouchEnd = (endEvent: TouchEvent) => {
              const endTouch = endEvent.changedTouches[0];
              const deltaY = startY - endTouch.clientY;
              
              if (Math.abs(deltaY) > 50) {
                if (deltaY > 0) {
                  handleSwipeUp();
                } else {
                  handleSwipeDown();
                }
              }
              
              document.removeEventListener('touchend', handleTouchEnd);
            };
            
            document.addEventListener('touchend', handleTouchEnd);
          }}
        />

        {/* Summary Stats - Bottom */}
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="font-bold">{totalCount}</p>
                <p className="opacity-80">Items</p>
              </div>
              <div>
                <p className="font-bold">{purchasedCount}</p>
                <p className="opacity-80">Bought</p>
              </div>
              <div>
                <p className="font-bold">{currencySymbol}{totalSpent.toFixed(0)}</p>
                <p className="opacity-80">Spent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramView;
