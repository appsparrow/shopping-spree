
import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, ShoppingBag, Heart, MapPin, Download, X, ChevronUp, ChevronDown } from 'lucide-react';
import { ShoppingItem } from '@/hooks/useShoppingItems';

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
  purchasedCount,
  totalCount,
  currencySymbol,
  location,
  onClose,
  onToggleLike,
  onTogglePurchased,
  isUpdating
}) => {
  const viewRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const shareToInstagram = async () => {
    if (viewRef.current) {
      try {
        const html2canvas = await import('html2canvas');
        const canvas = await html2canvas.default(viewRef.current, {
          backgroundColor: '#000000',
          scale: 2,
          useCORS: true,
          allowTaint: true,
        });
        
        canvas.toBlob(async (blob) => {
          if (blob && navigator.share) {
            const file = new File([blob], 'shopping-item.png', { type: 'image/png' });
            try {
              await navigator.share({
                title: `Check out this ${items[currentIndex].name}!`,
                text: `Found this amazing ${items[currentIndex].name} for ${currencySymbol}${items[currentIndex].price_converted.toFixed(0)}`,
                files: [file]
              });
            } catch (error) {
              console.log('Share cancelled or failed:', error);
              fallbackShare(blob);
            }
          } else {
            fallbackShare(blob);
          }
        }, 'image/png', 1.0);
      } catch (error) {
        console.error('Error creating image:', error);
      }
    }
  };

  const fallbackShare = (blob: Blob | null) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'shopping-item.png';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const nextItem = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevItem = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">No Items Found</h2>
          <p className="opacity-80">Add some products to create your shopping haul!</p>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="mt-4 text-white border-white bg-transparent hover:bg-white hover:text-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="text-white text-center">
          <p className="text-sm opacity-80">{currentIndex + 1} / {items.length}</p>
        </div>

        <Button
          variant="ghost"
          onClick={shareToInstagram}
          className="text-white hover:bg-white/20 rounded-full"
        >
          <Download className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Content - TikTok/Instagram Style */}
      <div ref={viewRef} className="h-screen flex items-center justify-center relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={currentItem.photo} 
            alt={currentItem.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Navigation arrows */}
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            onClick={prevItem}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full"
          >
            <ChevronUp className="w-6 h-6" />
          </Button>
        )}

        {currentIndex < items.length - 1 && (
          <Button
            variant="ghost"
            onClick={nextItem}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full"
          >
            <ChevronDown className="w-6 h-6" />
          </Button>
        )}

        {/* Action Buttons - Right Side */}
        <div className="absolute right-4 bottom-32 flex flex-col gap-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleLike(currentItem)}
            disabled={isUpdating}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
          >
            <Heart 
              className={`w-10 h-10 ${
                currentItem.liked 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-white'
              }`} 
            />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onTogglePurchased(currentItem)}
            disabled={isUpdating}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
          >
            <ShoppingBag 
              className={`w-10 h-10 ${
                currentItem.purchased 
                  ? 'fill-green-500 text-green-500' 
                  : 'text-white'
              }`} 
            />
          </Button>
        </div>

        {/* Content - Bottom Left */}
        <div className="absolute bottom-0 left-0 right-20 p-6 text-white z-10">
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-2 line-clamp-2">{currentItem.name}</h1>
            
            {/* Price Display */}
            <div className="flex items-center gap-3 mb-3">
              <div className={`px-4 py-2 rounded-full ${
                currentItem.purchased ? 'bg-green-500' : 'bg-blue-500'
              }`}>
                <span className="text-white font-bold text-2xl">
                  {currencySymbol}{currentItem.price_converted.toFixed(0)}
                </span>
              </div>
              <span className="text-lg opacity-80">
                ¥{currentItem.price_original.toFixed(0)}
              </span>
            </div>

            {/* Location */}
            {location && (
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4" />
                <span className="text-sm opacity-90">{location}</span>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-3">
              {currentItem.purchased && (
                <div className="bg-green-500/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white text-sm font-medium">✓ Bought</span>
                </div>
              )}
              {currentItem.liked && (
                <div className="bg-red-500/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white text-sm font-medium">❤️ Liked</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="font-bold text-lg">{totalCount}</p>
                <p className="opacity-90">Items</p>
              </div>
              <div>
                <p className="font-bold text-lg">{purchasedCount}</p>
                <p className="opacity-90">Bought</p>
              </div>
              <div>
                <p className="font-bold text-lg">{currencySymbol}{totalSpent.toFixed(0)}</p>
                <p className="opacity-90">Spent</p>
              </div>
            </div>
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
                  nextItem();
                } else {
                  prevItem();
                }
              }
              
              document.removeEventListener('touchend', handleTouchEnd);
            };
            
            document.addEventListener('touchend', handleTouchEnd);
          }}
        />
      </div>
    </div>
  );
};

export default InstagramView;
