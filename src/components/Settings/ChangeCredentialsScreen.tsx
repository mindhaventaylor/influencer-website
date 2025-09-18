import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ChangeCredentialsScreenProps {
  onGoBack: () => void;
}

export default function ChangeCredentialsScreen({ onGoBack }: ChangeCredentialsScreenProps) {
  const { user } = useAuth();
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Validate email fields
    if (newEmail && newEmail !== confirmNewEmail) {
      setError('New email addresses do not match');
      setIsLoading(false);
      return;
    }

    // Validate password fields
    if (newPassword && newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/change-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentEmail,
          newEmail: newEmail || undefined,
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      });

      if (response.ok) {
        setSuccess('Your credentials have been updated successfully');
        // Clear form
        setCurrentEmail('');
        setNewEmail('');
        setConfirmNewEmail('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update credentials');
      }
    } catch (err) {
      setError('An error occurred while updating your credentials');
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
        <h1 className="text-lg font-medium ml-4" style={{ color: '#EDEDED' }}>Username & Password</h1>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-24">
        <div className="max-w-md mx-auto lg:max-w-lg xl:max-w-xl w-full">
          {/* Section Header */}
          <h2 className="text-lg font-semibold mb-6" style={{ color: '#EDEDED' }}>
            Change Email & Password
          </h2>

          {/* Form */}
          <div className="space-y-8">
          {/* Email Group */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium" style={{ color: '#B8B8B8' }}>Email</h3>
            
            <div>
              <input
                type="email"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                placeholder="Enter your current email"
                className="w-full h-12 px-4 rounded-2xl border-0"
                style={{ 
                  backgroundColor: '#232325', 
                  color: '#EDEDED',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>

            <div>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter your new email"
                className="w-full h-12 px-4 rounded-2xl border-0"
                style={{ 
                  backgroundColor: '#232325', 
                  color: '#EDEDED',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>

            <div>
              <input
                type="email"
                value={confirmNewEmail}
                onChange={(e) => setConfirmNewEmail(e.target.value)}
                placeholder="Confirm your new email"
                className="w-full h-12 px-4 rounded-2xl border-0"
                style={{ 
                  backgroundColor: '#232325', 
                  color: '#EDEDED',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>
          </div>

          {/* Password Group */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium" style={{ color: '#B8B8B8' }}>Password</h3>
            
            <div>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full h-12 px-4 rounded-2xl border-0"
                style={{ 
                  backgroundColor: '#232325', 
                  color: '#EDEDED',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>

            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="w-full h-12 px-4 rounded-2xl border-0"
                style={{ 
                  backgroundColor: '#232325', 
                  color: '#EDEDED',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>

            <div>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full h-12 px-4 rounded-2xl border-0"
                style={{ 
                  backgroundColor: '#232325', 
                  color: '#EDEDED',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {typeof error === 'string' ? error : error.message || 'An error occurred'}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full h-12 rounded-3xl font-semibold"
            style={{ 
              backgroundColor: '#2C2C2E', 
              color: '#EDEDED',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
