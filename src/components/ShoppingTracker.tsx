
import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Camera, Plus, Trash2, ShoppingBag, Edit3, Heart, ShoppingCart, Wifi, WifiOff, Check, X } from 'lucide-react';
import { useShoppingItems, ShoppingItem } from '@/hooks/useShoppingItems';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
    isCreating,
    isUpdating,
    isDeleting,
  } = useShoppingItems();

  const [fromCurrency, setFromCurrency] = useState('JPY');
  const [toCurrency, setToCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(150);
  const [customRate, setCustomRate] = useState<string>('');
  const [editingRate, setEditingRate] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateCustomRate = () => {
    const rate = parseFloat(customRate);
    if (rate && rate > 0) {
      setExchangeRate(rate);
      setEditingRate(false);
      setCustomRate('');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      fileInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const photoData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoData);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
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
      timestamp: new Date().toLocaleString(),
    };

    createItem(newItem);
    
    // Reset form
    setNewItemName('');
    setNewItemPrice('');
    setCapturedPhoto('');
  };

  const startEditing = (item: ShoppingItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(item.price_original.toString());
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

  const toggleLike = (item: ShoppingItem) => {
    updateItem({ ...item, liked: !item.liked });
  };

  const togglePurchased = (item: ShoppingItem) => {
    updateItem({ ...item, purchased: !item.purchased });
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

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-20">
      {/* Connection Status */}
      <Card className={`${isOnline ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm">
            {isOnline ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-orange-600" />}
            <span className={isOnline ? 'text-green-700' : 'text-orange-700'}>
              {isOnline ? 'Online' : 'Offline - Changes will sync when connected'}
            </span>
            {syncStatus === 'syncing' && <span className="text-blue-600">Syncing...</span>}
            {syncStatus === 'error' && <span className="text-red-600">Sync failed</span>}
          </div>
        </CardContent>
      </Card>

      {/* Currency Exchange Rate */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Exchange Rate</p>
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
                    Update
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
              <div className="space-y-3">
                <p className="text-xl font-bold text-blue-600">
                  {getFromCurrencySymbol()}{exchangeRate.toFixed(2)} = {getToCurrencySymbol()}1.00
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditingRate(true)}
                  className="flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit Rate & Currencies
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
            type="number"
            placeholder={`Price in ${fromCurrency}`}
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
          />

          {!capturedPhoto ? (
            <div className="space-y-2">
              <Button onClick={startCamera} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                Upload from Gallery
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <img 
                src={capturedPhoto} 
                alt="Product" 
                className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
              />
              <div className="flex gap-2">
                <Button onClick={() => setCapturedPhoto('')} variant="outline" className="flex-1">
                  Retake
                </Button>
                <Button 
                  onClick={addItem} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isCreating}
                >
                  {isCreating ? 'Adding...' : 'Add Item'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Camera View */}
      {showCamera && (
        <Card>
          <CardContent className="p-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg bg-gray-100"
            />
            <div className="flex gap-2 mt-3">
              <Button onClick={capturePhoto} className="flex-1">
                📸 Capture
              </Button>
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Summary Cards */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">Total Items</p>
              <p className="text-lg font-bold text-blue-600">
                {getToCurrencySymbol()}{getTotalConverted().toFixed(2)}
              </p>
              <p className="text-sm text-red-500">
                {getFromCurrencySymbol()}{getTotalOriginal().toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">{items.length} items</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">Purchased</p>
              <p className="text-lg font-bold text-green-600">
                {getToCurrencySymbol()}{getPurchasedTotal().toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                {getPurchasedCount()} of {items.length} bought
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {sortedItems.map(item => (
          <Card 
            key={item.id} 
            className={`hover:shadow-md transition-shadow ${
              item.liked ? 'ring-2 ring-pink-200 bg-pink-50' : ''
            } ${item.purchased ? 'opacity-75 bg-gray-50' : ''}`}
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
                <div className="flex gap-3">
                  <div className="relative">
                    <img 
                      src={item.photo} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border flex-shrink-0"
                    />
                    <div className="absolute -top-2 -right-2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleLike(item)}
                        className="h-6 w-6 rounded-full bg-white shadow-md hover:bg-pink-50"
                      >
                        <Heart 
                          className={`w-3 h-3 ${item.liked ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} 
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePurchased(item)}
                        className="h-6 w-6 rounded-full bg-white shadow-md hover:bg-green-50"
                      >
                        <ShoppingCart 
                          className={`w-3 h-3 ${item.purchased ? 'fill-green-500 text-green-500' : 'text-gray-400'}`} 
                        />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-gray-900 truncate text-lg ${item.purchased ? 'line-through' : ''}`}>
                      {item.name}
                    </h3>
                    <div className="mt-1">
                      <p className="text-2xl font-bold text-green-600">
                        {getToCurrencySymbol()}{item.price_converted.toFixed(2)}
                      </p>
                      <p className="text-sm font-semibold text-red-500">
                        {getFromCurrencySymbol()}{item.price_original.toFixed(0)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{item.timestamp}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => startEditing(item)}
                      className="flex-shrink-0 hover:bg-blue-50 hover:border-blue-200"
                    >
                      <Edit3 className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteItem(item.id)}
                      className="flex-shrink-0 hover:bg-red-50 hover:border-red-200"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && !isLoading && (
        <Card className="border-dashed border-2">
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
  );
};

export default ShoppingTracker;
