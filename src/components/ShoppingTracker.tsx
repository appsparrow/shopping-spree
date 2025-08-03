import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Camera, Plus, Trash2, ShoppingBag } from 'lucide-react';

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
  const [exchangeRate, setExchangeRate] = useState<number>(150); // Default fallback rate
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load items from localStorage on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem('shoppingItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
    
    // Fetch current exchange rate (using a free API)
    fetchExchangeRate();
  }, []);

  // Save items to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('shoppingItems', JSON.stringify(items));
  }, [items]);

  const fetchExchangeRate = async () => {
    try {
      // Using a free exchange rate API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
      const data = await response.json();
      setExchangeRate(1 / data.rates.USD); // Convert to JPY per USD
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      // Keep default rate if API fails
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback to file input
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
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Exchange Rate Display */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Shopping Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-sm text-gray-600">Current Rate</p>
            <p className="text-xl font-bold text-blue-600">
              ¥{exchangeRate.toFixed(2)} = $1.00 USD
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchExchangeRate}
              className="mt-2"
            >
              Refresh Rate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add New Item */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Item name"
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                Upload Photo
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <img 
                src={capturedPhoto} 
                alt="Captured" 
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="flex gap-2">
                <Button onClick={() => setCapturedPhoto('')} variant="outline" className="flex-1">
                  Retake
                </Button>
                <Button onClick={addItem} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
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
              className="w-full rounded-lg"
            />
            <div className="flex gap-2 mt-2">
              <Button onClick={capturePhoto} className="flex-1">
                Capture
              </Button>
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Summary */}
      {items.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-lg font-bold text-green-600">
                ¥{getTotalYen().toFixed(0)} = ${getTotalUsd().toFixed(2)} USD
              </p>
              <p className="text-xs text-gray-500">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {items.map(item => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <img 
                  src={item.photo} 
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{item.name}</h3>
                  <p className="text-lg font-bold text-blue-600">
                    ¥{item.priceYen.toFixed(0)}
                  </p>
                  <p className="text-sm text-gray-600">
                    ${item.priceUsd.toFixed(2)} USD
                  </p>
                  <p className="text-xs text-gray-400">{item.timestamp}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteItem(item.id)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No items yet</p>
            <p className="text-sm">Take a photo and add your first purchase!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShoppingTracker;
