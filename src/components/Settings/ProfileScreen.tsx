import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, ChevronRight, CreditCard, Crown, Zap } from 'lucide-react';
import BottomNavigation from '@/components/ui/BottomNavigation';
import { getInfluencerInfo, getPlans } from '@/lib/config';
import { TokenBalance } from '@/components/TokenManagement/TokenBalance';
import { PurchaseButton } from '@/components/Payment/PurchaseButton';
import { useAuth } from '@/hooks/useAuth';

interface ProfileScreenProps {
  onGoToChat: () => void;
  onGoToSettings: () => void;
  onGoToDeleteAccount: () => void;
}

interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

interface Subscription {
  subscription: any;
  plan: any;
  influencer: any;
}

const ProfileScreen = ({ onGoToChat, onGoToSettings, onGoToDeleteAccount }: ProfileScreenProps) => {
  const { user, loading: authLoading } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const influencer = getInfluencerInfo();

  useEffect(() => {
    fetchUserData();
  }, [user]); // Refetch when user changes

  const fetchUserData = async () => {
    if (authLoading) return; // Wait for auth to load
    
    setLoading(true);
    try {
      // Fetch user subscriptions from API if user is authenticated
      if (user) {
        try {
          const response = await fetch(`/api/subscription/user/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setSubscriptions(data.subscriptions || []);
          }
        } catch (error) {
          console.error('Error fetching subscriptions:', error);
          setSubscriptions([]);
        }
      } else {
        setSubscriptions([]);
      }

      // Fetch plans from database (always fetch plans, regardless of user)
      try {
        const plansResponse = await fetch('/api/plans/database');
        if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        // The API returns plans directly as an array, not wrapped in a 'plans' property
        setAvailablePlans(plansData || []);
        } else {
          // Fallback to config plans if database fetch fails
          setAvailablePlans(getPlans());
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        // Fallback to config plans
        setAvailablePlans(getPlans());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error opening subscription management:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col h-screen-mobile bg-black text-white">
        <header className="flex items-center justify-center py-4 px-4" style={{ backgroundColor: '#212121' }}>
          <h1 className="text-xl font-bold">Profile</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen-mobile bg-black text-white">
      <header className="flex items-center justify-center py-4 px-4" style={{ backgroundColor: '#212121' }}>
        <h1 className="text-xl font-bold">Profile</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        {/* Profile Section */}
        <div className="flex flex-col items-center py-4 px-6">
          <div className="relative mb-3">
            <img 
              src={user?.avatarUrl || "/default_avatar.png"} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover"
            />
            <button className="absolute bottom-1 right-1 bg-black bg-opacity-60 p-1.5 rounded-full">
              <Edit className="h-4 w-4 text-white" />
            </button>
          </div>
          
          <h2 className="text-xl font-bold mb-1">{user?.displayName || 'User'}</h2>
          <p className="text-gray-400 mb-4 text-sm">{user?.email}</p>
          
          {/* Subscription Status */}
          {subscriptions.length > 0 ? (
            <div className="w-full max-w-sm bg-gray-900 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-2">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Active Subscriptions</p>
                    <p className="text-gray-400 text-xs">{subscriptions.length} subscription(s)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{subscriptions.length}</p>
                  <p className="text-gray-400 text-xs">active</p>
                </div>
              </div>
              
              <Button 
                onClick={handleManageSubscription}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full py-2 text-sm"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscriptions
              </Button>
            </div>
          ) : (
            <div className="w-full max-w-sm bg-gray-900 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-sm font-bold">F</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Free Plan</p>
                    <p className="text-gray-400 text-xs">Limited access</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">$0</p>
                  <p className="text-gray-400 text-xs">per month</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs">3</span>
                  </div>
                  <span className="text-white text-sm">3 messages per day</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs">B</span>
                  </div>
                  <span className="text-white text-sm">Basic responses only</span>
                </div>
              </div>
              
              <Button 
                onClick={() => onGoToChat()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-full py-2 text-sm"
              >
                Browse {influencer.displayName} Plans
              </Button>
            </div>
          )}
        </div>
        
        {/* Token Balance */}
        {user && (
          <div className="px-6 mb-6">
            <TokenBalance userId={user.id} />
          </div>
        )}

        {/* Available Plans */}
        {subscriptions.length === 0 && (
          <div className="px-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Available Plans ({availablePlans.length})
            </h3>
            
            {!user ? (
              <div className="bg-yellow-500/10 border border-yellow-500 p-4 rounded-lg">
                <p className="text-yellow-400 text-sm mb-3">
                  ⚠️ Please create a user account to purchase plans
                </p>
                <Button 
                  onClick={() => window.location.href = '/signin'}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Sign In to Purchase
                </Button>
              </div>
            ) : availablePlans.length === 0 ? (
              <div className="bg-gray-500/10 border border-gray-500 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">
                  No plans available at the moment. Please try again later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availablePlans.map((plan) => (
                  <PurchaseButton
                    key={plan.id}
                    plan={plan}
                    influencerId={influencer.id}
                    onPurchaseSuccess={() => {
                      // Refresh subscriptions and token balance after purchase
                      fetchUserData();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Menu Items */}
        <div className="px-6 space-y-4">
          <button className="flex items-center justify-between w-full text-left">
            <span className="text-lg text-white">Email & Password</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
          
          <button 
            className="flex items-center justify-between w-full text-left"
            onClick={handleManageSubscription}
          >
            <span className="text-lg text-white">Manage Subscription</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
          
          <button 
            className="flex items-center justify-between w-full text-left"
            onClick={onGoToDeleteAccount}
          >
            <span className="text-lg text-white">Delete Account</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
      
      <BottomNavigation 
        currentScreen="profile" 
        onGoToChat={onGoToChat} 
        onGoToSettings={onGoToSettings}
        onGoToProfile={() => {}}
      />
    </div>
  );
};

export default ProfileScreen;