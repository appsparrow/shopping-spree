
import React, { useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Download, ArrowLeft, ShoppingBag, Heart, MapPin, Eye, EyeOff } from 'lucide-react';
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
  onClose
}) => {
  const viewRef = useRef<HTMLDivElement>(null);
  const [showExchangeRate, setShowExchangeRate] = useState(true);

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

  // Create a grid of items for the post
  const displayItems = items.slice(0, 9); // Show up to 9 items in a 3x3 grid

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-4 text-white">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
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
              <Download className="w-5 h-5 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Instagram-style Story Post */}
        <div ref={viewRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 p-8 text-white text-center relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <ShoppingBag className="w-16 h-16 mx-auto mb-3" />
              <h1 className="text-3xl font-bold mb-2">Shopping Haul</h1>
              {location && (
                <div className="flex items-center justify-center gap-2 text-pink-100">
                  <MapPin className="w-4 h-4" />
                  <p className="text-lg">{location}</p>
                </div>
              )}
              <div className="mt-4 text-pink-100">
                <p className="text-lg">Check out my latest finds! ✨</p>
              </div>
            </div>
          </div>

          {/* Exchange Rate Badge */}
          {showExchangeRate && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 text-center">
              <div className="inline-block bg-white/20 rounded-full px-6 py-2 backdrop-blur-sm">
                <p className="text-sm font-medium">
                  Exchange Rate: {fromCurrency} {exchangeRate.toFixed(2)} = {toCurrency} 1.00
                </p>
              </div>
            </div>
          )}

          {/* Main Stats */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <p className="text-3xl font-bold text-purple-600 mb-1">{totalCount}</p>
                <p className="text-sm text-gray-600 font-medium">Items Found</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <p className="text-3xl font-bold text-green-600 mb-1">{purchasedCount}</p>
                <p className="text-sm text-gray-600 font-medium">Purchased</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <p className="text-3xl font-bold text-pink-600 mb-1">{currencySymbol}{totalSpent.toFixed(0)}</p>
                <p className="text-sm text-gray-600 font-medium">Total Spent</p>
              </div>
            </div>
          </div>

          {/* Items Grid - Instagram Style */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-2">
              {displayItems.map((item, index) => (
                <div key={item.id} className="relative aspect-square">
                  <img 
                    src={item.photo} 
                    alt={item.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-semibold truncate">{item.name}</p>
                    <p className="text-white text-xs">{currencySymbol}{item.price_converted.toFixed(0)}</p>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {item.liked && (
                      <div className="bg-white/90 rounded-full p-1">
                        <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
                      </div>
                    )}
                    {item.purchased && (
                      <div className="bg-green-500 rounded-full p-1">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {items.length > 9 && (
              <div className="mt-4 text-center">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3">
                  <p className="text-purple-700 text-sm font-medium">+{items.length - 9} more amazing finds!</p>
                </div>
              </div>
            )}
          </div>

          {/* Budget Summary with Instagram-like styling */}
          <div className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 p-8 text-white">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">💰 Shopping Budget Breakdown</h3>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-2xl font-bold">{currencySymbol}{totalItems.toFixed(0)}</p>
                    <p className="text-sm opacity-90">Total Wishlist</p>
                  </div>
                  <div className="text-3xl">→</div>
                  <div>
                    <p className="text-2xl font-bold">{currencySymbol}{totalSpent.toFixed(0)}</p>
                    <p className="text-sm opacity-90">Actually Spent</p>
                  </div>
                </div>
                <div className="border-t border-white/30 pt-4">
                  <p className="text-lg font-semibold">
                    💸 Saved: {currencySymbol}{(totalItems - totalSpent).toFixed(0)} 
                  </p>
                  <p className="text-sm opacity-90">
                    ({Math.round(((totalItems - totalSpent) / totalItems) * 100)}% savings!)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with hashtags */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-center">
            <div className="space-y-2">
              <p className="text-white text-sm font-medium">
                #ShoppingHaul #BudgetTracker #SmartShopping
              </p>
              <p className="text-gray-400 text-xs">
                {location && `#${location.replace(/\s+/g, '')} `}#SavingMoney #ShopSmart
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-white/90">
          <p className="text-sm">
            Perfect for Instagram Stories or TikTok posts! 📸
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstagramView;
