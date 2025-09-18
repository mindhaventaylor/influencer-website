import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CancelSubscriptionScreenProps {
  onGoBack: () => void;
}

export default function CancelSubscriptionScreen({ onGoBack }: CancelSubscriptionScreenProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancelSubscription = async () => {
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
      const response = await fetch('/api/subscription/cancel', {
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
        // Subscription cancellation successful
        alert('Your subscription has been cancelled successfully.');
        onGoBack();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to cancel subscription');
      }
    } catch (err) {
      setError('An error occurred while cancelling your subscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#0F0F10' }}>
      {/* Top Navigation */}
      <div className="flex items-center px-6 py-4 flex-shrink-0" style={{ backgroundColor: '#1B1B1D' }}>
        <Button 
          variant="ghost" 
          onClick={onGoBack} 
          className="p-2 rounded-xl"
          style={{ color: '#EDEDED' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-medium ml-4" style={{ color: '#EDEDED' }}>Cancel Subscription</h1>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-24">
        <div className="max-w-md mx-auto lg:max-w-lg xl:max-w-xl w-full">
          {/* Section Header */}
          <h2 className="text-lg font-semibold mb-6" style={{ color: '#EDEDED' }}>
            Subscription Cancellation
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
              Why are you canceling your subscription?
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

          {/* Cancel Subscription Button */}
          <Button
            onClick={handleCancelSubscription}
            disabled={isLoading}
            className="w-full h-12 rounded-3xl font-semibold"
            style={{ 
              backgroundColor: '#2C2C2E', 
              color: '#EDEDED',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}
          >
            {isLoading ? 'Cancelling Subscription...' : 'Cancel Subscription'}
          </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
