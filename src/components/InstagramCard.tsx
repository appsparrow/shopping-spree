
import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Heart, ShoppingBag, Share2 } from 'lucide-react';
import { ShoppingItem } from '@/hooks/useShoppingItems';

interface InstagramCardProps {
  item: ShoppingItem;
  currencySymbol: string;
  onToggleLike: (item: ShoppingItem) => void;
  onTogglePurchased: (item: ShoppingItem) => void;
  onCardClick?: (item: ShoppingItem) => void;
  onShare?: (item: ShoppingItem) => void;
  isUpdating: boolean;
  location?: string;
}

const InstagramCard: React.FC<InstagramCardProps> = ({
  item,
  currencySymbol,
  onToggleLike,
  onTogglePurchased,
  onCardClick,
  onShare,
  isUpdating,
  location
}) => {
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    
    if (onCardClick) {
      onCardClick(item);
    }
  };

  return (
    <Card 
      className="w-full max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden relative cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Main Product Image */}
      <div className="relative aspect-[4/5] w-full">
        <img 
          src={item.photo} 
          alt={item.name}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Action Buttons - Right Side - Vertical alignment */}
        <div className="absolute right-4 bottom-24 flex flex-col gap-3 items-center">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(item);
            }}
            disabled={isUpdating}
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all border-2 border-white/20"
          >
            <Heart 
              className={`w-8 h-8 ${
                item.liked 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-white'
              }`} 
            />
          </Button>
          
          {/* Shopping Bag Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePurchased(item);
            }}
            disabled={isUpdating}
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all border-2 border-white/20"
          >
            <ShoppingBag 
              className={`w-8 h-8 ${
                item.purchased 
                  ? 'fill-green-500 text-green-500' 
                  : 'text-white'
              }`} 
            />
          </Button>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (onShare) onShare(item);
            }}
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all border-2 border-white/20"
          >
            <Share2 className="w-8 h-8 text-white" />
          </Button>
        </div>

        {/* Product Info - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="mb-2">
            <h3 className="text-lg font-bold mb-2 line-clamp-2">{item.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className={`rounded-full px-3 py-1 ${
                item.purchased ? 'bg-green-500' : 'bg-blue-500'
              }`}>
                <span className="text-white font-bold text-xl">
                  {currencySymbol}{item.price_converted.toFixed(0)}
                </span>
              </div>
              <span className="text-sm opacity-80">
                {item.original_currency} {item.price_original.toFixed(0)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-80">
              {location || formatShortDate(item.created_at)}
            </p>
            
            {/* Status Indicators */}
            <div className="flex gap-1">
              {item.liked && (
                <div className="bg-red-500/90 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center">
                  <Heart className="w-3 h-3 fill-white text-white" />
                </div>
              )}
              {item.purchased && (
                <div className="bg-green-500/90 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center">
                  <ShoppingBag className="w-3 h-3 fill-white text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InstagramCard;
