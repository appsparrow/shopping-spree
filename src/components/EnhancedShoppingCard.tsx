import React from 'react';
import { Heart, ShoppingBag, Share2, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ShoppingItem {
  id: string;
  name: string;
  brand?: string;
  photo?: string;
  price_original: number;
  price_converted?: number;
  retail_price?: number;
  original_currency: string;
  converted_currency?: string;
  exchange_rate?: number;
  liked: boolean;
  purchased: boolean;
  timestamp: string;
  created_at: string;
  location?: string;
}

interface EnhancedShoppingCardProps {
  item: ShoppingItem;
  currencySymbol: string;
  onToggleLike: (id: string) => void;
  onTogglePurchased: (id: string) => void;
  onCardClick: (item: ShoppingItem) => void;
  onShare: (item: ShoppingItem) => void;
  isUpdating?: boolean;
}

export const EnhancedShoppingCard: React.FC<EnhancedShoppingCardProps> = ({
  item,
  currencySymbol,
  onToggleLike,
  onTogglePurchased,
  onCardClick,
  onShare,
  isUpdating = false
}) => {
  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateDiscount = () => {
    if (item.retail_price && item.price_original && item.retail_price > item.price_original) {
      return Math.round(((item.retail_price - item.price_original) / item.retail_price) * 100);
    }
    return null;
  };

  const discount = calculateDiscount();

  return (
    <Card 
      className="glass-card relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
      onClick={() => onCardClick(item)}
    >
      <div className="relative aspect-square">
        {item.photo ? (
          <img
            src={item.photo}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Tag className="w-12 h-12 text-primary/40" />
          </div>
        )}
        
        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-3 left-3">
            <Badge className="discount-badge rounded-full px-2 py-1 text-xs font-bold">
              -{discount}%
            </Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="glass-card w-8 h-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(item.id);
            }}
            disabled={isUpdating}
          >
            <Heart 
              className={`w-4 h-4 ${item.liked ? 'fill-red-500 text-red-500' : 'text-white'}`}
            />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="glass-card w-8 h-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePurchased(item.id);
            }}
            disabled={isUpdating}
          >
            <ShoppingBag 
              className={`w-4 h-4 ${item.purchased ? 'fill-green-500 text-green-500' : 'text-white'}`}
            />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="glass-card w-8 h-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onShare(item);
            }}
          >
            <Share2 className="w-4 h-4 text-white" />
          </Button>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Product Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          {item.brand && (
            <p className="text-xs font-medium text-gray-200 mb-1">{item.brand}</p>
          )}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2">{item.name}</h3>
          
          {/* Price Section */}
          <div className="flex items-center justify-between">
            <div className="price-tag px-2 py-1 rounded-md">
              <span className="font-bold text-sm">
                {currencySymbol}{item.price_converted || item.price_original}
              </span>
              {item.retail_price && (
                <span className="ml-2 text-xs line-through opacity-70">
                  {currencySymbol}{item.retail_price}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-300">
              {item.location || formatShortDate(item.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};