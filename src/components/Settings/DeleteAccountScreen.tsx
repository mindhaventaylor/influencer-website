import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface DeleteAccountScreenProps {
  onGoBack: () => void;
}

export default function DeleteAccountScreen({ onGoBack }: DeleteAccountScreenProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    setError(null);
    setIsLoading(true);

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          reason,
        }),
      });

      if (response.ok) {
        // Account deletion successful
        alert('Your account has been deleted successfully.');
        // Redirect to sign out or home page
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete account');
      }
    } catch (err) {
      setError('An error occurred while deleting your account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#0F0F10' }}>
      {/* Top Navigation */}
      <div className="flex items-center px-6 py-4" style={{ backgroundColor: '#1B1B1D' }}>
        <Button 
          variant="ghost" 
          onClick={onGoBack} 
          className="p-2 rounded-xl"
          style={{ color: '#EDEDED' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-medium ml-4" style={{ color: '#EDEDED' }}>Delete Account</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-md mx-auto lg:max-w-lg xl:max-w-xl w-full">
          {/* Section Title */}
          <h2 className="text-sm font-semibold mb-6" style={{ color: '#EDEDED' }}>
            Account Deletion Request
          </h2>

          {/* Form */}
          <div className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#B8B8B8' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full h-12 px-4 rounded-2xl border-0"
              style={{ 
                backgroundColor: '#232325', 
                color: '#EDEDED',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#B8B8B8' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-12 px-4 rounded-2xl border-0"
              style={{ 
                backgroundColor: '#232325', 
                color: '#EDEDED',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
              }}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#B8B8B8' }}>Confirm your password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full h-12 px-4 rounded-2xl border-0"
              style={{ 
                backgroundColor: '#232325', 
                color: '#EDEDED',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
              }}
            />
          </div>

          {/* Reason Textarea */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#B8B8B8' }}>
              Why are you deleting your account?
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Type here"
              rows={5}
              className="w-full px-4 py-3 rounded-2xl border-0 resize-none"
              style={{ 
                backgroundColor: '#232325', 
                color: '#EDEDED',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
                minHeight: '120px'
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {typeof error === 'string' ? error : error.message || 'An error occurred'}
            </div>
          )}

          {/* Delete Account Button */}
          <Button
            onClick={handleDeleteAccount}
            disabled={isLoading}
            className="w-full h-12 rounded-3xl font-semibold"
            style={{ 
              backgroundColor: '#2C2C2E', 
              color: '#EDEDED',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}
          >
            {isLoading ? 'Deleting Account...' : 'Delete Account'}
          </Button>
          </div>
        </div>
      </div>

    </div>
  );
}