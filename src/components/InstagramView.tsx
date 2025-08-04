
import React, { useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Download, ArrowLeft, ShoppingBag, Heart } from 'lucide-react';
import { ShoppingItem } from '@/hooks/useShoppingItems';

interface InstagramViewProps {
  items: ShoppingItem[];
  totalSpent: number;
  totalItems: number;
  purchasedCount: number;
  totalCount: number;
  currencySymbol: string;
  onClose: () => void;
}

const InstagramView: React.FC<InstagramViewProps> = ({
  items,
  totalSpent,
  totalItems,
  purchasedCount,
  totalCount,
  currencySymbol,
  onClose
}) => {
  const viewRef = useRef<HTMLDivElement>(null);

  const downloadImage = () => {
    if (viewRef.current) {
      // Create a temporary canvas to capture the content
      import('html2canvas').then(html2canvas => {
        html2canvas.default(viewRef.current!, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
        }).then(canvas => {
          const link = document.createElement('a');
          link.download = 'shopping-haul.png';
          link.href = canvas.toDataURL();
          link.click();
        });
      }).catch(() => {
        // Fallback: just copy to clipboard or show instructions
        alert('Screenshot feature requires additional setup. Please take a manual screenshot for now!');
      });
    }
  };

  // Show only first 6 items for better layout
  const displayItems = items.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4">
      <div className="max-w-md mx-auto">
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
          <Button
            variant="ghost"
            onClick={downloadImage}
            className="text-white hover:bg-white/20"
          >
            <Download className="w-5 h-5 mr-2" />
            Save
          </Button>
        </div>

        {/* Instagram-style Post */}
        <div ref={viewRef} className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2" />
            <h1 className="text-2xl font-bold mb-1">Shopping Haul</h1>
            <p className="text-pink-100">My latest finds! 💕</p>
          </div>

          {/* Stats */}
          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-600">{totalCount}</p>
                <p className="text-sm text-gray-600">Items Found</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{purchasedCount}</p>
                <p className="text-sm text-gray-600">Purchased</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-pink-600">{currencySymbol}{totalSpent.toFixed(0)}</p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {displayItems.map((item, index) => (
                <div key={item.id} className="relative">
                  <img 
                    src={item.photo} 
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-lg flex items-end p-2">
                    <div className="text-white">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <p className="text-xs">{currencySymbol}{item.price_converted.toFixed(0)}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      {item.liked && (
                        <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                      )}
                      {item.purchased && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 6 && (
              <div className="mt-3 text-center">
                <p className="text-gray-500 text-sm">+{items.length - 6} more items</p>
              </div>
            )}
          </div>

          {/* Budget Summary */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Shopping Budget Status</p>
              <div className="flex justify-center items-center gap-4">
                <div>
                  <p className="text-lg font-bold text-blue-600">{currencySymbol}{totalItems.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">Total Value</p>
                </div>
                <div className="text-2xl">→</div>
                <div>
                  <p className="text-lg font-bold text-green-600">{currencySymbol}{totalSpent.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">Actually Spent</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Saved: {currencySymbol}{(totalItems - totalSpent).toFixed(0)} 
                ({Math.round(((totalItems - totalSpent) / totalItems) * 100)}%)
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 text-center text-gray-500">
            <p className="text-xs">#ShoppingHaul #BudgetTracker #SmartShopping</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-white/80">
          <p className="text-sm">
            Take a screenshot or use the save button to share on social media!
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstagramView;
