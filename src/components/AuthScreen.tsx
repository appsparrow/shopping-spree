
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MapPin } from 'lucide-react';

interface AuthScreenProps {
  onLogin: () => void;
}

const AuthScreen = ({ onLogin }: AuthScreenProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      onLogin();
    } else {
      setError('Invalid PIN. Try again.');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Plan & Go</h1>
          <p className="text-gray-600 mb-8">Your personal travel companion</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 4-digit PIN
              </label>
              <Input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                className="text-center text-lg tracking-widest"
                placeholder="••••"
                autoFocus
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Enter
            </Button>
          </form>
          
          <p className="text-xs text-gray-500 mt-6">
            Welcome back, Kiran! 🌟
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
