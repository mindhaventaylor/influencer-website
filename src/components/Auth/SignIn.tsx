import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/api';
import { getClientInfluencerInfo } from '@/lib/clientConfig';
import { getUserFriendlyError } from '@/lib/errorMessages';

interface SignInProps {
  onSignInSuccess: (user: { id: string; email: string; token: string }) => void;
  onSwitchToSignUp: () => void;
}

export default function SignIn({ onSignInSuccess, onSwitchToSignUp }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const influencer = getClientInfluencerInfo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.signIn(email, password);
      
      if (response.success && response.user) {
        onSignInSuccess(response.user);
      } else {
        setError(response.error || 'Sign in failed');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(getUserFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F0F10' }}>
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 py-3" style={{ backgroundColor: '#1B1B1D', height: '88px' }}>
        <span className="text-sm font-medium" style={{ color: '#EDEDED' }}>9:41</span>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-2 rounded-sm" style={{ backgroundColor: '#EDEDED' }}></div>
          <div className="w-4 h-2 rounded-sm" style={{ backgroundColor: '#EDEDED' }}></div>
          <div className="w-4 h-2 rounded-sm" style={{ backgroundColor: '#EDEDED' }}></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-md mx-auto lg:max-w-lg xl:max-w-xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium mb-8" style={{ color: '#EDEDED' }}>
              Welcome to Project Taylor
            </h1>
            
            {/* Profile Card */}
            <div className="w-36 h-36 mx-auto mb-4 rounded-3xl overflow-hidden shadow-lg">
              <img 
                src={influencer.avatarUrl} 
                alt={influencer.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            
            <h2 className="text-lg font-semibold mb-8" style={{ color: '#EDEDED' }}>Sign In</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs mb-2" style={{ color: '#B8B8B8' }}>
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full h-12 px-4 rounded-2xl border-0 text-white transition-all shadow-inner"
              style={{ 
                backgroundColor: '#232325',
                borderRadius: '20px',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
              }}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs mb-2" style={{ color: '#B8B8B8' }}>
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full h-12 px-4 pr-12 rounded-2xl border-0 text-white transition-all shadow-inner"
                style={{ 
                  backgroundColor: '#232325',
                  borderRadius: '20px',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors"
                style={{ color: '#7C7C81' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 h-11 rounded-2xl border-0 transition-all flex items-center justify-center"
              style={{ 
                backgroundColor: '#232325',
                borderRadius: '20px'
              }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button
              type="button"
              className="flex-1 h-11 rounded-2xl border-0 transition-all flex items-center justify-center"
              style={{ 
                backgroundColor: '#232325',
                borderRadius: '20px'
              }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#FFFFFF" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {typeof error === 'string' ? error : error.message || 'An error occurred'}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-3xl border-0 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{ 
              backgroundColor: '#2C2C2E',
              borderRadius: '24px',
              color: '#EDEDED',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="mt-8 text-center">
            <p className="text-sm mb-2" style={{ color: '#A6A6AA' }}>
              Don't Have an Account?{' '}
              <button
                onClick={onSwitchToSignUp}
                className="font-medium transition-colors"
                style={{ color: '#E84A4A' }}
              >
                Sign Up
              </button>
            </p>
            <p className="text-xs" style={{ color: '#8A8A8F' }}>Must be 18+</p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}