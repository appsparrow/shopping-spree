
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Camera, Plus, Trash2, ShoppingBag, RefreshCw, Edit3 } from 'lucide-react';

interface ShoppingItem {
  id: string;
  name: string;
  photo: string;
  priceYen: number;
  priceUsd: number;
  timestamp: string;
}

const ShoppingTracker = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(150);
  const [customRate, setCustomRate] = useState<string>('');
  const [editingRate, setEditingRate] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load items and exchange rate from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem('shoppingItems');
    const savedRate = localStorage.getItem('exchangeRate');
    
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
    
    if (savedRate) {
      setExchangeRate(parseFloat(savedRate));
    } else {
      fetchExchangeRate();
    }
  }, []);

  // Save items and rate to localStorage
  useEffect(() => {
    localStorage.setItem('shoppingItems', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('exchangeRate', exchangeRate.toString());
  }, [exchangeRate]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
      const data = await response.json();
      const newRate = 1 / data.rates.USD;
      setExchangeRate(newRate);
      console.log('Exchange rate updated:', newRate);
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
    }
  };

  const updateCustomRate = () => {
    const rate = parseFloat(customRate);
    if (rate && rate > 0) {
      setExchangeRate(rate);
      setEditingRate(false);
      setCustomRate('');
      // Recalculate USD prices for existing items
      setItems(prevItems => 
        prevItems.map(item => ({
          ...item,
          priceUsd: item.priceYen / rate
        }))
      );
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
        setCapturedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    if (newItemName.trim() && newItemPrice && capturedPhoto) {
      const priceYen = parseFloat(newItemPrice);
      const priceUsd = priceYen / exchangeRate;
      
      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        photo: capturedPhoto,
        priceYen,
        priceUsd,
        timestamp: new Date().toLocaleString()
      };

      setItems([newItem, ...items]);
      setNewItemName('');
      setNewItemPrice('');
      setCapturedPhoto('');
    }
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getTotalYen = () => {
    return items.reduce((sum, item) => sum + item.priceYen, 0);
  };

  const getTotalUsd = () => {
    return items.reduce((sum, item) => sum + item.priceUsd, 0);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-20">
      {/* Exchange Rate Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Current Exchange Rate</p>
            {editingRate ? (
              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Enter JPY rate"
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
                <p className="text-2xl font-bold text-blue-600">
                  ¥{exchangeRate.toFixed(2)} = $1.00 USD
                </p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchExchangeRate}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditingRate(true)}
                    className="flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </Button>
                </div>
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
            placeholder="Price in ¥"
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
                <Button onClick={addItem} className="flex-1 bg-green-600 hover:bg-green-700">
                  Add Item
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

      {/* Total Summary */}
      {items.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-green-600">
                ¥{getTotalYen().toFixed(0)}
              </p>
              <p className="text-lg font-semibold text-green-500">
                ${getTotalUsd().toFixed(2)} USD
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {items.length} item{items.length !== 1 ? 's' : ''} purchased
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {items.map(item => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <img 
                  src={item.photo} 
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg border flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate text-lg">{item.name}</h3>
                  <div className="mt-1">
                    <p className="text-xl font-bold text-blue-600">
                      ¥{item.priceYen.toFixed(0)}
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      ${item.priceUsd.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.timestamp}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteItem(item.id)}
                  className="flex-shrink-0 hover:bg-red-50 hover:border-red-200"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center text-gray-500">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No items yet</h3>
            <p className="text-sm">Start tracking your shopping by taking a photo and adding your first purchase!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShoppingTracker;
