import React, { useState, useRef } from 'react';
import { EnhancedShoppingCard } from './EnhancedShoppingCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Camera, Plus, Trash2, ShoppingBag, Edit3, Heart, Wifi, WifiOff, Check, X, Share2 } from 'lucide-react';
import { useShoppingItems, ShoppingItem } from '@/hooks/useShoppingItems';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import PWAInstallPrompt from './PWAInstallPrompt';
import { Badge } from './ui/badge';

const CURRENCIES = [
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

const ShoppingTracker = () => {
  const {
    items,
    isLoading,
    isOnline,
    syncStatus,
    createItem,
    updateItem,
    deleteItem,
    updateExchangeRates,
    isCreating,
    isUpdating,
    isDeleting,
  } = useShoppingItems();

  const [fromCurrency, setFromCurrency] = useState('JPY');
  const [toCurrency, setToCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(144);
  const [customRate, setCustomRate] = useState<string>('');
  const [editingRate, setEditingRate] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string>('');
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [isProcessingOCR] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [itemLayout, setItemLayout] = useState<'list' | 'grid'>('list');

  // Touch handling for swipe gestures
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const minSwipeDistance = 50;

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = (itemId: string) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setSwipedItemId(itemId);
    }
    if (isRightSwipe) {
      setSwipedItemId(null);
    }
  };

  const updateCustomRate = () => {
    const rate = parseFloat(customRate);
    if (rate && rate > 0) {
      setExchangeRate(rate);
      updateExchangeRates(rate, fromCurrency, toCurrency);
      setEditingRate(false);
      setCustomRate('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        setCapturedPhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    if (!newItemName.trim() || !newItemPrice || !capturedPhoto) return;

    const priceOriginal = parseFloat(newItemPrice);
    const priceConverted = priceOriginal / exchangeRate;
    
    const newItem = {
      name: newItemName.trim(),
      photo: capturedPhoto,
      price_original: priceOriginal,
      price_converted: priceConverted,
      original_currency: fromCurrency,
      converted_currency: toCurrency,
      exchange_rate: exchangeRate,
      liked: false,
      purchased: false,
      timestamp: new Date().toISOString(),
    };

    createItem(newItem);
    
    // Reset form
    setNewItemName('');
    setNewItemPrice('');
    setRetailPrice('');
    setBrandName('');
    setCapturedPhoto('');
  };

  const startEditing = (item: ShoppingItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(item.price_original.toString());
    setSwipedItemId(null); // Hide swipe actions
  };

  const saveEdit = () => {
    if (!editingItem || !editName.trim() || !editPrice) return;

    const priceOriginal = parseFloat(editPrice);
    const priceConverted = priceOriginal / exchangeRate;

    const updatedItem = {
      ...editingItem,
      name: editName.trim(),
      price_original: priceOriginal,
      price_converted: priceConverted,
      exchange_rate: exchangeRate,
    };

    updateItem(updatedItem);
    setEditingItem(null);
    setEditName('');
    setEditPrice('');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditName('');
    setEditPrice('');
  };

  const toggleLike = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      console.log('Toggling like for:', item.name, 'Current state:', item.liked);
      updateItem({ ...item, liked: !item.liked });
    }
  };

  const togglePurchased = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      console.log('Toggling purchased for:', item.name, 'Current state:', item.purchased);
      updateItem({ ...item, purchased: !item.purchased });
      setSwipedItemId(null);
    }
  };

  const handleDelete = (itemId: string) => {
    deleteItem(itemId);
    setSwipedItemId(null); // Hide swipe actions after delete
  };

  const getFromCurrencySymbol = () => CURRENCIES.find(c => c.code === fromCurrency)?.symbol || fromCurrency;
  const getToCurrencySymbol = () => CURRENCIES.find(c => c.code === toCurrency)?.symbol || toCurrency;

  const getTotalOriginal = () => items.reduce((sum, item) => sum + item.price_original, 0);
  const getTotalConverted = () => items.reduce((sum, item) => sum + item.price_converted, 0);
  const getPurchasedCount = () => items.filter(item => item.purchased).length;
  const getPurchasedTotal = () => items.filter(item => item.purchased).reduce((sum, item) => sum + item.price_converted, 0);

  // Sort items: liked first, then unpurchased, then by timestamp
  const sortedItems = [...items].sort((a, b) => {
    if (a.liked && !b.liked) return -1;
    if (!a.liked && b.liked) return 1;
    if (!a.purchased && b.purchased) return -1;
    if (a.purchased && !b.purchased) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Removed InstagramView "Post View" per request

  const shareToInstagram = async (item: ShoppingItem) => {
    try {
      const size = 1080; // Square for Instagram
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background radial gradient approximating provided artwork
      const gradient = ctx.createRadialGradient(
        size * 0.5,
        size * 0.7,
        size * 0.1,
        size * 0.5,
        size * 0.5,
        size * 0.8
      );
      gradient.addColorStop(0, '#ff7a00'); // orange center
      gradient.addColorStop(0.45, '#ff6aa6'); // pink
      gradient.addColorStop(0.75, '#6da3ff'); // blue
      gradient.addColorStop(1, '#ffffff'); // white edge
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Draw item image if present
      if (item.photo) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            // cover fit
            const iw = img.width;
            const ih = img.height;
            const scale = Math.max(size / iw, size / ih);
            const dw = iw * scale;
            const dh = ih * scale;
            const dx = (size - dw) / 2;
            const dy = (size - dh) / 2;
            ctx.globalAlpha = 0.9;
            ctx.drawImage(img, dx, dy, dw, dh);
            ctx.globalAlpha = 1;
            resolve();
          };
          img.onerror = () => resolve();
          img.src = item.photo;
        });
      }

      // Overlay panel
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      const panelHeight = 200;
      ctx.fillRect(0, size - panelHeight, size, panelHeight);

      // Text styles
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 40px system-ui, -apple-system, Segoe UI, Roboto';
      ctx.textBaseline = 'top';
      ctx.fillText(item.name?.slice(0, 30) || 'Shopping Find', 40, size - panelHeight + 24);

      ctx.font = '500 30px system-ui, -apple-system, Segoe UI, Roboto';
      const rateText = `${getFromCurrencySymbol()}${exchangeRate.toFixed(0)} = ${getToCurrencySymbol()}1`;
      const dateText = new Date(item.created_at || Date.now()).toLocaleDateString();
      const locationText = location || 'My Trip';
      ctx.fillText(`${locationText} • ${dateText}`, 40, size - panelHeight + 80);

      ctx.font = '600 36px system-ui, -apple-system, Segoe UI, Roboto';
      ctx.fillText(rateText, 40, size - panelHeight + 130);

      const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      if (!blob) return;
      const file = new File([blob], 'shopping-share.jpg', { type: 'image/jpeg' });

      // Share via Web Share API with files (mobile)
      // @ts-ignore
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // @ts-ignore
        await navigator.share({ files: [file], text: `${item.name}` });
      } else {
        // Fallback: trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'shopping-share.jpg';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error preparing Instagram share:', error);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Online/Offline tiny badge at top-right */}
      <div className="fixed top-3 right-3 z-50">
        <Badge className={`${isOnline ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-orange-100 text-orange-700 border border-orange-200'} text-xs px-2 py-0.5`}> 
          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></span>
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>
      <div className="max-w-md mx-auto p-4 space-y-4 pb-20 relative z-10">
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Header Section */}
      <div className="space-y-3">
        {/* Title input styled as title (click to edit) */}
        <Input
          placeholder="Title (e.g., Tokyo Outlet Finds)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border-transparent focus:border-transparent focus:ring-0 text-2xl font-bold px-0"
        />

        {/* Simplified Currency Rate - Single Row */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            {editingRate ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="self-center text-gray-500">to</span>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="number"
                  placeholder="Enter exchange rate"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className="text-center text-lg"
                />
                <div className="flex gap-2">
                  <Button onClick={updateCustomRate} size="sm" className="flex-1">
                    Update All Items
                  </Button>
                  <Button 
                    onClick={() => {setEditingRate(false); setCustomRate('');}} 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-lg font-bold text-blue-600">
                    ¥{exchangeRate.toFixed(0)} = ${1.00}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditingRate(true)}
                  className="flex items-center gap-1 ml-3"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-gray-700">Total Value</p>
              <p className="text-2xl font-bold text-blue-600">
                {getToCurrencySymbol()}{getTotalConverted().toFixed(0)}
              </p>
              <p className="text-sm text-gray-500">
                {getFromCurrencySymbol()}{getTotalOriginal().toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">{items.length} items</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-gray-700">Actually Spent</p>
              <p className="text-2xl font-bold text-green-600">
                {getToCurrencySymbol()}{getPurchasedTotal().toFixed(0)}
              </p>
              <p className="text-sm text-gray-500">
                {getPurchasedCount()} of {items.length} bought
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add New Item */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Item
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Product name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
          
          <Input
            placeholder="Brand (optional)"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
          
          <Input
            type="number"
            placeholder={`Sale price in ${fromCurrency}`}
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
          />
          
          <Input
            type="number"
            placeholder={`Retail price in ${fromCurrency} (optional)`}
            value={retailPrice}
            onChange={(e) => setRetailPrice(e.target.value)}
          />
          
          {/* Optional photo upload */}
          <div className="space-y-2">
            {capturedPhoto && (
              <img src={capturedPhoto} alt="Product" className="w-full h-40 object-cover rounded-lg border-2 border-gray-200" />
            )}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                Upload Photo
              </Button>
              <Button 
                onClick={addItem} 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isCreating || !capturedPhoto}
              >
                {isCreating ? 'Adding...' : 'Add Item'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View switcher: List vs Grid */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant={itemLayout === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setItemLayout('list')}
        >
          List
        </Button>
        <Button
          variant={itemLayout === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setItemLayout('grid')}
        >
          Grid
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <canvas style={{ display: 'none' }} />

      {/* Items rendering with switcher */}
      {itemLayout === 'list' ? (
        <div className="space-y-3">
          {sortedItems.map(item => (
            <div key={item.id} className="relative">
              <Card 
                className={`hover:shadow-md transition-all duration-200 overflow-hidden ${
                  item.liked ? 'ring-2 ring-pink-200 bg-pink-50' : ''
                } ${item.purchased ? 'bg-green-50 border-green-300' : ''} ${
                  swipedItemId === item.id ? 'transform -translate-x-20' : ''
                }`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={() => onTouchEnd(item.id)}
              >
                <CardContent className="p-4">
                  {editingItem?.id === item.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Product name"
                      />
                      <Input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder={`Price in ${fromCurrency}`}
                      />
                      <div className="flex gap-2">
                        <Button onClick={saveEdit} size="sm" className="flex-1" disabled={isUpdating}>
                          <Check className="w-3 h-3 mr-1" />
                          {isUpdating ? 'Saving...' : 'Save'}
                        </Button>
                        <Button onClick={cancelEdit} variant="outline" size="sm" className="flex-1">
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={item.photo} 
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="pr-20">
                          <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-2">
                            {item.name}
                            {item.purchased && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Bought
                              </span>
                            )}
                          </h3>
                          
                          <div className="mb-2">
                            <p className={`text-xl font-bold ${
                              item.purchased ? 'text-green-600' : 'text-blue-600'
                            }`}>
                              {getToCurrencySymbol()}{item.price_converted.toFixed(0)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {getFromCurrencySymbol()}{item.price_original.toFixed(0)}
                            </p>
                          </div>
                          
                          <p className="text-xs text-gray-400">{formatShortDate(item.created_at)}</p>
                        </div>
                      </div>

                      {/* Vertical Action Buttons on the Right */}
                      <div className="absolute right-3 top-3 flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(item.id);
                          }}
                          className="h-10 w-10 rounded-full hover:bg-pink-50 p-0"
                        // keep interactive for instant UX even if a mutation is pending
                        >
                          <Heart 
                            className={`w-6 h-6 ${item.liked ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} 
                          />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePurchased(item.id);
                          }}
                          className="h-10 w-10 rounded-full hover:bg-green-50 p-0"
                          // keep interactive for instant UX even if a mutation is pending
                        >
                          <ShoppingBag 
                            className={`w-6 h-6 ${item.purchased ? 'fill-green-500 text-green-500' : 'text-gray-400'}`} 
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareToInstagram(item);
                          }}
                          className="h-10 w-10 rounded-full hover:bg-blue-50 p-0"
                        >
                          <Share2 className="w-6 h-6 text-blue-500" />
                        </Button>
                      </div>
                    </div>
                   )}
                 </CardContent>
               </Card>

               {/* Vertical Swipe Actions - Edit and Delete */}
               {swipedItemId === item.id && (
                 <div className="absolute right-0 top-0 h-full flex flex-col items-center justify-center gap-2 pr-2 py-2">
                   <Button
                     variant="outline"
                     size="icon"
                     onClick={() => startEditing(item)}
                     className="bg-blue-500 text-white hover:bg-blue-600 shadow-lg h-10 w-10 rounded-full"
                   >
                     <Edit3 className="w-4 h-4" />
                   </Button>
                   <Button
                     variant="outline"
                     size="icon"
                     onClick={() => handleDelete(item.id)}
                     className="bg-red-500 text-white hover:bg-red-600 shadow-lg h-10 w-10 rounded-full"
                     disabled={isDeleting}
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 </div>
               )}
             </div>
           ))}
         </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {sortedItems.map(item => (
            <EnhancedShoppingCard
              key={item.id}
              item={item}
              currencySymbol={getToCurrencySymbol()}
              onToggleLike={(id) => toggleLike(id)}
              onTogglePurchased={(id) => togglePurchased(id)}
              onCardClick={() => {}}
              onShare={shareToInstagram}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && !isLoading && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-8 text-center text-gray-500">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No items yet</h3>
            <p className="text-sm">Start tracking your shopping by taking a photo and adding your first purchase!</p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <p>Loading items...</p>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
};

export default ShoppingTracker;
