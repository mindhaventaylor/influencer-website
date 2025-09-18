import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, ChevronRight, CreditCard, Crown, Zap, Phone, Mail, Globe, Instagram, Twitter, MessageCircle } from 'lucide-react';
import BottomNavigation from '@/components/ui/BottomNavigation';
import { getClientInfluencerInfo } from '@/lib/clientConfig';
import { TokenBalance } from '@/components/TokenManagement/TokenBalance';
import { PurchaseButton } from '@/components/Payment/PurchaseButton';
import { useAuth } from '@/hooks/useAuth';

interface ProfileScreenProps {
  onEditProfile: () => void;
  onManageSubscription: () => void;
  onDeleteAccount: () => void;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  interval: string;
  features: string[];
  access_level: string;
  is_popular?: boolean;
  stripe_price_id?: string;
}

export default function ProfileScreen({ 
  onEditProfile, 
  onManageSubscription, 
  onDeleteAccount 
}: ProfileScreenProps) {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<any>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const influencer = getClientInfluencerInfo();

  useEffect(() => {
    // Fetch user plan information and available plans
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user subscription
        const subscriptionResponse = await fetch(`/api/subscription/user/${user.id}`);
        if (subscriptionResponse.ok) {
          const subscriptionData = await subscriptionResponse.json();
          setUserPlan(subscriptionData.subscription);
        }

        // Fetch available plans
        const plansResponse = await fetch('/api/plans');
        if (plansResponse.ok) {
          const plansData = await plansResponse.json();
          setPlans(plansData.plans || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const getPlanIcon = (planName: string) => {
    if (planName?.toLowerCase().includes('premium')) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (planName?.toLowerCase().includes('pro')) return <Zap className="w-5 h-5 text-blue-500" />;
    return <CreditCard className="w-5 h-5 text-gray-500" />;
  };

  const getPlanColor = (planName: string) => {
    if (planName?.toLowerCase().includes('premium')) return 'text-yellow-400';
    if (planName?.toLowerCase().includes('pro')) return 'text-blue-400';
    return 'text-gray-400';
  };

  // Get the first available plan for the purchase button
  const defaultPlan = plans.length > 0 ? plans[0] : null;

  return (
    <div className="flex flex-col h-screen-mobile bg-black text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-red-500">
            <img 
              src={user?.avatarUrl || influencer.avatarUrl} 
              alt={user?.displayName || influencer.displayName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{user?.displayName || 'User'}</h1>
            <p className="text-gray-400">{user?.email}</p>
            {userPlan && (
              <div className="flex items-center space-x-2 mt-2">
                {getPlanIcon(userPlan.planName)}
                <span className={`text-sm font-medium ${getPlanColor(userPlan.planName)}`}>
                  {userPlan.planName}
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={onEditProfile}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Profile Details */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Profile Details</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{user?.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Username</p>
                <p className="text-white">{user?.username || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Website</p>
                <p className="text-white">{influencer.websiteUrl || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Social Media</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Instagram className="w-5 h-5 text-pink-500" />
              <div>
                <p className="text-sm text-gray-400">Instagram</p>
                <p className="text-white">{influencer.socialMedia.instagram || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Twitter className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Twitter</p>
                <p className="text-white">{influencer.socialMedia.twitter || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Token Balance */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Token Balance</h2>
          {user?.id ? (
            <TokenBalance userId={user.id} influencerId={influencer.id} />
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">Please sign in to view your token balance</p>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Account Settings</h2>
          
          <div className="space-y-3">
            <button
              onClick={onManageSubscription}
              className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="text-white">Manage Subscription</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={onEditProfile}
              className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Edit className="w-5 h-5 text-gray-400" />
                <span className="text-white">Edit Profile</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={onDeleteAccount}
              className="w-full flex items-center justify-between p-4 bg-red-900/20 rounded-xl hover:bg-red-900/30 transition-colors text-red-400"
            >
              <div className="flex items-center space-x-3">
                <span className="text-red-400">Delete Account</span>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>

        {/* Purchase Tokens */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Purchase Tokens</h2>
          {defaultPlan ? (
            <PurchaseButton 
              plan={defaultPlan}
              influencerId={influencer.id}
            />
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">No plans available</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}