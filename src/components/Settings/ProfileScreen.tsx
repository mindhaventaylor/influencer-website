import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Check, ArrowLeft } from 'lucide-react';
import { getClientInfluencerInfo } from '@/lib/clientConfig';
import { useAuth } from '@/hooks/useAuth';
import PlansModal from '@/components/Payment/PlansModal';

interface ProfileScreenProps {
  onEditProfile: () => void;
  onManageSubscription: () => void;
  onDeleteAccount: () => void;
  onSignOut: () => void;
}

export default function ProfileScreen({ 
  onEditProfile, 
  onManageSubscription, 
  onDeleteAccount,
  onSignOut
}: ProfileScreenProps) {
  const { user } = useAuth();
  const influencer = getClientInfluencerInfo();
  const [showPlansModal, setShowPlansModal] = useState(false);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#0F0F10' }}>
      {/* Top Navigation */}
      <div className="flex items-center justify-center px-6 py-4" style={{ backgroundColor: '#1B1B1D' }}>
        <h1 className="text-lg font-medium" style={{ color: '#EDEDED' }}>Profile</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="max-w-md mx-auto lg:max-w-2xl">
          {/* Hero Card */}
          <div className="bg-gray-900 rounded-2xl p-8 mb-8 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-gray-600">
              <img 
                src={user?.avatarUrl || influencer.avatarUrl} 
                alt={user?.displayName || influencer.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold mb-1" style={{ color: '#EDEDED' }}>
              {user?.displayName || 'John Smith'}
            </h2>
            <p className="text-sm mb-4" style={{ color: '#A6A6AA' }}>Premium Member</p>
            
            <h3 className="text-2xl font-bold mb-6" style={{ color: '#EDEDED' }}>TaylorAI Plus</h3>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center space-x-3">
                <Check className="w-5 h-5" style={{ color: '#EDEDED' }} />
                <span style={{ color: '#EDEDED' }}>Unlimited Chats</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Check className="w-5 h-5" style={{ color: '#EDEDED' }} />
                <span style={{ color: '#EDEDED' }}>Unlimited Calls</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Check className="w-5 h-5" style={{ color: '#EDEDED' }} />
                <span style={{ color: '#EDEDED' }}>Unlimited Images</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Check className="w-5 h-5" style={{ color: '#EDEDED' }} />
                <span style={{ color: '#EDEDED' }}>$4.99 / Month</span>
              </div>
            </div>
            
            <Button
              onClick={() => setShowPlansModal(true)}
              className="w-full h-12 rounded-3xl font-semibold"
              style={{ 
                backgroundColor: '#2C2C2E', 
                color: '#EDEDED',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
            >
              Upgrade Now
            </Button>
          </div>

          {/* Settings List */}
          <div className="space-y-2">
            <button
              onClick={onEditProfile}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-800 transition-colors"
              style={{ backgroundColor: '#232325', height: '56px' }}
            >
              <span style={{ color: '#EDEDED' }}>Email & Password</span>
              <ChevronRight className="w-5 h-5" style={{ color: '#A6A6AA' }} />
            </button>

            <button
              onClick={onManageSubscription}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-800 transition-colors"
              style={{ backgroundColor: '#232325', height: '56px' }}
            >
              <span style={{ color: '#EDEDED' }}>Manage Subscription</span>
              <ChevronRight className="w-5 h-5" style={{ color: '#A6A6AA' }} />
            </button>

            <button
              onClick={onDeleteAccount}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-800 transition-colors"
              style={{ backgroundColor: '#232325', height: '56px' }}
            >
              <span style={{ color: '#EDEDED' }}>Delete Account</span>
              <ChevronRight className="w-5 h-5" style={{ color: '#A6A6AA' }} />
            </button>

            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-800 transition-colors"
              style={{ backgroundColor: '#232325', height: '56px' }}
            >
              <span style={{ color: '#E84A4A' }}>Sign Out</span>
              <ChevronRight className="w-5 h-5" style={{ color: '#A6A6AA' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Plans Modal */}
      <PlansModal 
        isOpen={showPlansModal} 
        onClose={() => setShowPlansModal(false)} 
      />
    </div>
  );
}