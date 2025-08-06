
import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Heart, ShoppingCart, Share2 } from 'lucide-react';
import { ShoppingItem } from '@/hooks/useShoppingItems';

interface InstagramCardProps {
  item: ShoppingItem;
  currencySymbol: string;
  onToggleLike: (item: ShoppingItem) => void;
  onTogglePurchased: (item: ShoppingItem) => void;
  isUpdating: boolean;
}

const InstagramCard: React.FC<InstagramCardProps> = ({
  item,
  currencySymbol,
  onToggleLike,
  onTogglePurchased,
  isUpdating
}) => {
  return (
    <Card className="w-full max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden relative">
      {/* Main Product Image */}
      <div className="relative aspect-[4/5] w-full">
        <img 
          src={item.photo} 
          alt={item.name}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Action Buttons - Right Side - Made bigger */}
        <div className="absolute right-4 bottom-24 flex flex-col gap-6">
          {/* Like Button */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleLike(item)}
              disabled={isUpdating}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
            >
              <Heart 
                className={`w-8 h-8 ${
                  item.liked 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-white'
                }`} 
              />
            </Button>
            <span className="text-white text-sm font-semibold mt-2">
              {item.liked ? '❤️' : '🤍'}
            </span>
          </div>
          
          {/* Shopping Cart Button */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onTogglePurchased(item)}
              disabled={isUpdating}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
            >
              <ShoppingCart 
                className={`w-8 h-8 ${
                  item.purchased 
                    ? 'fill-green-500 text-green-500' 
                    : 'text-white'
                }`} 
              />
            </Button>
            <span className="text-white text-sm font-semibold mt-2">
              {item.purchased ? '✅' : '🛒'}
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
            >
              <Share2 className="w-8 h-8 text-white" />
            </Button>
            <span className="text-white text-sm font-semibold mt-2">📤</span>
          </div>
        </div>

        {/* Product Info - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="mb-2">
            <h3 className="text-lg font-bold mb-1 line-clamp-2">{item.name}</h3>
            <div className="flex items-center gap-2">
              <div className={`rounded-full px-3 py-1 ${
                item.purchased ? 'bg-green-500' : 'bg-blue-500'
              }`}>
                <span className="text-white font-bold text-lg">
                  {currencySymbol}{item.price_converted.toFixed(0)}
                </span>
              </div>
              <span className="text-sm opacity-80">
                {item.original_currency} {item.price_original.toFixed(0)}
              </span>
            </div>
          </div>
          
          <p className="text-xs opacity-80">{item.timestamp}</p>
          
          {/* Status Indicators */}
          <div className="flex gap-2 mt-2">
            {item.purchased && (
              <div className="bg-green-500/90 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-sm font-semibold">Purchased ✓</span>
              </div>
            )}
            {item.liked && (
              <div className="bg-red-500/90 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-sm font-semibold">Liked ❤️</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InstagramCard;
